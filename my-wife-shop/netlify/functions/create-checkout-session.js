const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-supabase-auth',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { shipping_rate, coupon_code } = JSON.parse(event.body || '{}');

    // 1) REQUIRED: user token from client (supabase.auth.getSession().access_token)
    const supabaseAccessToken = event.headers['x-supabase-auth'];
    if (!supabaseAccessToken) {
      return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Missing auth token' }) };
    }

    // 2) Use ANON key + token so RLS applies
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY, // <— ANON, not service role
      { global: { headers: { Authorization: `Bearer ${supabaseAccessToken}` } } }
    );

    // 3) Verify user
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Unauthenticated' }) };
    }
    const userId = userData.user.id;

    // 4) Pull this user's cart (RLS enforces user_id = auth.uid())
    const { data: cartRows, error: cartErr } = await supabase
      .from('cart')
      .select('title, price, quantity, color_choice, custom_name, image_url');

    if (cartErr) {
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: cartErr.message }) };
    }
    if (!cartRows || cartRows.length === 0) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Cart is empty' }) };
    }

    // 5) Build line items from DB (not trusting the client)
    const line_items = cartRows.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          description: `Color: ${item.color_choice || ''}  Engraving: ${item.custom_name || ''}`.trim(),
          images: item.image_url ? [item.image_url] : undefined,
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Number(item.quantity || 1),
      adjustable_quantity: { enabled: false },
    }));

    // 6) Fixed shipping from your chosen Shippo rate
    const shippingCents = Math.max(0, Math.round(Number(shipping_rate?.amount || 0) * 100));
    const shippingDisplay =
      (shipping_rate?.provider || 'Shipping') +
      (shipping_rate?.servicelevel_name ? ` ${shipping_rate.servicelevel_name}` : '');

    const shipping_options = [
      {
        shipping_rate_data: {
          display_name: shippingDisplay || 'Shipping',
          type: 'fixed_amount',
          fixed_amount: { amount: shippingCents, currency: shipping_rate?.currency || 'usd' },
          delivery_estimate: shipping_rate?.estimated_days
            ? {
                minimum: { unit: 'business_day', value: shipping_rate.estimated_days },
                maximum: { unit: 'business_day', value: shipping_rate.estimated_days },
              }
            : undefined,
        },
      },
    ];

    // 7) Optional: map your “CHEAPSKATE” to a Stripe coupon id
    const discounts = [];
    if (coupon_code && coupon_code.toUpperCase() === 'CHEAPSKATE' && process.env.STRIPE_COUPON_ID_CHEAPSKATE) {
      discounts.push({ coupon: process.env.STRIPE_COUPON_ID_CHEAPSKATE });
    }

    // 8) Create the Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      shipping_options,
      allow_promotion_codes: true,
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      discounts: discounts.length ? discounts : undefined,
      phone_number_collection: { enabled: true },
      customer_creation: 'always',
      metadata: {
        user_id: userId,
        shippo_provider: shipping_rate?.provider || '',
        shippo_service: shipping_rate?.servicelevel_name || '',
        shippo_amount: String(shippingCents),
      },
    });

    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
