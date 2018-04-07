const httpStatus = require('http-status');
const { omit, forEach } = require('lodash');
const Product = require('../models/product.model');
const { handler: errorHandler } = require('../middlewares/error');
const cloudinaryUtil = require('../utils/cloudinary.client');
const ProductGallery = require('../models/product.gallery.model');
const APIError = require('../utils/api.error');

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
    const populatedP = await savedP.populate('category').execPopulate();
    const pTrans = populatedP.transform();
    const cat = pTrans.category.transform();
    pTrans.category = cat;
    res.json(pTrans);
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
	const update = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    specs: req.body.specs,
    offer: req.body.offer,
    generateFee: req.body.generateFee,
  };
	const options = { new: true };
   const uP = await Product.findOneAndUpdate(query,update,options).populate('category');
   const pTrans = uP.transform();
   const cat = pTrans.category.transform();
   pTrans.category = cat;
   res.json(pTrans);
};

/**
 * Get product list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const products = await Product.list(req.query);
    const transformedProds = products.map(p => {
	    const pTrans = p.transform();
	    const cat = pTrans.category.transform();
	    pTrans.category = cat;
	   return  pTrans;
    });
    res.json(transformedProds);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product
 * @public
 */
exports.remove = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.pId);
    if(!p) {
      return next(new Error(`Product Id ${req.params.pId} does not exist!`));
    }
    p.remove();
    res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    next(error);
  }
};

/**
 * list pictures assosiated to a product
 */
module.exports.listPics = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.pId);//let's make sure the product really existed in the first place
    if(!p) {
      return next(new Error('Can\'t list pictures for a product that does not exist!'));
    }
    const pics = await ProductGallery.list(req.params.pId, req.query);
    const transformedPics = pics.map(pic => pic.transform());
    res.json(transformedPics);
  } catch (error) {
    next(error);
  }
};

/**
 * Add Picture to product
 * @public
 */
module.exports.addPic = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.pId);//make sure it really exists
    if(!p) {
      return next(new Error('Can\'t add picture: product does not exist!'));
    }
    const pBody = {
      product: req.params.pId,
      name: req.body.name,
      url: req.body.url
    };
    const pic = new ProductGallery(pBody);
    const savedPic = await pic.save();
    res.status(httpStatus.CREATED);
    res.json(savedPic.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Add multiple Pictures to product at once
 * @public
 */
module.exports.addPics = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.pId);//make sure it really exists
    if(!p) {
      return next(new Error('Can\'t add pictures: product does not exist!'));
    }
    const pPics = [];
    await forEach(req.body.urls, async (url) => {
      const pBody = {
        product: req.params.pId,
        name: req.body.name,
        url: url,
      };
      const pic = new ProductGallery(pBody);
      const savedPic = await pic.save();
      pPics.push(savedPic.transform());
    });
    res.status(httpStatus.CREATED);
    res.json(pPics);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete picture from product
 * @public
*/
module.exports.removePic = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.pId);//make sure it exists
    if(!p) {
      return next(new Error('The product does not exist!'));
    }
    const pic = await ProductGallery.findById(req.params.picId);// get the picture
    if(!pic){
      return next(new Error('Can\'t remove a picture that does not exist!'));
    }
    console.log('pic id: %s',pic.id);
    pic.remove();//remove <-- this will make sure 'pre' remove hook gets invoked correctly (remove from cloudinary) -optimize resources- :)
    res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    next(error);
  }
}
