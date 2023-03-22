const prisma = require("../utils/prisma"),
  server = require("../utils/server"),
  { getNumberOfHours } = require("../utils/date");

exports.createPatient = async (req, res) => {
  try {
    server.checkReqBody(req, res);

    const { phone, name, email, gender } = req.body;

    const patient = await prisma.patient.create({
      data: {
        phone,
        name,
        email,
        gender,
      },
    });

    server.sendResult(res, patient, "Add patient!");
  } catch (err) {
    server.sendError(err, res);
  }
};

exports.getSchedule = async (req, res) => {
  try {
    let keys = [];
    for (let key in req.body) {
      keys.push(key.toString());
    }

    const fields = keys.reduce(
      (object, key) => ({ ...object, [key]: req.body[key] }),
      {}
    );

    if ("date" in fields) {
      fields.date = new Date(fields.date);
    }
    if ("time_from" in fields) {
      fields.time_from = new Date(fields.time_from);
    }
    if ("time_to" in fields) {
      fields.time_to = new Date(fields.time_to);
    }

    const { time_to, time_from, ...filter } = fields;

    let where = {
      AND: [
        {
          ...filter,
          OR: [
            { time_from: { lte: fields?.time_to, gte: fields?.time_from } },
            { time_to: { lte: fields?.time_to, gte: fields?.time_from } },
          ],
        },

      ],

    };
    // if (!(time_to && time_from)) {
    //   const { OR, ...result } = where;
    //   where = result;
    // }
    const schedules = await prisma.schedule.findMany({ where });

    server.sendResult(res, schedules);
  } catch (err) {
    server.sendError(err, res);
  }
};

exports.doctorsAppointment = async (req, res) => {
  try {
    server.checkReqBody(req, res);

    const { schedule_id, doctor_id, patient_id } = req.body;

    const appointment = await prisma.schedule.findUnique({
      where: { id: schedule_id },
    });

    if (!appointment) return server.sendError({}, res, "Slot not exist!");

    if (!appointment.is_free)
      return server.sendError({}, res, "Slot is occupied!");

    if (appointment.time_from < new Date())
      return server.sendError({}, res, "Past slot!");

    const schedule = await prisma.schedule.update({
      where: { id: schedule_id },
      data: {
        patient_id: patient_id,
        is_free: false,
      },
      include: {
        doctor: true,
        patient: true,
      },
    });

    if (getNumberOfHours(new Date(), schedule.time_from) > 24) {
      const date = new Date(schedule.time_from);
      await prisma.notice.create({
        data: {
          doctor_spec: schedule.doctor.spec,
          user_name: schedule.patient.name,
          user_email: schedule.patient.email,
          appointment_time: new Date(schedule.time_from),
          time: new Date(date.setDate(date.getDate() - 1)),
          before_day: true,
        },
      });
    }

    if (getNumberOfHours(new Date(), schedule.time_from) > 2) {
      const date = new Date(schedule.time_from);
      await prisma.notice.create({
        data: {
          doctor_spec: schedule.doctor.spec,
          user_name: schedule.patient.name,
          user_email: schedule.patient.email,
          appointment_time: new Date(schedule.time_from),
          time: new Date(date.setHours(date.getHours() - 2)),
          before_day: false,
        },
      });
    }

    server.sendResult(res, schedule);
  } catch (err) {
    server.sendError(err, res);
  }
};
