const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil, trim } = require('lodash');
const moment = require('moment-timezone');
const Float = require('mongoose-float').loadType(mongoose, 3);
const fs = require('fs');
const APIError = require('../utils/api.error');
const cloudifyUtil = require('../utils/cloudinary.client');
const ProductGallery = require('./product.gallery.model');

/**
 * Product Schema
 * @private
 */
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 128,
    trim: true,
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  category: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Category'
  },
  price: {
    type: Float,
    min: 0,
  },
  offer: {
    type: Boolean,
    default: false,
  },
  specs: {
    type: String,
    trim: true
  },
  generateFee: {
    type: Boolean
  },
  acive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

productSchema.index({ name: 'text', description: 'text'});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
productSchema.pre('save', async function save(next) {
  try {
    console.log('Pre Save Product hook!...');
    return next();
  } catch (error) {
    return next(error);
  }
});

/**
* pre-update hooks
*/
productSchema.pre('findOneAndUpdate', async function update(next) {
  try {
    console.log('Pre Update Product hook!...');
    // this._update.$set.pictures = await cloudifyUtil.processBase64(this.pictures);
  } catch (error) {
    return next(error);
  }
});

productSchema.post('remove', async (next) => {
  try {
    console.log('Product Post remove hook!...');
    const pictures = ProductGallery.find({product: this._id});//find all pictures by product id
    if(pictures && pictures.length > 0) {
      pictures.forEach(element => {
        element.remove();//I know it may not be the best way for now but need speed things up and take advantage of PictureGallery remove hook
      });
    }
  } catch (error) {
    console.log('error executing post remove: %s', JSON.stringify(error));
    return next();
  }
})

/**
 * Methods
 */
productSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'description', 'category', 'price', 'createdAt', 'specs','offer','generateFee', 'active'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
productSchema.statics = {

  /**
   * List categories in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of categories to be skipped.
   * @param {number} limit - Limit number of categories to be returned.
   * @returns {Promise<Category[]>}
   */
  list({
    page = 1, perPage = 30, name,
  }) {
    const options = omitBy({ name }, (v) => {
      return isNil(v) || trim(v).length === 0;
    });

    if (options.name) {
      options.name = new RegExp('^.*'+options.name+'.*$', "i");
    }

    console.log('options: %s', JSON.stringify(options));
    return this.find(options)
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateEmail(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [{
          field: 'name',
          location: 'body',
          messages: ['product with "name" already exists'],
        }],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  },
};

/**
 * @typedef Product
 */
module.exports = mongoose.model('Product', productSchema);
