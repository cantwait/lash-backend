const Joi = require('joi');
const Category = require('../models/product.model');

module.exports = {

  // GET /api/v1/products
  listProducts: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      name: Joi.string(),
    },
  },

  // POST /api/v1/products
  createProduct: {
    body: {
      name: Joi.string().min(3).max(128).required(),
      description: Joi.string().min(5).max(500).required(),
      price: Joi.number().positive().required(),
      pictures: Joi.array(),
      category: Joi.isRef('Category')
    },
  },

  // PUT /api/v1/products/:pId
  replaceProduct: {
    body: {
      name: Joi.string().min(3).max(128).required(),
      description: Joi.string().min(5).max(500).required(),
      price: Joi.number().positive().required(),
      pictures: Joi.array(),
      category: Joi.isRef('Category')
    },
    params: {
      catId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },

  // PATCH /api/v1/products/:pId
  updateProduct: {
    body: {
      name: Joi.string().min(3).max(128).required(),
      description: Joi.string().min(5).max(500).required(),
      price: Joi.number().positive().required(),
      pictures: Joi.array(),
      category: Joi.isRef('Category')
    },
    params: {
      catId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
};
