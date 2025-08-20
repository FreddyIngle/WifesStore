

// netlify/functions/shippo-shipping-rates.js
const SHIPPO_KEY = process.env.SHIPPO_TEST_API_KEY || process.env.SHIPPO_API_KEY;

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: HEADERS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }
  if (!SHIPPO_KEY) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: "Shippo API key is not configured" }) };
  }

  try {
    const { address_to, parcel } = JSON.parse(event.body || "{}");
    if (!address_to || !parcel) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: "address_to and parcel are required" }) };
    }

    // Build your origin here or pull from env
    const address_from = {
      name: "Kyer's Handmades",
      street1: "1749 Village Blvd",
      city: "West Palm Beach",
      state: "FL",
      zip: "33409",
      country: "US"
    };

    const payload = {
      address_from,
      address_to,
      parcels: [parcel],
      async: false // important: return rates now
    };

    const resp = await fetch("https://api.goshippo.com/shipments/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${SHIPPO_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();
    if (!resp.ok) {
      return { statusCode: resp.status, headers: HEADERS, body: JSON.stringify({ error: "Shippo error", details: data }) };
    }

    const rates = (data?.rates || []).map(r => ({
      object_id: r.object_id,
      provider: r.provider,
      servicelevel_name: r.servicelevel?.name,
      amount: r.amount,
      currency: r.currency,
      estimated_days: r.estimated_days
    }));

    rates.sort((a, b) => Number(a.amount) - Number(b.amount));

    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ rates }) };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
