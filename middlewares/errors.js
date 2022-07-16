module.exports = (err, req, res, next) => {
  if (err.message === 'Validation failed') {
    const err = new Error('Переданы некорректные данные');
    res.status(400).send({ message: err.message });
  }
  const status = err.statusCode || 401;
  console.log(err.message);
  res.status(status).json({ message: err.message });
  return next();
};
