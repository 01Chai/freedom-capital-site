const axios = require("axios");

exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body);

    const allowedEvents = [
      "user_joined",
      "order_created",
      "membership_activated"
    ];

    if (!allowedEvents.includes(payload.event)) {
      return {
        statusCode: 200,
        body: "Event ignored",
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
        body: "No email provided",
      };
    }

    await axios.post(
      `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscribers`,
      {
        email: email,
        first_name: name,
        send_welcome_email: true,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      statusCode: 200,
      body: "Subscriber added",
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message,
    };
  }
};
