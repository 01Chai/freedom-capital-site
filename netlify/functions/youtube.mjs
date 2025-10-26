// netlify/functions/youtube.mjs

export async function handler(event, context) {
  try {
    const YOUTUBE_API_KEY = http://process.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = "UCjpzeWEU0-629Baz_RA-LbQ";
    const MAX_RESULTS = 3;

    const apiUrl = `https://googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=${MAX_RESULTS}&order=date&type=video&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error("YouTube API error:", data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Failed to fetch videos" }),
      };
    }

    const videos = http://data.items.map((item) => ({
      videoId: http://item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(videos),
    };
  } catch (error) {
    console.error("Server error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
}
