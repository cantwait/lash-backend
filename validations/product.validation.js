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
      name: Joi.string().min(2).max(128).required(),
      description: Joi.string().min(2).max(500).required(),
      price: Joi.number().positive().required(),
      category: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
      specs: Joi.string().max(500).allow(''),
    }
  },

  // PUT /api/v1/products/:pId
  replaceProduct: {
    body: {
      name: Joi.string().min(3).max(128).required(),
      description: Joi.string().min(5).max(500).required(),
      price: Joi.number().positive().required(),
      category: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
      specs: Joi.string().max(500).allow(''),
    },
    params: {
      pId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },

  // PATCH /api/v1/products/:pId
  updateProduct: {
    body: {
      name: Joi.string().min(3).max(128).required(),
      description: Joi.string().min(5).max(500).required(),
      price: Joi.number().positive().required(),
      category: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
      specs: Joi.string().max(500).allow(''),
    },
    params: {
      pId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
  // DELETE /api/v1/products/:pId
  removeProduct: {
	params: {
	  pId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
	},
  },

  //GET /api/v1/products/:pId/gallery
  listPics: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
    },
    params: {
      pId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
  //POST /api/v1/products/:pId/gallery
  addPic: {
    body: {
      name: Joi.string().min(3).max(128),
      url: Joi.string().required(),
    },
    params: {
      pId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
  //POST /api/v1/products/:pid/galleries
  addPics: {
    body: {
      name: Joi.string().min(3).max(128),
      pictures: Joi.array().required(),
    },
    params: {
      pId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
  //DELETE /api/v1/products/:pId/gallery
  removePic: {
    params: {
      pId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
      picId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  }
};
