const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const moment = require('moment-timezone');
const APIError = require('../utils/api.error');
const fs = require('fs');
const mongoosePaginate = require('mongoose-paginate');


/**
 * Customer Schema
 * @private
 */
const customerSchema = new mongoose.Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  name: {
    type: String,
    maxlength: 128,
    index: true,
    trim: true,
  },
  phone: {
    type: String,
    minlength: 7,
    maxlength: 12,
    index: true,
    trim: true,
  }
}, {
  timestamps: true,
});

customerSchema.plugin(mongoosePaginate);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
customerSchema.pre('save', async function save(next) {
  try {
    console.log('users pre save hook!...');
    return next();
  } catch (error) {
    return next(error);
  }
});

customerSchema.post('update', async (next) => {
  try {
    this._update.$set.updateAt = moment.now();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
customerSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'email', 'createdAt', 'updatedAt', 'phone'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
customerSchema.statics = {

  /**
   * List customers in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of customers to be skipped.
   * @param {number} limit - Limit number of customers to be returned.
   * @returns {Promise<User[]>}
   */
  list({
    page = 1, perPage = 30, name, email
  }) {
    const options = omitBy({ name, email }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
};

/**
 * @typedef Customer
 */
module.exports = mongoose.model('Customer', customerSchema);
