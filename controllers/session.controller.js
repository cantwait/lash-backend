const httpStatus = require('http-status');
const { omit } = require('lodash');
const Session = require('../models/session.model');
const { handler: errorHandler } = require('../middlewares/error');
const sessionService =  require('../services/session.services');

const ITBMS = 0.07;

/**
 * Create new Session
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const ses = new Session(req.body);
    const savedSession = await ses.save();
    res.status(httpStatus.CREATED);
    res.json(savedSession.transform());
  } catch (error) {
    next(error);
  }
};

exports.balance = async (req, res, next) => {
  try {
    const date = req.params.date;
    const sessions = await Session.listBalance(date);
    const transformedSessions = sessions.map(s => s.transform());
    res.json(transformedSessions);
  } catch (e) {
    next(e);
  }
};

/**
 * Update existing Session
 * @public
 */
exports.update = async (req, res, next) => {
	const query = { "_id": req.params.sessId};
	console.log('updating session id: %s', query["_id"]);
  const update = {
    name: req.body.name,
    comment: req.body.comment,
    services: req.body.services,
    owner: req.body.owner,
    rating: req.body.rating,
    customer: req.body.customer,
    state: req.body.state,
    subtotal: req.body.subtotal,
    isTax: req.body.isTax,
    transactionType: req.body.transactionType,
    discount: req.body.discount,
    isCrudUpdate: req.body.isCrudUpdate,
  };
  const session = await Session.findById(query);
  if (!session) {
     res.status(404).end();
  }
	console.log('session found setting new values: %s', JSON.stringify(update));
  session.name = update.name;
  session.comment = update.comment;
  session.services = update.services;
  session.owner = update.owner;
  session.isTax = update.isTax;
  session.discount = update.discount;
  session.isCrudUpdate = update.isCrudUpdate ? update.isCrudUpdate : false;

  session.subtotal = await sessionService.recalculatesubTotal(update.services, update.discount);

  session.itbms = update.isTax ? (session.subtotal * ITBMS) : 0;

  session.total = await sessionService.recalculateTotal(update.isTax, session.subtotal, session.itbms);

  session.rating = update.rating;
  session.customer = update.customer;
  session.state = update.state;
  session.transactionType = update.transactionType;
  const pSession = await session.save();
  res.json(pSession.transform());
};

/**
 * Get Session list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const sessions = await Session.list(req.query);
    const transformedSessions = sessions.map(s => s.transform());
    res.json(transformedSessions);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete cat
 * @public
 */
exports.remove =  async (req, res, next) => {
  try {
    const ses = await Session.findById(req.params.sessId);
    if(!ses) {
      return next(new Error('Session does not exist!'));
    }
    ses.remove();
    res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
};
