const Joi = require('joi');
const Queue = require('../models/queue.customer.model');

module.exports = {

  // GET /api/v1/queues
  listQueues: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      name: Joi.string(),
    },
  },

  // POST /api/v1/queues
  createQueue: {
    body: {
      customer: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
};
