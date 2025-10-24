exports.handler = async (event) => {
  try {
    const { email, first_name } = JSON.parse(event.body);

    if (!first_name || !email) {
      console.error("Missing fields:", { first_name, email });
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "First name and email are required." })
      };
    }

    const API_KEY = process.env.BEEHIIV_API_KEY;
    const PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

    console.log("📤 Sending to Beehiiv:", { email, first_name, PUBLICATION_ID });

    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/subscriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          email: email,
          custom_fields: [
            { name: "First Name", value: first_name }]
        })
      }
    );

    const data = await response.json();
    console.log("📥 Beehiiv Response:", data);

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, data })
      };
    } else {
      console.error("❌ Beehiiv Error:", data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ success: false, error: data })
      };
    }

  } catch (error) {
    console.error("💥 Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
