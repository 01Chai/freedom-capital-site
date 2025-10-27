const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.handler = async (event, context) => {
  const apiKey = http://process.env.YOUTUBE_API_KEY;
  const channelId = "UCjpzeWEU0-629Baz_RA-LbQ";

  if (!apiKey || !channelId) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Missing environment variables: YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID",
      }),
    };
  }

  try {
    const url = `https://googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=3`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

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
      videoId: http://item.id.videoId || "",
      title: item.snippet.title || "",
      thumbnail: item.snippet.thumbnails?.medium?.url || "",
      published_at: item.snippet.publishedAt || "",
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(videos),
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
