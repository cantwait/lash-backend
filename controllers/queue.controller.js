const httpStatus = require('http-status');
const { omit } = require('lodash');
const Queue = require('../models/queue.customer.model');
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Create new queue
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const q = new Queue(req.body);
    const savedq = await q.save();
    res.status(httpStatus.CREATED);
    res.json(savedq.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Get category list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const queues = await Queue.list(req.query);
    const transformedqs = queues.map(cat => q.transform());
    res.json(transformedqs);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete queue
 * @public
 */
exports.remove =  async (req, res, next) => {
  try {
    const q = await Queue.findById(req.params.qId);
    if(!q) {
      return next(new Error('Queue does not exist!'));
    }
    q.remove();
    res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
};
