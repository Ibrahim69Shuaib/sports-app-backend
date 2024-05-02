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
const sendVerificationCode = async (to, verificationCode) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject: "Password Reset",
    html: `
    <html>
      <body>
      <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Sports-Reservation-System</a>
        </div>
        <p style="font-size:1.1em">Hi,</p>
        <p>Thank you for choosing our application. Use the following code to complete your password reset procedures.</p>
        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${verificationCode}</h2>
        <p style="font-size:0.9em;">Regards,<br />Support Team</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>Sports-Reservation-System</p>
          <p>ASPU</p>
          <p>Damascus</p>
        </div>
      </div>
    </div>
      </body>
    </html>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification Code sent");
  } catch (error) {
    console.error("Error sending verification Code:", error);
  }
};

module.exports = { sendVerificationEmail, sendVerificationCode };
