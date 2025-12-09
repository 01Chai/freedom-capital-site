exports.handler = async () => {
  const WP_URL = process.env.WP_URL; // Example: https://your-site.com/wp-json/wp/v2/youtube_videos
  const WP_USER = process.env.WP_USER;
  const WP_PASSWORD = process.env.WP_PASSWORD;

  const YT_KEY = process.env.YOUTUBE_API_KEY;
  const YT_CHANNEL = process.env.YOUTUBE_CHANNEL_ID;

  try {
    // Fetch YouTube Videos
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${YT_KEY}&channelId=${YT_CHANNEL}&part=snippet,id&order=date&maxResults=20`
    );

    if (!ytRes.ok) {
      return {
        statusCode: 500,
        body: `YouTube API error: ${ytRes.statusText}`
      };
    }

    const data = await ytRes.json();

    const authHeader =
      "Basic " + Buffer.from(`${WP_USER}:${WP_PASSWORD}`).toString("base64");

    let results = [];

    for (let item of data.items) {
      if (!item.id.videoId) continue;

      const videoId = item.id.videoId;
      const title = item.snippet.title;
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      const thumbnail = item.snippet.thumbnails.high.url;

      // 🔎 Search if this YouTube video already exists in WordPress
      const searchResponse = await fetch(
        `${WP_URL}?search=${encodeURIComponent(title)}`,
        {
          headers: { Authorization: authHeader }
        }
      );

      const existing = await searchResponse.json();

      if (existing.length > 0) {
        // 🔁 UPDATE existing post
        const postId = existing[0].id;

        await fetch(`${WP_URL}/${postId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader
          },
          body: JSON.stringify({
            fields: {
              youtube_title: title,
              youtube_url: url,
              youtube_thumbnail: thumbnail
            }
          })
        });

        results.push(`Updated: ${title}`);
      } else {
        // 🆕 CREATE new post
        await fetch(WP_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader
          },
          body: JSON.stringify({
            title: title,
            status: "publish",
            fields: {
              youtube_title: title,
              youtube_url: url,
              youtube_thumbnail: thumbnail
            }
          })
        });

        results.push(`Created: ${title}`);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Sync complete",
        results
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Error: ${err.message}`
    };
  }
};

