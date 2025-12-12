import nodemailer from "nodemailer";
import constants from "../config/constant.js";

export const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: constants.EMAIL_USER,
      pass: constants.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: constants.EMAIL_USER,
    to,
    subject,
    text
  });
};
