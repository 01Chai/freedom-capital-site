exports.handler = async (event) => {
  const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
  const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

  let results = [];

  try {
    // Only handle POST requests
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Webhook endpoint is live",
        }),
      };
    }

    // Parse the incoming Whop payload
    const payload = JSON.parse(event.body || "{}");

    const allowedEvents = [
      "user_joined",
      "order_created",
      "membership_activated",
    ];

    if (!allowedEvents.includes(payload.event)) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Event ignored",
        }),
      };
    }

    const email =
      payload.data?.email ||
      payload.data?.user?.email;

    const name =
      payload.data?.username ||
      payload.data?.user?.name ||
      "Whop Member";

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "No email found in Whop payload",
        }),
      };
    }

    // Call Beehiiv API
    const beehiivRes = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${BEEHIIV_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          custom_fields: [
            { name: "First Name", value: name }
          ]
        }),
      }
    );

    const beehiivBody = await beehiivRes.json();

    if (beehiivRes.ok) {
      results.push(`Subscriber added: ${email}`);
    } else {
      results.push(`Beehiiv error: ${JSON.stringify(beehiivBody)}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Whop → Beehiiv webhook processed",
        results,
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Fatal webhook error",
        error: err.message,
      }),
    };
  }
};
