// netlify/functions/create-checkout-session.js
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-supabase-auth',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' };
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    // --- env guards (don’t crash)
    const { STRIPE_SECRET_KEY, CLIENT_URL, SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
    if (!STRIPE_SECRET_KEY) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY' }) };
    if (!CLIENT_URL) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Missing CLIENT_URL' }) };

    const stripe = new Stripe(STRIPE_SECRET_KEY);

    let body = {};
    try { body = JSON.parse(event.body || '{}'); } catch (_) {}
    const { cartItems, shipping_rate, coupon_code } = body;

    // Optional: Supabase token so we can rebuild line items from DB (safer)
    const accessToken = event.headers['x-supabase-auth'] || event.headers['X-Supabase-Auth'];

    // ---- 1) Build line_items
    let line_items = [];
    if (accessToken && SUPABASE_URL && SUPABASE_ANON_KEY) {
      // Use RLS-scoped client (ANON + user token)
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      });

      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: cartRows, error } = await supabase
          .from('cart')
          .select('title, price, quantity, color_choice, custom_name, image_url');
        if (error) {
          console.warn('cart query error:', error.message);
        } else if (cartRows?.length) {
          line_items = cartRows.map((item) => ({
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.title,
                description: `Color: ${item.color_choice || ''} Engraving: ${item.custom_name || ''}`.trim(),
                images: item.image_url ? [item.image_url] : undefined, // must be https
              },
              unit_amount: Math.round(Number(item.price) * 100),
            },
            quantity: Number(item.quantity || 1),
            adjustable_quantity: { enabled: false },
          }));
        }
      }
    }

    // Fallback to client-provided items if we didn’t build from DB
    if (!line_items.length && Array.isArray(cartItems)) {
      line_items = cartItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
            description: `Color: ${item.color_choice || ''} Engraving:${item.custom_name || ''}`.trim(),
            images: item.image_url ? [item.image_url] : undefined,
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: Number(item.quantity || 1),
        adjustable_quantity: { enabled: false },
      }));
    }

    if (!line_items.length) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'No line items' }) };
    }

    // ---- 2) Fixed shipping option from your Shippo rate (optional but recommended)
    let shipping_options;
    if (shipping_rate && shipping_rate.amount != null) {
      const shippingCents = Math.max(0, Math.round(Number(shipping_rate.amount) * 100));
      const shippingDisplay =
        (shipping_rate.provider || 'Shipping') +
        (shipping_rate.servicelevel_name ? ` ${shipping_rate.servicelevel_name}` : '');
      shipping_options = [
        {
          shipping_rate_data: {
            display_name: shippingDisplay || 'Shipping',
            type: 'fixed_amount',
            fixed_amount: { amount: shippingCents, currency: shipping_rate.currency || 'usd' },
            delivery_estimate: shipping_rate.estimated_days
              ? {
                  minimum: { unit: 'business_day', value: shipping_rate.estimated_days },
                  maximum: { unit: 'business_day', value: shipping_rate.estimated_days },
                }
              : undefined,
          },
        },
      ];
    }

    // ---- 3) Optional coupon mapping to a Stripe coupon id
    const discounts = [];
    if (coupon_code && coupon_code.toUpperCase() === 'CHEAPSKATE' && process.env.STRIPE_COUPON_ID_CHEAPSKATE) {
      discounts.push({ coupon: process.env.STRIPE_COUPON_ID_CHEAPSKATE });
    }

    // ---- 4) Create the session (same as your old flow, just with options)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      shipping_options, // undefined is fine if you didn’t pass shipping_rate
      allow_promotion_codes: true,
      success_url: `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/cancel`,
      discounts: discounts.length ? discounts : undefined,
      phone_number_collection: { enabled: true },
      customer_creation: 'always',
    });

    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error('create-checkout-session error:', err);
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
