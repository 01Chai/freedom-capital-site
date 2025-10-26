const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const CHANNEL_ID = "UCjpzeWEU0-629Baz_RA-LbQ";
  const API_URL = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=3`;

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    const videos = data.items.map((item) => ({
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      videoId: item.id.videoId,
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
