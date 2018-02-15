const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const moment = require('moment-timezone');
const Float = require('mongoose-float').loadType(mongoose, 3);
const fs = require('fs');
const APIError = require('../utils/api.error');

/**
 * Product Schema
 * @private
 */
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 128,
    unique: true,
    index: true,
    trim: true,
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  pictures: {
    type: [String]
  },
  category: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Category'
  },
  price: {
    type: Float,
    min: 0,
  },
}, {
  timestamps: true,
});

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
 * Methods
 */
productSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'description', 'pictures', 'category', 'price', 'createdAt'];

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
    const options = omitBy({ name }, isNil);

    return this.find(options)
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
