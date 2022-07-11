const Card = require('../models/card');

const getCards = (req, res) => Card.find({})
  .then((cards) => res.status(200).send(cards))
  .catch((err) => {
    console.log(`Error${err}`);
    res.status(500).send({ msg: 'Error!' });
  });

const createCards = (req, res) => {
  const owner = req.user._id;
  const { name, link } = req.body;
  return Card.create({ owner, name, link })
    .then((cards) => res.status(200).send(cards))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ msg: 'Некорректные данные' });
      } else {
        console.log(`Error${err}`);
        res.status(500).send({ msg: 'Error!' });
      }
    });
};

const deleteCard = (req, res) => Card.findByIdAndDelete(req.params.cardId)
  .then((card) => {
    if (!card) throw new Error('Нет карточки/пользователя по заданному id');
    return res.status(200).send(card);
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      res.status(400).send({ msg: 'Невалидный id' });
    }
    if (err.message === 'Нет карточки/пользователя по заданному id') {
      res.status(404).send({ msg: 'Нет карточки' });
    } else {
      console.log(`Error${err}`);
      res.status(500).send({ msg: 'Error!' });
    }
  });

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      if (!card) throw new Error('Нет карточки/пользователя по заданному id');
      else {
        return res.status(200).send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Невалидный id ' });
      } else if (err.message === 'Нет карточки/пользователя по заданному id') {
        res.status(404).send({ msg: 'Нет карточки' });
      } else {
        console.log(`Error${err}`);
        res.status(500).send({ msg: 'ошибка по-умолчанию' });
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      if (!card) throw new Error('Нет карточки/пользователя по заданному id');
      return res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Невалидный id ' });
      } else if (err.message === 'Нет карточки/пользователя по заданному id') {
        res.status(404).send({ msg: 'Нет карточки' });
      } else {
        console.log(`Error${err}`);
        res.status(500).send({ msg: 'ошибка по-умолчанию' });
      }
    });
};

module.exports = {
  getCards, createCards, deleteCard, likeCard, dislikeCard,
};
