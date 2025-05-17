const appError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  console.log("ERROR 💥", err);
  return res.status(err.statusCode).json({
    code: err.statusCode,
    message: err.message || "Something went wrong!",
  });
};

export default appError;
