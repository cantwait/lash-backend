const httpStatus = require('http-status');
const { omit } = require('lodash');
const Customer = require('../models/customer.model');
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Get customer
 * @public
 */
exports.get = async (req, res) => {
  try {
    const c = await Customer.get(req.params.customerId);
    res.json(c.transform());
  } catch (error) {
    return errorHandler(error, req, res)
  }
};

/**
 * Create new Customer
 * @public
 */
exports.create = async (req, res, next) => {
  try {
	  console.log(req.body.birthdate);
    const c = new Customer(req.body);
    const savedCustomer = await c.save();
    res.status(httpStatus.CREATED);
    res.json(savedCustomer.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Replace existing Customer
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    //NOT implemented
    res.status(501).end();
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing Customer
 * @public
 */
exports.update = async (req, res, next) => {
  const query = { "_id": req.params.customerId};
  const update = { name: req.body.name, email: req.body.email, role: req.body.role, phone: req.body.phone, birthdate: req.body.birthdate };
	const options = {new: true};
	Customer.findOneAndUpdate(query,update,options,(err,newCustomer)=>{
   if(err) return next(err);
   res.json(newCustomer.transform());
  });
};

/**
 * Get Customer list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const Customers = await Customer.list(req.query);
    const transformedCustomers = Customers.map(customer => customer.transform());
    res.json(transformedCustomers);
  } catch (error) {
    next(error);
  }
};

/**
* Get Customer list by name (like)
* @public
*/
exports.listLikeName = async (req, res, next) => {
  try {
	  console.log('fasdf');
    const Customers = await Customer.listLikeName(req.query);
    const transformedCustomers = Customers.map(customer => customer.transform());
    res.json(transformedCustomers);
  } catch (e) {
    next(e);
  }
};

/**
 * Delete Customer
 * @public
 */
exports.remove = (req, res, next) => {
  Customer.findOneAndRemove({ "_id": req.params.customerId})
  .then(() => res.status(httpStatus.NO_CONTENT).end())
  .catch(e => next(e));
};
