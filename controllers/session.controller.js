const httpStatus = require('http-status');
const { omit } = require('lodash');
const Session = require('../models/category.model');
const { handler: errorHandler } = require('../middlewares/error');


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

/**
 * Update existing Session
 * @public
 */
exports.update = (req, res, next) => {
	const query = { "_id": req.params.sessId};
  const update = {
    name: req.body.name,
    comment: req.body.comment,
    services: req.body.services,
    owner: req.body.owner,
    total: req.body.total,
    rating: req.body.rating,
    customer: req.body.customer,
  };
	const options = { new: true };
	Session.findOneAndUpdate(query,update,options,(err,newSession)=>{
   if(err) return next(err);
   res.json(newSession.transform());
  });
};

/**
 * Get Session list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const sessions = await Session.list(req.query);
    const transformedCats = categories.map(cat => cat.transform());
    res.json(transformedCats);
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
