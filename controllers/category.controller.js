const httpStatus = require('http-status');
const { omit } = require('lodash');
const Category = require('../models/category.model');
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Get user
 * @public
 */
exports.get = async (req, res) => {
  try {
    const cat = await Category.get(req.params.catId);
    res.json(cat.transform());
  } catch (error) {
    return errorHandler(error, req, res)
  }
};

/**
 * Load category and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const cat = await Category.get(id);
    req.locals = { cat };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Replace Category document
 * @public
 */
exports.replace = (req, res, next) => {
  res.status(501).end();
};

/**
 * Create new category
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const cat = new Category(req.body);
    const savedCat = await cat.save();
    res.status(httpStatus.CREATED);
    res.json(savedCat.transform());
  } catch (error) {
    next(Category.checkDuplicateEmail(error));
  }
};

/**
 * Update existing category
 * @public
 */
exports.update = (req, res, next) => {
  console.log(req.params);
	const query = { "_id": req.params.catId};
	const update = { name: req.body.name };
	const options = { new: true };
	Category.findOneAndUpdate(query,update,options,(err,newCat)=>{
   if(err) return next(Category.checkDuplicatedEmail(err));
   res.json(newCat.transform());
  });
};

/**
 * Get category list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const categories = await Category.list(req.query);
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
exports.remove = (req, res, next) => {

  Category.findOneAndRemove(req.params.id)
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};
