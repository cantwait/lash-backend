const Joi = require('joi');
const Category = require('../models/category.model');

module.exports = {

  // GET /api/v1/categories
  listCategories: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      name: Joi.string(),
    },
  },

  // POST /api/v1/categories
  createCategory: {
    body: {
      name: Joi.string().max(128),
    },
  },

  // PUT /api/v1/categories/:catId
  replaceCategory: {
    body: {
      name: Joi.string().max(128),
    },
    params: {
      catId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },

  // PATCH /api/v1/categories/:catId
  updateCategory: {
    body: {
      name: Joi.string().max(128),
    },
    params: {
      catId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
};
