const Joi = require('joi');
const User = require('../models/customer.model');

module.exports = {

  // GET /api/v1/customers
  listCustomers: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string(),
    },
  },

  // GET /api/v1/customers/search
  listLikeName: {
    query: {
      name: Joi.string().regex(/^[a-zA-Z0-9\s]{0,25}$/),
    }
  },

  // POST /api/v1/customers
  createCustomer: {
    body: {
      email: Joi.string().email().required(),
      name: Joi.string().min(3).max(128).required(),
      phone: Joi.string().min(7).max(12),
      birthdate: Joi.date().required(),
    },
  },

  // PUT /api/v1/customers/:userId
  replaceCustomer: {
    body: {
      email: Joi.string().email().required(),
      name: Joi.string().min(3).max(128).required(),
      phone: Joi.string().min(7).max(12),
      birthdate: Joi.date().required(),
    },
    params: {
      customerId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },

  // PATCH /api/v1/customers/:userId
  updateCustomer: {
    body: {
      email: Joi.string().email(),
      name: Joi.string().min(3).max(128),
      phone: Joi.string().min(7).max(12),
      birthdate: Joi.date().required(),
    },
    params: {
      customerId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
};
