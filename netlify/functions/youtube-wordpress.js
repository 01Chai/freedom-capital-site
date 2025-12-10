exports.handler = async () => {
  const WP_URL = process.env.WP_URL; 
  const WP_USER = process.env.WP_USER;
  const WP_PASSWORD = process.env.WP_PASSWORD;
  const YT_KEY = process.env.YOUTUBE_API_KEY;
  const YT_CHANNEL = process.env.YOUTUBE_CHANNEL_ID;

  const CPT_ENDPOINT = `${WP_URL}/wp-json/wp/v2/youtube_video`; // Using the standard endpoint is safer for simple post creation
  
  const authHeader =
    "Basic " + Buffer.from(`${WP_USER}:${WP_PASSWORD}`).toString("base64");

  let results = [];

  try {
    // 1. Fetch only ONE YouTube Video to simplify the test
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${YT_KEY}&channelId=${YT_CHANNEL}&part=snippet,id&order=date&maxResults=1&type=video`
    );

    const data = await ytRes.json();
    const item = data.items[0];

    const videoId = item.id.videoId;
    const youtubeTitle = item.snippet.title;
    
    // --- BARE MINIMUM PAYLOAD ---
    const postData = {
        title: youtubeTitle, // Use the real title for this one test
        status: "publish",
        content: "Video ID: " + videoId, // Use the video ID as content for tracking
    };
      
    // 2. EXECUTE THE CREATE API CALL (No search/update logic)
    const apiRes = await fetch(CPT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader
      },
      body: JSON.stringify(postData)
    });
    
    const apiResBody = await apiRes.json();

    if (apiRes.ok) {
      const postStatus = apiResBody.status || 'unknown'; 
      results.push(`TEST SUCCESS: ${youtubeTitle} (Status: ${postStatus})`);
    } else {
      const errorCode = apiResBody.code || 'UNKNOWN_CODE';
      const errorMessage = apiResBody.message || apiRes.statusText;
      results.push(`!!! TEST FAILED: ${youtubeTitle} -> ERROR: ${errorCode} | MESSAGE: ${errorMessage}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Final Test Complete",
        results
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "A fatal error occurred during the test.",
        error: err.message
      })
    };
  }
};
