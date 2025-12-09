// test-wp-auth.js
export async function handler(event, context) {
  try {
    // Dynamic import of node-fetch
    const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

    const WP_URL = process.env.WP_URL;
    const WP_USER = process.env.WP_USER;
    const WP_PASSWORD = process.env.WP_PASSWORD;

    const response = await fetch(`${WP_URL}/wp-json/wp/v2/youtube_video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${WP_USER}:${WP_PASSWORD}`).toString('base64')
      },
      body: JSON.stringify({
        title: "Test Video",
        status: "publish"
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data, null, 2)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}

