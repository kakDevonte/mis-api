const express = require("express");
const indexRouter = require("./routes");
const cron = require("node-schedule");
const moment = require("moment");
const prisma = require("./utils/prisma");
const { getDaysInMonth } = require("./utils/date");
const { sendMessage } = require("./utils/mail");

const app = express();

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Accept, Set-Cookie, X-XSRF-TOKEN, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT");
  res.setHeader("Access-Control-Allow-Origin", "*"); //req.get('origin')
  res.setHeader("Access-Control-Max-Age", 300);
  next();
});

app.use(express.json({ extended: true }));
app.use("/", indexRouter);

start = async () => {
  try {
    app.listen(process.env.PORT, () =>
      console.log(`App has benn started on port ${process.env.PORT}...`)
    );
  } catch (e) {
    console.log("Server Error", e.message);
    process.exit(1);
  }
};
start();

const getMessageString = (flag, name, spec, time) => {
  const messageDayBefore = `${new Date().toLocaleDateString()} | Привет ${name}! Напоминаем что вы записаны к ${spec} завтра в ${new Date(
    time
  ).toLocaleTimeString()}!`;
  const messageTwoHoursBefore = `${new Date().toLocaleDateString()} | Привет ${name}! Через 2 часа у вас приём у ${spec} в ${new Date(
    time
  ).toLocaleTimeString()}!`;

  return flag ? messageDayBefore : messageTwoHoursBefore;
};

cron.scheduleJob("30 * * * *", async () => {
  const allNotices = await prisma.notice.findMany();
  for (let notice of allNotices) {
    if (new Date() > new Date(notice.time)) {
      sendMessage(
        getMessageString(
          notice.before_day,
          notice.user_name,
          notice.doctor_spec,
          notice.appointment_time
        ),
        notice.user_email
      );
      await prisma.notice.delete({ where: { id: notice.id } });
    }
  }
});

cron.scheduleJob("* * 1 * *", async () => {
  const currDate = new Date();
  const allDoctors = await prisma.doctor.findMany();
  const allDays = getDaysInMonth(
    currDate.getMonth() + 1,
    currDate.getFullYear()
  );
  let newDate = new Date(
    currDate.getFullYear(),
    currDate.getMonth() + 1,
    allDays[0].getDate(),
    9
  );

  for (let doctor of allDoctors) {
    for (let day of allDays) {
      newDate = new Date(
        currDate.getFullYear(),
        currDate.getMonth() + 1,
        day.getDate(),
        9
      );
      for (let i = 1; i <= 24; i++) {
        //24
        await prisma.schedule.create({
          data: {
            date: newDate,
            doctor_id: doctor.id,
            time_from: newDate,
            time_to: (newDate = moment(newDate).add(30, "m").toDate()),
            is_free: true,
          },
        });
      }
    }
  }
});
