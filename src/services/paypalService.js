const paypal = require('@paypal/checkout-server-sdk');

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env');
  }
  if (process.env.PAYPAL_MODE === 'live') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  }
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

const countryMap = {
  'India': 'IN', 'United States': 'US', 'USA': 'US', 'United Kingdom': 'GB', 'UK': 'GB',
  'UAE': 'AE', 'United Arab Emirates': 'AE',
};

async function createOrder(amount, currency, internalOrderId, items, customerInfo, shippingAddress) {
  const currencyCode = currency || 'USD';

  const paypalItems = (items || []).map(item => ({
    name: String(item.name || 'Item').substring(0, 127),
    quantity: String(item.quantity || 1),
    unit_amount: { currency_code: currencyCode, value: Number(item.price || 0).toFixed(2) },
  }));

  const itemTotal = paypalItems.reduce((sum, i) => sum + parseFloat(i.unit_amount.value) * parseInt(i.quantity), 0);

  const purchaseUnit = {
    reference_id: String(internalOrderId),
    description: `Sampriti Botanicals Order #${internalOrderId}`,
    amount: {
      currency_code: currencyCode,
      value: Number(amount).toFixed(2),
      breakdown: {
        item_total: { currency_code: currencyCode, value: itemTotal.toFixed(2) },
      },
    },
    items: paypalItems,
  };

  const addr = shippingAddress || customerInfo || {};
  if (addr.fullName || addr.building || addr.street) {
    purchaseUnit.shipping = {
      name: { full_name: addr.fullName || customerInfo?.fullName || 'Customer' },
      address: {
        address_line_1: addr.building || '',
        address_line_2: addr.street || '',
        admin_area_2: addr.city || '',
        admin_area_1: addr.state || '',
        postal_code: String(addr.pincode || addr.postal_code || '').replace(/\s/g, ''),
        country_code: countryMap[addr.country] || 'US',
      },
    };
  }

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({ intent: 'CAPTURE', purchase_units: [purchaseUnit] });

  try {
    const response = await client().execute(request);
    return response.result;
  } catch (err) {
    console.error('[paypal] createOrder failed:');
    console.error('  Status:', err.statusCode);
    console.error('  Message:', err.message);
    if (err.details) console.error('  Details:', JSON.stringify(err.details));
    if (err.response?.result) console.error('  Response:', JSON.stringify(err.response.result));
    throw err;
  }
}

async function captureOrder(paypalOrderId) {
  const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
  request.requestBody({});
  const response = await client().execute(request);
  return response.result;
}

async function getOrder(paypalOrderId) {
  const request = new paypal.orders.OrdersGetRequest(paypalOrderId);
  const response = await client().execute(request);
  return response.result;
}

async function verifyWebhookSignature(headers, body) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.warn('[paypal] WEBHOOK_ID not set — skipping webhook verification');
    return false;
  }

  const https = require('https');
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const baseUrl = process.env.PAYPAL_MODE === 'live'
    ? 'api-m.paypal.com'
    : 'api-m.sandbox.paypal.com';

  const postData = JSON.stringify({
    auth_algo: headers['paypal-auth-algo'],
    cert_url: headers['paypal-cert-url'],
    transmission_id: headers['paypal-transmission-id'],
    transmission_sig: headers['paypal-transmission-sig'],
    transmission_time: headers['paypal-transmission-time'],
    webhook_id: webhookId,
    webhook_event: body,
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: baseUrl,
      path: '/v1/notifications/verify-webhook-signature',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.verification_status === 'SUCCESS');
        } catch {
          resolve(false);
        }
      });
    });
    req.on('error', () => resolve(false));
    req.write(postData);
    req.end();
  });
}

module.exports = { createOrder, captureOrder, getOrder, verifyWebhookSignature };
