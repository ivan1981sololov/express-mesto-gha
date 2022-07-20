const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi, errors } = require('celebrate');
const validator = require('validator');
const routesCards = require('./routes/cards');
const routesUsers = require('./routes/users');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/errors');
const NotFound = require('./errors/NotFound');

const PORT = 3000;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  autoIndex: true, // make this also true
});

app.use(express.json());

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().required(),
  }).unknown(true),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().custom((value, helper) => {
      if (validator.isURL(value, { require_protocol: true })) {
        return value.match(/https?:\/\/(www\.)?[-\w@:%\\+~#=]{1,256}\.[a-z0-9()]{1,6}\b([-\w()@:%\\+~#=//?&]*)/i);
      }
      return helper.message('Невалидный url');
    }),
  }),
}), createUser);

app.use(auth);

app.use('/users', routesUsers);
app.use('/cards', routesCards);

app.all('*', (req, res, next) => next(new NotFound('Ресурс не найден')));

app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Ссылка на сервер: http://localhost:${PORT}`);
});
