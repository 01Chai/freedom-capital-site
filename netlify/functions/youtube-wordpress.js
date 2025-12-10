exports.handler = async () => {
  // --- Environment Variables (EVs) ---
  const WP_URL = process.env.WP_URL; 
  const WP_USER = process.env.WP_USER;
  const WP_PASSWORD = process.env.WP_PASSWORD;

  const YT_KEY = process.env.YOUTUBE_API_KEY;
  const YT_CHANNEL = process.env.YOUTUBE_CHANNEL_ID;

  // --- API Endpoint Definition ---
  // CRITICAL CHANGE: Using the dedicated ACF endpoint path
  const CPT_ENDPOINT = `${WP_URL}/wp-json/acf/v3/youtube_video`; 
  
  const authHeader =
    "Basic " + Buffer.from(`${WP_USER}:${WP_PASSWORD}`).toString("base64");

  let results = [];

  try {
    // 1. Fetch YouTube Videos
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${YT_KEY}&channelId=${YT_CHANNEL}&part=snippet,id&order=date&maxResults=20&type=video`
    );

    if (!ytRes.ok) {
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

      // 2. Search if this video exists by checking the post title (videoId)
      // NOTE: We still use the /wp/v2 endpoint for searching, as ACF endpoint is for CRUD.
      const searchEndpoint = `${WP_URL}/wp-json/wp/v2/youtube_video?search=${videoId}&status=publish`;

      const searchResponse = await fetch(
        searchEndpoint,
        { headers: { Authorization: authHeader } }
      );
      
      if (!searchResponse.ok) { continue; }

      const existing = await searchResponse.json();
      
      // Data object for both update and create
      const postData = {
          title: videoId, // Use Video ID as unique identifier
          status: "publish",
          content: "", 
          
          // CRITICAL CHANGE: Using 'fields' to pass ACF data (Required by the plugin)
          fields: { 
              youtube_title: youtubeTitle,
              youtube_url: youtubeUrl,
              youtube_thumbnails: youtubeThumbnail,
          }
      };
      
      // DETERMINE ACTION: UPDATE or CREATE
      const action = existing.length > 0 ? 'UPDATE' : 'CREATE';
      // The endpoint MUST be adjusted to the ACF endpoint for the CPT
      const endpoint = action === 'UPDATE' ? `${CPT_ENDPOINT}/${existing[0].id}` : CPT_ENDPOINT;
      
      if (action === 'UPDATE') { delete postData.status; }

      // 3. EXECUTE API CALL
      const apiRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader
        },
        body: JSON.stringify(postData)
      });
      
      const apiResBody = await apiRes.json();

      if (apiRes.ok) {
        // SUCCESS: Capture the status that was assigned
        const postStatus = apiResBody.status || 'publish'; // Default to publish if not found
        results.push(`${action} SUCCESS: ${youtubeTitle} (Status: ${postStatus})`);
      } else {
        // FAILURE: CAPTURE THE EXACT WORDPRESS ERROR MESSAGE
        const errorCode = apiResBody.code || 'UNKNOWN_CODE';
        const errorMessage = apiResBody.message || apiRes.statusText;
        results.push(`!!! ${action} FAILED: ${youtubeTitle} -> ERROR CODE: ${errorCode} | MESSAGE: ${errorMessage}`);
      }
    }

    // 4. Return Final Sync Status
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "WordPress-YouTube Sync complete",
        results
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "A fatal error occurred during the sync process.",
        error: err.message
      })
    };
  }
};
