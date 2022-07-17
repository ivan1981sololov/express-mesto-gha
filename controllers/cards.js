const Card = require('../models/card');
const ForbiddenError = require('../errors/ForbiddenError');
const NotFound = require('../errors/NotFound');
const CastError = require('../errors/CastError');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(next);
};

const createCards = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.message === 'Validation failed' || err.name === 'ValidationError') {
        next(new CastError('Переданы некорректные данные при создании карточки'));
      }
      const error = new Error('На сервере произошла ошибка');
      error.statusCode = 500;
      return next(error);
    })
    .catch(next);
};

const deleteCard = (req, res, next) => {
  const cardById = req.user._id;
  Card.findById({
    _id: req.params.cardId,
    owner: cardById,
  })
    .then((card) => {
      if (!card) {
        next(new NotFound('Нет карточки/пользователя по заданному id'));
      }
      if (card.owner.toString() === cardById.toString()) {
        Card.findOneAndRemove({
          _id: req.params.cardId,
          owner: cardById,
        })
          .then((cardRes) => {
            res.send(cardRes);
          });
      } else {
        next(new ForbiddenError('Карточку создали не вы!'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new CastError('Невалидный id'));
      }
      if (err.message === 'NotFound') {
        next(new NotFound('Нет карточки/пользователя по заданному id'));
      }
      const error = new Error('На сервере произошла ошибка');
      error.statusCode = 500;
      return next(error);
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        next(new NotFound('Нет карточки/пользователя по заданному id'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new CastError('Невалидный id'));
      }
      if (err.message === 'NotFound') {
        next(new NotFound('Нет карточки/пользователя по заданному id'));
      }
      const error = new Error('На сервере произошла ошибка');
      error.statusCode = 500;
      return next(error);
    });
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        next(new NotFound('Нет карточки/пользователя по заданному id'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new CastError('Невалидный id'));
      }
      if (err.message === 'NotFound') {
        next(new NotFound('Нет карточки/пользователя по заданному id'));
      }
      const error = new Error('На сервере произошла ошибка');
      error.statusCode = 500;
      return next(error);
    })
    .catch(next);
};

module.exports = {
  getCards, createCards, deleteCard, likeCard, dislikeCard,
};
