const User = require('../models/user');

const getUsers = (req, res) => User.find({})
  .then((users) => res.status(200).send(users))
  .catch((err) => {
    console.log(`Error${err}`);
    res.status(500).send({ msg: 'Error!' });
  });

const getUser = (req, res) => {
  const { id } = req.params;
  return User.findById(id)
    .then((user) => {
      if (user) {
        return res.status(200).send(user);
      }
      return res.status(404).send({ msg: 'Not Found' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ msg: 'Невалидный id' });
      } else {
        console.log(`Error${err}`);
        res.status(500).send({ msg: 'Error!' });
      }
    });
};

const createUser = (req, res) => User.create({ ...req.body })
  .then((user) => res.status(200).send(user))
  .catch((err) => {
    if (err.name === 'ValidationError') {
      res.status(400).send({ msg: 'Некорректные данные' });
    } else {
      console.log(`Error${err}`);
      res.status(500).send({ msg: 'Error!' });
    }
  });

const updeteProfile = (req, res) => {
  const id = req.user._id;
  const { name, about } = req.body;
  return User.findByIdAndUpdate(
    id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ msg: 'Некорректные данные' });
      } else {
        console.log(`Error${err}`);
        res.status(500).send({ msg: 'Error!' });
      }
    });
};

const updateAvatar = (req, res) => {
  const id = req.user._id;
  const { name, about } = req.params;
  return User.findByIdAndUpdate(
    id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      console.log(user);
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ msg: 'Некорректные данные' });
      } else {
        console.log(`Error${err}`);
        res.status(500).send({ msg: 'Error!' });
      }
    });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updeteProfile,
  updateAvatar,
};
