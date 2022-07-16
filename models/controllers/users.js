const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  // хешируем пароль
  bcrypt.hash(password, 10)
    .then((password) => {
      User.create({
        name, about, avatar, email, password,
      })
        .then((user) => {
          const newUser = user.toObject();
          delete newUser.password;
          return res.send(newUser);
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            const err = new Error('Переданы некорректные данные при создании пользователя');
            err.statusCode = 400;
            next(err);
          } else if (err.message === 'Validation failed') {
            const err = new Error('Переданы некорректные данные при создании пользователя');
            err.statusCode = 400;
            return next(err);
          } else if (err.name === 'MongoServerError') {
            const err = new Error('При регистрации указан email, который уже существует на сервере');
            err.statusCode = 409;
            return next(err);
          }
          const error = new Error('На сервере произошла ошибка');
          error.statusCode = 500;
          return next(error);
        })
        .catch(next);
    });
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

const getUserById = (req, res, next) => {
  const id = req.params.userId;
  return User.findById({ _id: id })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        const err = new Error('Пользователь по указанному _id не найден');
        err.statusCode = 404;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const err = new Error('Пользователь по указанному _id не найден');
        err.statusCode = 400;
        next(err);
      } else if (err.name === 'NotFound') {
        const err = new Error('Пользователь по указанному _id не найден');
        err.statusCode = 404;
        return next(err);
      }
      const error = new Error('На сервере произошла ошибка');
      error.statusCode = 500;
      return next(error);
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const userId = req.user._id;
  const { name, about } = req.body;

  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        const err = new Error('Пользователь по указанному _id не найден');
        err.statusCode = 400;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const err = new Error('Пользователь по указанному _id не найден');
        err.statusCode = 400;
        next(err);
      } else if (err.name === 'ValidationError') {
        const err = new Error('Переданы некорректные данные при обновлении профиля');
        err.statusCode = 400;
        return next(err);
      }
      const error = new Error('На сервере произошла ошибка');
      error.statusCode = 500;
      return next(error);
    })
    .catch(next);
};

const updateAvatar = (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;

  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        const err = new Error('Пользователь по указанному _id не найден');
        err.statusCode = 400;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const err = new Error('Пользователь по указанному _id не найден');
        err.statusCode = 400;
        next(err);
      } else if (err.name === 'ValidationError') {
        const err = new Error('Переданы некорректные данные при обновлении профиля');
        err.statusCode = 400;
        return next(err);
      }
      res.status(500).send({ message: 'Произошла ошибка' });
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  let userId;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        const err = new Error('Неправильные почта или пароль');
        err.statusCode = 401;
        return next(err);
      }
      userId = user._id;
      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        const err = new Error('Неправильные почта или пароль');
        err.statusCode = 401;
        return next(err);
      }

      // аутентификация успешна
      const token = jwt.sign(
        { _id: userId },
        'super-strong-secret',
        { expiresIn: '21d' },
      );

      res.send({ token });
    })
    .catch(next);
};

const getUserMe = (req, res, next) => {
  const id = req.user._id;
  User.find({ _id: id })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        const err = new Error('Пользователь по указанному _id не найден');
        err.statusCode = 404;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const err = new Error('Пользователь по указанному _id не найден');
        err.statusCode = 404;
        return next(err);
      }
      res.status(500).send({ message: 'Ошибка на сервере' });
    });
};

module.exports = {
  createUser, getUsers, getUserById, updateUser, updateAvatar, login, getUserMe,
};
