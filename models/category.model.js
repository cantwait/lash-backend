const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const APIError = require('../utils/api.error');
const Product = require('./product.model');
const fs = require('fs');

/**
 * Category Schema
 * @private
 */
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 128,
    unique: true,
    index: true,
    trim: true,
  },
  icon: {
    type: String,
    required: true,
    trim: true
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
categorySchema.pre('save', async function save(next) {
  try {
    console.log('Pre Save Category hook!...');
    return next();
  } catch (error) {
    return next(error);
  }
});

categorySchema.pre('remove', async (next) => {
  try {
    console.log('Pre remove Category hook!...');
    // PREVENT the category to be removed if at least one product is associated to it.
    const prodsCount = Product.count({category: this._id}); //count products by category
    if(prodsCount > 0){
      return next(new Error('Can\'t remove a category already associated to an existing product'));
    }
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
categorySchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'createdAt', 'icon'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
categorySchema.statics = {

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
          messages: ['"name" already exists'],
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
 * @typedef Category
 */
module.exports = mongoose.model('Category', categorySchema);
