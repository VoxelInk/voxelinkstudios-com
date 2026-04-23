exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let message;
  try {
    ({ message } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: 'Bad request' };
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return { statusCode: 500, body: 'Missing env vars' };
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    })
  });

  if (!resp.ok) {
    const err = await resp.text();
    return { statusCode: 502, body: `Telegram error: ${err}` };
  }

  return { statusCode: 200, body: 'OK' };
};
