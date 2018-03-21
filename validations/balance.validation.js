const Joi = require('joi');
const Balance = require('../models/balance.model');

module.exports = {

  // GET /api/v1/balances
  listBalances: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
    },
  },

  // POST /api/v1/balances
  createBalance: {
    body: {
      desc: Joi.string().min(3).max(128).required(),
      mode: Joi.string().required(),
      amount: Joi.number().required(),
    },
  },

  // PATCH /api/v1/balances/:balId
  updateBalance: {
    body: {
      desc: Joi.string().min(3).max(128).required(),
      mode: Joi.string().required(),
      amount: Joi.number().required(),
    },
    params: {
      balId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
};
