const Joi = require('joi');

const createUser = {
  body: Joi.object().keys({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    email: Joi.string().trim().lowercase().email().required(),
    country: Joi.string().trim().required(),
    password: Joi.string()
      .min(8)
      .regex(/[a-zA-Z]/)
      .regex(/\d/)
      .required(),
    role: Joi.string().valid('user', 'admin').optional(),
  }),
};

module.exports = {
  createUser,
};
