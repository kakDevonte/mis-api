const prisma = require("../utils/prisma");
const { getDaysInMonth } = require("../utils/date");
const moment = require("moment");

const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const createPatients = async () => {
  await prisma.patient.createMany({
    data: [
      {
        name: "Bob",
        email: "bob@prisma.io",
        phone: "+7 983 321 39 99",
        gender: "male",
      },
      {
        name: "Yewande",
        email: "yewande@prisma.io",
        phone: "+7 913 957 29 37",
        gender: "female",
      },
      {
        name: "Angelique",
        email: "angelique@prisma.io",
        phone: "+7 953 123 39 49",
        gender: "female",
      },
      {
        name: "Aleksandr",
        email: "aleksandr@prisma.io",
        phone: "+7 253 956 21 43",
        gender: "male",
      },
    ],
    skipDuplicates: true,
  });
};

const createDoctors = async () => {
  await prisma.doctor.createMany({
    data: [
      {
        name: "Сергей",
        spec: "Хирург",
        price: 12500,
      },
      {
        name: "Василий",
        spec: "Терапевт",
        price: 2500,
      },
      {
        name: "Генадий",
        spec: "Стоматолог",
        price: 32520,
      },
    ],
  });
};

const createSchedule = async () => {
  const currDate = new Date();
  const allDoctors = await prisma.doctor.findMany();
  for (let i = 0; i < 2; i++) {
    const allDays = getDaysInMonth(
      currDate.getMonth() + i,
      currDate.getFullYear()
    );
    let newDate = new Date(
      currDate.getFullYear(),
      currDate.getMonth() + i,
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
  }
};

async function seed() {
  await createPatients();
  await createDoctors();
  await createSchedule();

  const allPatient = await prisma.patient.findMany();

  for (let i = 1; i <= 50; i++) {
    await prisma.schedule.update({
      where: { id: i },
      data: {
        patient_id:
          allPatient[randomIntFromInterval(0, allPatient.length - 1)].id,
        is_free: false,
      },
    });
  }
}
seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
