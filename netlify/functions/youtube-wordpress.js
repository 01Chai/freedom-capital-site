exports.handler = async () => {
  // --- Environment Variables (EVs) ---
  // WP_URL is now correctly set to the root: https://freedomcapitalinstitute.com
  const WP_URL = process.env.WP_URL; 
  const WP_USER = process.env.WP_USER;
  const WP_PASSWORD = process.env.WP_PASSWORD;

  const YT_KEY = process.env.YOUTUBE_API_KEY;
  const YT_CHANNEL = process.env.YOUTUBE_CHANNEL_ID;

  // --- API Endpoint Definition ---
  // CRITICAL FIX: Build the full CPT endpoint using the base URL
  const CPT_ENDPOINT = `${WP_URL}/wp-json/wp/v2/youtube_video`; 
  
  const authHeader =
    "Basic " + Buffer.from(`${WP_USER}:${WP_PASSWORD}`).toString("base64");

  let results = [];

  try {
    // 1. Fetch YouTube Videos
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${YT_KEY}&channelId=${YT_CHANNEL}&part=snippet,id&order=date&maxResults=20&type=video`
    );

    if (!ytRes.ok) {
      console.error(`YouTube API error: ${ytRes.statusText}`);
      return {
        statusCode: 500,
        body: `YouTube API error: ${ytRes.statusText}`
      };
    }

    const data = await ytRes.json();

    for (let item of data.items) {
      const videoId = item.id.videoId;
      if (!videoId) continue; 

      const youtubeTitle = item.snippet.title;
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const youtubeThumbnail = item.snippet.thumbnails.high.url;

      // 2. Search if this video exists by checking the post title (which is the Video ID)
      const searchResponse = await fetch(
        `${CPT_ENDPOINT}?search=${videoId}&status=publish`,
        {
          headers: { Authorization: authHeader }
        }
      );
      
      if (!searchResponse.ok) {
        console.error(`WordPress Search error for video ID "${videoId}": ${searchResponse.statusText}`);
        continue;
      }

      const existing = await searchResponse.json();
      
      // Data object for both update and create
      const postData = {
          // Use the YouTube video ID as the post title for a unique identifier
          title: videoId, 
          status: "publish",
          
          // CRITICAL FIX: Using 'meta' to pass ACF data via the standard WP REST API
          meta: { 
              youtube_title: youtubeTitle,
              youtube_url: youtubeUrl,
              youtube_thumbnails: youtubeThumbnail,
          }
      };
      
      if (existing.length > 0) {
        // 🔁 UPDATE existing post
        const postId = existing[0].id;
        delete postData.status;

        const updateRes = await fetch(`${CPT_ENDPOINT}/${postId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader
          },
          body: JSON.stringify(postData)
        });
        
        if (updateRes.ok) {
           results.push(`Updated: ${youtubeTitle} (ID: ${postId})`);
        } else {
           const errBody = await updateRes.json();
           results.push(`Failed to update ${youtubeTitle}: ${errBody.message || updateRes.statusText}`);
        }

      } else {
        // 🆕 CREATE new post
        const createRes = await fetch(CPT_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader
          },
          body: JSON.stringify(postData)
        });
        
        if (createRes.ok) {
          const newPost = await createRes.json();
          results.push(`Created: ${youtubeTitle} (ID: ${newPost.id})`);
        } else {
          const errBody = await createRes.json();
          results.push(`Failed to create ${youtubeTitle}: ${errBody.message || createRes.statusText}`);
        }
      }
    }

    // 3. Return Final Sync Status
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "WordPress-YouTube Sync complete",
        results
      })
    };
  } catch (err) {
    console.error("Fatal function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "A fatal error occurred during the sync process.",
        error: err.message
      })
    };
  }
};



