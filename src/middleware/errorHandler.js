const errorHandler = (err, req, res, next) => {
  console.log(err.status); // server side logging

  const statusCode = err.status;
  const message = statusCode == 500 ? "Internal Server Error" : err.message;

  res.status(statusCode).json({
    status: "error",
    message: message,
    code: err.code || "INTERNAL_SERVER_ERROR",
  });
};

module.exports = errorHandler;
