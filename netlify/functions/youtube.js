// netlify/functions/youtube.js
const fetch = require("node-fetch");

exports.handler = async function () {
  try {
    const apiKey = http://process.env.YOUTUBE_API_KEY;
    const channelId = "UCjpzeWEU0-629Baz_RA-LbQ";
    const maxResults = 4; // change to how many videos you want

    const url = `https://googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${maxResults}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const videos = data.items
      .filter(item => http://item.id.kind === "youtube#video")
      .map(item => ({
        title: item.snippet.title,
        videoId: http://item.id.videoId,
        thumbnail: item.snippet.thumbnails.medium.url,
      }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(videos),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
