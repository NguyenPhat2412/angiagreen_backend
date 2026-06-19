const nodemailer = require("nodemailer");
const { getBooleanEnv, getEnv, getNumberEnv } = require("../config/env");

const getMailConfig = () => {
  const user = getEnv("EMAIL_USER");
  const password = getEnv("EMAIL_PASSWORD");

  if (!user || !password) {
    return null;
  }

  return {
    host: getEnv("EMAIL_HOST", "smtp.gmail.com"),
    port: getNumberEnv("EMAIL_PORT", 465),
    secure: getBooleanEnv("EMAIL_SECURE", true),
    auth: {
      user,
      pass: password,
    },
  };
};

const sendPasswordResetOtp = async ({ to, otp, expiresMinutes }) => {
  const mailConfig = getMailConfig();

  if (!mailConfig) {
    console.warn("Password reset email skipped: EMAIL_USER or EMAIL_PASSWORD is missing.");
    return;
  }

  const transporter = nodemailer.createTransport(mailConfig);
  const from = getEnv("EMAIL_FROM", mailConfig.auth.user);

  await transporter.sendMail({
    from,
    to,
    subject: "Mã OTP đặt lại mật khẩu An Gia Green",
    text: `Mã OTP đặt lại mật khẩu của bạn là ${otp}. Mã có hiệu lực trong ${expiresMinutes} phút.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
        <h2>Đặt lại mật khẩu An Gia Green</h2>
        <p>Mã OTP của bạn:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px;color:#15803d">${otp}</p>
        <p>Mã có hiệu lực trong ${expiresMinutes} phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetOtp };
