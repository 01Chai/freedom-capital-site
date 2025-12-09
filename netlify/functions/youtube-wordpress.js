const fetch = require("node-fetch");

exports.handler = async () => {
  try {
    const YT_API_KEY = process.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

    const WP_USER = process.env.WP_USER;
    const WP_PASSWORD = process.env.WP_PASSWORD;
    const WP_SITE_URL = process.env.WP_SITE_URL;

    // WordPress CPT endpoint
    const WP_ENDPOINT = `${WP_SITE_URL}/wp-json/wp/v2/youtube_videos`;

    // 1) Fetch latest 3 videos
    const ytUrl = `https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=3`;

    const ytResponse = await fetch(ytUrl);
    const data = await ytResponse.json();

    if (!data.items) {
      return { statusCode: 500, body: "Unable to fetch YouTube videos" };
    }

    // 2) Get existing WP posts to prevent duplicates
    const existingPostsReq = await fetch(WP_ENDPOINT + "?per_page=20");
    const existingPosts = await existingPostsReq.json();

    const existingVideoIds = existingPosts.map(post => post.meta?.youtube_id);

    const newVideos = data.items.filter(
      video => !existingVideoIds.includes(video.id.videoId)
    );

    // 3) Create posts for NEW videos only
    for (const video of newVideos) {
      const title = video.snippet.title;
      const thumbnail = video.snippet.thumbnails.high.url;
      const videoId = video.id.videoId;

      await fetch(WP_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " + Buffer.from(`${WP_USER}:${WP_PASSWORD}`).toString("base64"),
        },
        body: JSON.stringify({
          title: title,
          status: "publish",
          meta: {
            youtube_id: videoId,
            youtube_thumbnail_url: thumbnail,
          },
        }),
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "YouTube sync complete",
        newVideos: newVideos.length,
      }),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

