const Joi = require('joi');
const User = require('../models/user.model');

module.exports = {

  // GET /api/v1/users
  listUsers: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      name: Joi.string(),
      email: Joi.string(),
      role: Joi.string().valid(User.roles),
    },
  },

  // GET /api/v1/customers/search
  listLikeName: {
    query: {
      name: Joi.string().regex(/^[a-zA-Z0-9\s]{0,25}$/),
    }
  },

  // POST /api/v1/users
  createUser: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().max(128),
      name: Joi.string().max(128),
      role: Joi.string().valid(User.roles),
      address: Joi.string().max(128),
      phone: Joi.string().max(12),
    },
  },

  // POST /api/v1/users/resetpwd
  resetPwd: {
    body: {
      current: Joi.string().min(6).required(),
      newPwd: Joi.string().min(6).required(),
    },
  },

  // PUT /api/v1/users/:userId
  replaceUser: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().max(128),
      name: Joi.string().max(128),
      role: Joi.string().valid(User.roles),
    },
    params: {
      userId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },

  // PATCH /api/v1/users/:userId
  updateUser: {
    body: {
      email: Joi.string().email(),
      password: Joi.string().min(6).max(128),
      name: Joi.string().max(128),
      role: Joi.string().valid(User.roles),
      address: Joi.string().max(128),
      phone: Joi.string().max(12),
    },
    params: {
      userId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
};
