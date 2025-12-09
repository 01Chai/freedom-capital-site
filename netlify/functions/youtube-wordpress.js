for (let item of data.items) {
  if (!item.id.videoId) continue;

  const videoId = item.id.videoId;
  const title = item.snippet.title;
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const thumbnail = item.snippet.thumbnails.high.url;

  // Search for existing post
  const searchResponse = await fetch(`${WP_URL}?search=${encodeURIComponent(title)}`, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${WP_USER}:${WP_PASSWORD}`).toString('base64')
    }
  });
  const existingPosts = await searchResponse.json();

  if (existingPosts.length > 0) {
    // Update existing post
    const postId = existingPosts[0].id;
    await fetch(`${WP_URL}/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${WP_USER}:${WP_PASSWORD}`).toString('base64')
      },
      body: JSON.stringify({
        fields: {
          youtube_title: title,
          youtube_url: url,
          youtube_thumbnail: thumbnail
        }
      })
    });
  } else {
    // Create new post
    await fetch(WP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${WP_USER}:${WP_PASSWORD}`).toString('base64')
      },
      body: JSON.stringify({
        title: title,
        status: 'publish',
        fields: {
          youtube_title: title,
          youtube_url: url,
          youtube_thumbnail: thumbnail
        }
      })
    });
  }
}

