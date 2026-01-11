import nodemailer from "nodemailer";
import constants from "../config/constant.js";

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 587,
  secure: false,
  auth: {
    user: constants.EMAIL_USER,
    pass: constants.EMAIL_PASS
  },
  requireTLS: true
});

export const sendEmail = async (to, subject, text) => {
  return transporter.sendMail({
    from: `"Soundtrack My Night" <info@soundtrackmynight.com>`,
    to,
    subject,
    html: text
  });
};
