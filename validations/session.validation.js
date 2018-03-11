const Joi = require('joi');
const Session = require('../models/session.model');

module.exports = {

  // GET /api/v1/sessions
  listSessions: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      name: Joi.string(),
    },
  },

  // POST /api/v1/sessions
  createSession: {
    body: {

    },
  },

  // PATCH /api/v1/sessions/:sess(d)
  updateSession: {
    body: {
      name: Joi.string().max(128),
    },
    params: {
      sessId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
};
