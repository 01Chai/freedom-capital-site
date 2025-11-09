const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.handler = async (event, context) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  const CACHE_TTL = 3600; // 1 hour

  if (!apiKey || !channelId) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Missing environment variables: YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID",
      }),
    };
  }

  try {
    // Cache key
    const cacheKey = `youtube_${channelId}`;
    const cached = context.clientContext?.cache?.get(cacheKey);

    if (cached) {
      return {
        statusCode: 200,
        headers: { 'Cache-Control': 'public, max-age=3600' },
        body: cached
      };
    }

    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=3`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: "YouTube API error",
          details: text,
        }),
      };
    }

    const data = await response.json();

    const videos = (data.items || []).map((item) => ({
      videoId: item.id.videoId || "",
      title: item.snippet.title || "",
      thumbnail: item.snippet.thumbnails?.medium?.url || "",
      published_at: item.snippet.publishedAt || "",
    }));

    const json = JSON.stringify(videos);
    context.clientContext?.cache?.set(cacheKey, json, CACHE_TTL);

    return {
      statusCode: 200,
      headers: { 'Cache-Control': 'public, max-age=3600' },
      body: json
    };
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch YouTube videos",
        details: error.message,
      }),
    };
  }
};
