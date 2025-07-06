const shippo = require('shippo')(process.env.SHIPPO_TEST_API_KEY || process.env.SHIPPO_API_KEY);
if (!shippo) {
  throw new Error("Shippo API Key is missing");
}

exports.handler = async (event) => {
  const { toAddress, fromAddress, weight_oz } = JSON.parse(event.body);

  try {
    const shipment = await shippo.shipment.create({
      address_from: fromAddress,
      address_to: toAddress,
      parcels: [{
        length: "5",
        width: "5",
        height: "5",
        distance_unit: "in",
        weight: weight_oz,
        mass_unit: "oz"
      }],
      async: false
    });

    const rates = shipment.rates; // contains USPS and other carrier rates

    return {
      statusCode: 200,
      body: JSON.stringify(rates),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
