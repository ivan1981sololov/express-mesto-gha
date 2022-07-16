const Card = require('../models/card');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(next);
};

const createCards = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((cards) => res.send(cards))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const err = new Error('Переданы некорректные данные при создании карточки');
        err.statusCode = 400;
        next(err);
      } else if (err.message === 'Validation failed') {
        const err = new Error('Переданы некорректные данные при создании карточки');
        err.statusCode = 400;
        return next(err);
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
        const err = new Error('Нет карточки по заданному id');
        err.statusCode = 404;
        return next(err);
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
        const err = new Error('Карточку создали не вы!');
        err.statusCode = 403;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const err = new Error('Нет карточки по заданному id');
        err.statusCode = 404;
        next(err);
      } else if (err.message === 'NotFound') {
        const err = new Error('Нет карточки по заданному id');
        err.statusCode = 404;
        return next(err);
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
    { $addToSet: { likes: req.user._id } }, // добавляю _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        const err = new Error('Карточка с указанным _id не найдена');
        err.statusCode = 404;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const err = new Error('Невалидный id');
        err.statusCode = 403;
        next(err);
      } else if (err.message === 'NotFound') {
        const err = new Error('Нет карточки по заданному id');
        err.statusCode = 404;
        return next(err);
      }
      const error = new Error('На сервере произошла ошибка');
      error.statusCode = 500;
      return next(error);
    });
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        const err = new Error('Карточка с указанным _id не найдена');
        err.statusCode = 404;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const err = new Error('Невалидный id');
        err.statusCode = 400;
        next(err);
      } else if (err.message === 'NotFound') {
        const err = new Error('Нет карточки/пользователя по заданному id');
        err.statusCode = 404;
        return next(err);
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
