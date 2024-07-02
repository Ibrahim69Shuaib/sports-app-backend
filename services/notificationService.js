// // const fetch = require("node-fetch");

// const ONESIGNAL_APP_ID = "df3f6b76-d60b-47b6-bf63-1fccfb96ce9b";
// const ONESIGNAL_REST_API_KEY =
//   "ZGNkNjI4YmQtYjdhMi00ZDY4LTk0ZjAtMjVkZDc5MWMwODA1";

// const sendNotification = async (playerIds, title, message) => {
//   try {
//     const response = await fetch("https://onesignal.com/api/v1/notifications", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json; charset=utf-8",
//         Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
//       },
//       body: JSON.stringify({
//         app_id: ONESIGNAL_APP_ID,
//         include_player_ids: playerIds,
//         headings: { en: title },
//         contents: { en: message },
//       }),
//     });

//     const data = await response.json();
//     console.log("Notification sent:", data);
//   } catch (error) {
//     console.error("Error sending notification:", error);
//   }
// };

// module.exports = { sendNotification };
const axios = require("axios");

const sendNotification = async (playerId, title, message) => {
  console.log("Sending notification to player ID:", playerId);
  try {
    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        include_external_user_ids: [playerId],
        headings: { en: title },
        contents: { en: message },
      },
      {
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Notification sent:", response.data);
  } catch (error) {
    console.error(
      "Error sending notification:",
      error.response ? error.response.data : error.message
    );
  }
};

module.exports = { sendNotification };
