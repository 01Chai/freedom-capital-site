// functions/youtube.js
import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    const apiKey = http://process.env.YOUTUBE_API_KEY;
    const channelId = http://process.env.YOUTUBE_CHANNEL_ID;

    const apiUrl = `https://googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=3`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || "YouTube API error" }),
      };
    }

    const videos = (data.items || [])
      .filter((item) => http://item.id.kind === "youtube#video")
      .map((item) => ({
        videoId: http://item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        publishedAt: item.snippet.publishedAt,
      }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videos }),
    };
  } catch (error) {
    console.error("YouTube API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
}
