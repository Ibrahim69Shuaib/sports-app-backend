const nodemailer = require("nodemailer");
require("dotenv").config();
// Create a transporter using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, //email stored in .env
    pass: process.env.APP_PASSWORD, //password stored in.env // or app password
  },
});

const sendVerificationEmail = async (to, verificationToken) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject: "Email Verification",
    html: `
    <html>
      <body>
        <p>Welcome to our application</p>
        <p>Please click the following link to verify your email:</p>
        <a href="http://localhost:4000/api/auth/verify/${verificationToken}">Verify Email</a>
      </body>
    </html>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent");
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

module.exports = { sendVerificationEmail };
