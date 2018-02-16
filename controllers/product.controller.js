const httpStatus = require('http-status');
const { omit } = require('lodash');
const Product = require('../models/product.model');
const { handler: errorHandler } = require('../middlewares/error');
const cloudinaryUtil = require('../utils/cloudinary.client');

/**
 * Get product
 * @public
 */
exports.get = async (req, res) => {
  try {
    const cat = await Product.get(req.params.pId);
    res.json(cat.transform());
  } catch (error) {
    return errorHandler(error, req, res)
  }
};

/**
 * Load product and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const cat = await Product.get(id);
    req.locals = { cat };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Replace Product document
 * @public
 */
exports.replace = (req, res, next) => {
  res.status(501).end();
};

/**
 * Create new product
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const p = new Product(req.body);
    const savedP = await p.save();
    res.status(httpStatus.CREATED);
    res.json(savedP.transform());
  } catch (error) {
    next(Product.checkDuplicateEmail(error));
  }
};

/**
 * Update existing product
 * @public
 */
exports.update =  async (req, res, next) => {
  console.log(req.params);
  const query = { "_id": req.params.pId};
  const pictures = cloudinaryUtil.processBase64Array(req.params.pictures);
	const update = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category
  };
  if(pictures && pictures.length) {
    update['pictures'] = pictures;
  }
	const options = { new: true };
	Product.findOneAndUpdate(query,update,options,(err,newProd)=>{
   if(err) return next(Product.checkDuplicatedEmail(err));
   res.json(newProd.transform());
  });
};

/**
 * Get product list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const products = await Product.list(req.query);
    const transformedProds = products.map(p => p.transform());
    res.json(transformedProds);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product
 * @public
 */
exports.remove = (req, res, next) => {
  Product.findOneAndRemove(req.params.pId)
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};
