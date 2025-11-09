// netlify/functions/newsletters.js

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.handler = async (event, context) => {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !pubId) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Missing environment variables: BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID"
      })
    };
  }

  try {
    // CRITICAL: sort=publish_date + direction=desc = NEWEST FIRST
    const url = `https://api.beehiiv.com/v2/publications/${pubId}/posts?limit=3&status=published&sort=publish_date&direction=desc&timestamp=${Date.now()}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: "Beehiiv API error",
          details: text
        })
      };
    }

    const data = await response.json();

    const posts = (data.data || []).map(post => ({
      title: post.title || "",
      subtitle: post.subtitle || "",
      url: post.web_url || post.url || "",
      feature_image: post.thumbnail_url || post.feature_image || "",
      published_at: post.published_at || ""
    }));

    console.log("Fetched posts (should be newest):", posts);

    return {
      statusCode: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify(posts)
    };

  } catch (error) {
    console.error("Error fetching Beehiiv posts:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch Beehiiv posts",
        details: error.message
      })
    };
  }
};
