const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.yandex.ru",
  port: 465,
  secure: true,
  auth: {
    user: process.env.LOGIN,
    pass: process.env.PASSWORD,
  },
});

exports.sendMessage = (text, mail) => {
  const message = {
    from: process.env.EMAIL,
    to: mail,
    subject: "Оповещение",
    text: text,
  };
  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};
