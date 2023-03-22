exports.checkReqBody = (req, res) => {
  if (Object.keys(req.body).length == 0) {
    return res.status(400).json({
      msg: "The request body has not value!",
    });
  }
};

exports.sendResult = (res, docs, msg = "Success!") => {
  res.status(200).json({
    status: 200,
    msg: msg,
    docs: docs,
  });
};

exports.sendError = (err, res, msg) => {
  res.status(err.status || 400).json({
    status: err.status || 400,
    msg: msg || err.message,
  });
};
