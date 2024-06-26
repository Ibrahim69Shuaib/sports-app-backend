const axios = require("axios");

const APP_ID = "df3f6b76-d60b-47b6-bf63-1fccfb96ce9b";
const REST_API_KEY = "ZGNkNjI4YmQtYjdhMi00ZDY4LTk0ZjAtMjVkZDc5MWMwODA1";

async function updatePlayer(playerId, userId) {
  try {
    const response = await axios.put(
      `https://onesignal.com/api/v1/players/${playerId}`,
      {
        app_id: APP_ID,
        identifier: userId.toString(),
        device_type: 1, // Adjust this based on your device type
        external_user_id: userId.toString(), // Set external_user_id if used
        device_os: "Android", // Example, adjust based on actual OS
        device_model: "Pixel 5", // Example, adjust based on actual device model
      },
      {
        headers: {
          Authorization: `Basic ${REST_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Player update response:", response.data);
  } catch (error) {
    console.error(
      "Error updating player:",
      error.response ? error.response.data : error.message
    );
  }
}

updatePlayer("ba3bfab2-8053-4771-9a99-e4b138ad6ff1", 39); // Replace with actual player ID and user ID
