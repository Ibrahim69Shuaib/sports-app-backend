const axios = require("axios");

const APP_ID = "df3f6b76-d60b-47b6-bf63-1fccfb96ce9b";
const REST_API_KEY = "ZGNkNjI4YmQtYjdhMi00ZDY4LTk0ZjAtMjVkZDc5MWMwODA1";

async function updatePlayerSubscription(playerId) {
  try {
    const response = await axios.put(
      `https://onesignal.com/api/v1/players/${playerId}`,
      {
        app_id: APP_ID,
        notification_types: 1, // Ensure this is set to subscribe the player
      },
      {
        headers: {
          Authorization: `Basic ${REST_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Subscription update response:", response.data);
  } catch (error) {
    console.error(
      "Error updating subscription:",
      error.response ? error.response.data : error.message
    );
  }
}

async function checkPlayerStatus(playerId) {
  try {
    const response = await axios.get(
      `https://onesignal.com/api/v1/players/${playerId}?app_id=${APP_ID}`,
      {
        headers: {
          Authorization: `Basic ${REST_API_KEY}`,
        },
      }
    );
    console.log("Player status:", response.data);
    if (response.data.notification_types === -2) {
      console.log("Player is unsubscribed. Updating subscription status...");
      await updatePlayerSubscription(playerId);
    } else {
      console.log("Player is subscribed.");
    }
  } catch (error) {
    console.error(
      "Error fetching player status:",
      error.response ? error.response.data : error.message
    );
  }
}

checkPlayerStatus("ba3bfab2-8053-4771-9a99-e4b138ad6ff1");
