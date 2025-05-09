const appError = (err, req, res, next) => {
  console.error("ERROR 💥", err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message || "Something went wrong!",
  });
};

export default appError;
