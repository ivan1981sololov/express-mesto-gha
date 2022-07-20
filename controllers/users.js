const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const AuthorizedError = require('../errors/AuthorizedError');
const CastError = require('../errors/CastError');
const NotFound = require('../errors/NotFound');
const ConflictError = require('../errors/ConflictError');

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  User.findOne({ email });
  // хешируем пароль
  bcrypt.hash(password, 10)
    // eslint-disable-next-line no-shadow
    .then((password) => {
      User.create({
        name, about, avatar, email, password,
      })
        .then((user) => {
          const newUser = user.toObject();
          delete newUser.password;
          res.send(newUser);
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            return next(new CastError('Переданны некорректные данные'));
          }
          if (err.name === 'MongoServerError' || err.message === 'Validation failed') {
            return next(new ConflictError('При регистрации указан email, который уже существует на сервере'));
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
    .then((users) => {
      res.send(users);
    })
    .catch(next);
};

const getUserById = (req, res, next) => {
  const id = req.params.userId;
  return User.findById({ _id: id })
    .orFail(() => {
      throw new NotFound('Пользователя с таким id не существует');
    })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        throw new NotFound('Пользователя с таким id не существует');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new CastError('Переданны некорректные данные');
      }
      if (err.name === 'NotFound') {
        throw new NotFound('Пользователя с таким id не существует');
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
    .orFail(() => {
      throw new NotFound('Пользователя с таким id не существует');
    })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        next(new CastError('Переданны некорректные данные'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(new CastError('Переданны некорректные данные'));
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
    .orFail(() => {
      throw new NotFound('Пользователя с таким id не существует');
    })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        next(new CastError('Переданны некорректные данные'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(new CastError('Переданны некорректные данные'));
      }
      const error = new Error('На сервере произошла ошибка');
      error.statusCode = 500;
      return next(error);
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  let userId;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new AuthorizedError('Неправильные почта или пароль'));
      }
      userId = user._id;
      return bcrypt.compare(password, user.password);
    })
    // eslint-disable-next-line consistent-return
    .then((matched) => {
      if (!matched) {
        return next(new AuthorizedError('Неправильные почта или пароль'));
      }

      // аутентификация успешна
      const token = jwt.sign(
        { _id: userId },
        'super-strong-secret',
        { expiresIn: '7d' },
      );

      res.send({ token });
    })
    .catch((err) => {
      next(err);
    });
};

const getUserMe = (req, res, next) => {
  const id = req.user._id;
  User.find({ _id: id })
    .orFail(() => {
      throw new NotFound('Пользователя с таким id не существует');
    })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        next(new NotFound('Пользователя с таким id не существует'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new CastError('Переданны некорректные данные'));
      }
      const error = new Error('На сервере произошла ошибка');
      error.statusCode = 500;
      return next(error);
    });
};

module.exports = {
  createUser, getUsers, getUserById, updateUser, updateAvatar, login, getUserMe,
};
