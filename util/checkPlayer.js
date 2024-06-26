const axios = require("axios");

const APP_ID = "df3f6b76-d60b-47b6-bf63-1fccfb96ce9b";
const REST_API_KEY = "ZGNkNjI4YmQtYjdhMi00ZDY4LTk0ZjAtMjVkZDc5MWMwODA1";
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
  } catch (error) {
    console.error(
      "Error fetching player status:",
      error.response ? error.response.data : error.message
    );
  }
}

checkPlayerStatus("ba3bfab2-8053-4771-9a99-e4b138ad6ff1");
