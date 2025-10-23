// netlify/functions/newsletters.js
export async function handler(event, context) {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !pubId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing environment variables: BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID" })
    };
  }

  try {
    const url = `https://api.beehiiv.com/v2/publications/${pubId}/posts?limit=3`;
    const resp = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      // short timeout not available natively; rely on platform timeout
    });

    if (!resp.ok) {
      const text = await resp.text();
      return {
        statusCode: resp.status,
        body: JSON.stringify({ error: 'Beehiiv API error', details: text })
      };
    }

    const data = await resp.json();
    const posts = (http://data.data || []).map(p => ({
      title: p.title || '',
      subtitle: p.subtitle || '',
      url: p.web_url || p.url || '',
      feature_image: p.feature_image || '',   // may be empty
      published_at: p.published_at || ''
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(posts)
    };
  } catch (err) {
    console.error("newsletters function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch Beehiiv posts", details: err.message })
    };
  }
}
