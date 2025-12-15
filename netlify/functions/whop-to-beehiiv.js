exports.handler = async (event) => {
  const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
  const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

  let results = [];

  try {
    // Whop sends POST requests
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Webhook endpoint is live",
        }),
      };
    }

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

    const beehiivRes = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscribers`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${BEEHIIV_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          first_name: name,
          send_welcome_email: true,
        }),
      }
    );

    const beehiivBody = await beehiivRes.text();

    if (beehiivRes.ok) {
      results.push(`Subscriber added: ${email}`);
    } else {
      results.push(`Beehiiv error: ${beehiivBody}`);
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
