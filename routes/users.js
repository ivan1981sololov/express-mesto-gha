const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const router = require('express').Router();
const {
  getUsers, getUserById, updateUser, updateAvatar, getUserMe,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getUserMe);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().min(24).max(24).hex()
      .required(),
  }),
}), getUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    about: Joi.string().min(2).max(30).required(),
  }),
}), updateUser);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().custom((value, helper) => {
      if (validator.isURL(value, { require_protocol: true })) {
        return value.match(/https?:\/\/(www\.)?[-\w@:%\\+~#=]{1,256}\.[a-z0-9()]{1,6}\b([-\w()@:%\\+~#=//?&]*)/i);
      }
      return helper.message('Невалидный url');
    }),
  }),
}), updateAvatar);

module.exports = router;
