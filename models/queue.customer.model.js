const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const moment = require('moment-timezone');
const Float = require('mongoose-float').loadType(mongoose, 3);
const fs = require('fs');
const APIError = require('../utils/api.error');
const cloudifyUtil = require('../utils/cloudinary.client');
const CustomerSchema = require('./service.model');

/**
 * Customer Queue Schema
 * @private
 */
const queueSchema = new mongoose.Schema({
  customer: {
    type: CustomerSchema,
    required: true,
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
queueSchema.pre('save', async function save(next) {
  try {
    //TODO: implement if needed
    console.log('Pre Queue Product hook!...');
    return next();
  } catch (error) {
    return next(error);
  }
});

/**
* pre-update hooks
*/
queueSchema.pre('findOneAndUpdate', async function update(next) {
  try {
    console.log('Pre Update Queue hook!...');
    // TODO: implement if needed
    // this._update.$set.pictures = await cloudifyUtil.processBase64(this.pictures);
    next();
  } catch (error) {
    return next(error);
  }
});

queueSchema.post('remove', async (next) => {
  try {
    console.log('Queue Post remove hook!...');
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
queueSchema.method({
  transform() {
    const transformed = {};
    const fields = ['Customer', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
queueSchema.statics = {

  /**
   * List categories in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of categories to be skipped.
   * @param {number} limit - Limit number of categories to be returned.
   * @returns {Promise<Category[]>}
   */
  list({
    page = 1, perPage = 60,
  }) {

    return this.find()
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
};

/**
 * @typedef QueueCustomer
 */
module.exports = mongoose.model('QueueCustomer', queueSchema);
