// netlify/functions/youtube.mjs

export async function handler(event, context) {
  try {
    const channelId = "UCVRm8E_n-TEmk55J2t8Se1w"; // Atif Hussain's channel ID
    const apiKey = http://process.env.YOUTUBE_API_KEY;

    const response = await fetch(
      `https://googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=4`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    const videos = data.items
      .filter(item => http://item.id.kind === "youtube#video")
      .map(item => ({
        id: http://item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        publishedAt: item.snippet.publishedAt
      }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(videos)
    };
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch videos" })
    };
  }
}
