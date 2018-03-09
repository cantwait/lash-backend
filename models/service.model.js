const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const moment = require('moment-timezone');
const Float = require('mongoose-float').loadType(mongoose, 3);
const fs = require('fs');
const APIError = require('../utils/api.error');
const cloudifyUtil = require('../utils/cloudinary.client');
const Product = require('./product.model');
const User = require('./user.model');


/**
 * Service Schema
 * @private
 */
const serviceSchema = new mongoose.Schema({
  comment: {
    type: String,
    maxlength: 500,
    trim: true
  },
  product: [Product],
  isPromotion: {
    type: Boolean,
    default: false
  },
  total: {
    type: Float,
    min: 0,
  },
  rating: {
    type: Number
  },
  customer: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Customer'
  },
  collaborator: {
    type: User,
    required: true
   }
}, {
  timestamps: true,
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
serviceSchema.pre('save', async function save(next) {
  try {
    //TODO: implement if needed
    console.log('Pre Service Product hook!...');
    return next();
  } catch (error) {
    return next(error);
  }
});

/**
* pre-update hooks
*/
serviceSchema.pre('findOneAndUpdate', async function update(next) {
  try {
    console.log('Pre Update Product hook!...');
    // TODO: implement if needed
    // this._update.$set.pictures = await cloudifyUtil.processBase64(this.pictures);
    next();
  } catch (error) {
    return next(error);
  }
});

serviceSchema.post('remove', async (next) => {
  try {
    console.log('Service Post remove hook!...');
    // TODO: implement if needed
    next();
  } catch (error) {
    console.log('error executing post remove: %s', JSON.stringify(error));
    return next();
  }
})

/**
 * Methods
 */
serviceSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'comment', 'category', 'price', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
serviceSchema.statics = {

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
    const options = omitBy({ name }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
};

/**
 * @typedef Service
 */
module.exports = {
  Service: mongoose.model('Service', serviceSchema)
};
