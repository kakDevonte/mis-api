const express = require("express"),
  indexRouter = express.Router(),
  indexController = require("../controllers");

indexRouter.post("/patient", indexController.createPatient);
indexRouter.post("/schedule", indexController.getSchedule);
indexRouter.post("/appointment", indexController.doctorsAppointment);

module.exports = indexRouter;
