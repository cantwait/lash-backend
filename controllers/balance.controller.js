const httpStatus = require('http-status');
const { omit } = require('lodash');
const Balance = require('../models/balance.model');
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Get user
 * @public
 */
exports.get = async (req, res) => {
  try {
    const bal = await Balance.get(req.params.balId);
    res.json(bal.transform());
  } catch (error) {
    return errorHandler(error, req, res)
  }
};

/**
 * Create new balance entry
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const bal = new Balance(req.body);
    const savedBal = await bal.save();
    res.status(httpStatus.CREATED);
    res.json(savedBal.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing Balance
 * @public
 */
exports.update = (req, res, next) => {
	const query = { "_id": req.params.balId};
	const update = { desc: req.body.desc, amount: req.body.amount, mode: req.body.mode };
	const options = { new: true };
	Balance.findOneAndUpdate(query,update,options,(err,newBal)=>{
   if(err) return next(err);
   res.json(newBal.transform());
  });
};

/**
 * Get balance list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const balances = await Balance.list(req.query);
    const transformedBals = balances.map(bal => bal.transform());
    res.json(transformedBals);
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
    const bal = await Balance.findById(req.params.catId);
    if(!bal) {
      return next(new Error('Balance does not exist!'));
    }
    bal.remove();
    res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    console.error('Error: %s', error); 
    return next(error);
  }
};
