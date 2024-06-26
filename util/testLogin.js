const axios = require("axios");

const APP_ID = "df3f6b76-d60b-47b6-bf63-1fccfb96ce9b";
const REST_API_KEY = "ZGNkNjI4YmQtYjdhMi00ZDY4LTk0ZjAtMjVkZDc5MWMwODA1";
const BACKEND_URL = "http://localhost:4000/api"; // Replace with your backend URL to save the player ID

const userId = 39; // Replace with your test user ID

async function loginUser() {
  try {
    // Simulate OneSignal login
    const response = await axios.post(
      `https://onesignal.com/api/v1/players`,
      {
        app_id: APP_ID,
        identifier: userId.toString(), // Use user ID as identifier
        device_type: 1, // Assuming this is a mobile device, use appropriate type if different
      },
      {
        headers: {
          Authorization: `Basic ${REST_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const playerId = response.data.id;
    console.log(response.data); // FIXME: maybe the playerId i am saving is not the player id i need ? maybe its the subscription id
    console.log(`OneSignal Player ID: ${playerId}`);

    // Save Player ID to your backend
    await axios.post(
      `${BACKEND_URL}/user/savePlayerId`,
      { playerId }, // Send the playerId in the request body
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGVfaWQiOjEsImlhdCI6MTcxOTMwODg2OSwiZXhwIjoxNzE5MzI2ODY5fQ.kOLNMG4swEWSvqCPI_qubucXiP0j81sRgjw5K-oqHVs`, // Add your JWT token here if required
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Player ID saved successfully to backend");
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
}

loginUser();
