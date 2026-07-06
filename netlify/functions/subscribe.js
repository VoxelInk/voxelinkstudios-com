// Subscribes an email to the Kit (ConvertKit) form via the v3 API.
// Form posts from the site itself get quarantined by Kit's bot guard;
// the API path does not, and it returns a real success/failure we can
// show the visitor instead of guessing.
exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let email;
  try {
    ({ email } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Bad request' }) };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Invalid email' }) };
  }

  const FORM_ID = '9367043';
  // v3 api_key is Kit's public client-side key; the api_secret is never used here.
  const API_KEY = process.env.KIT_API_KEY || 'r1EKNphsktMsbu5252Odww';

  try {
    const res = await fetch(`https://api.convertkit.com/v3/forms/${FORM_ID}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: API_KEY, email }),
    });
    const data = await res.json();
    if (res.ok && data.subscription) {
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }
    return { statusCode: 502, body: JSON.stringify({ ok: false, error: data.message || 'Subscription failed' }) };
  } catch {
    return { statusCode: 502, body: JSON.stringify({ ok: false, error: 'Could not reach the mailing list service' }) };
  }
};
