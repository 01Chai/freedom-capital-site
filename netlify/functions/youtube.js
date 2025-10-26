// netlify/functions/youtube.js
const fetch = require("node-fetch");

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
    const response = await fetch(url);
    const data = await response.json();

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
