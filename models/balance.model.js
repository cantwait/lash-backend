const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const Float = require('mongoose-float').loadType(mongoose, 3);
const APIError = require('../utils/api.error');
const fs = require('fs');


const modes = ['outcome','income'];

/**
 * Balance Schema
 * @private
 */
const balanceSchema = new mongoose.Schema({
  desc: {
    type: String,
    maxlength: 128,
    index: true,
    trim: true,
  },
  'mode': {
    type: String,
    enum: modes,
    default: 'user',
    required: true,
  },
  amount: {
    type: Float,
    required: true,
    trim: true
  },
  sessionId: {
    type: String,
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
balanceSchema.pre('save', async function save(next) {
  try {
    console.log('Pre Save Balance hook!...');
    return next();
  } catch (error) {
    return next(error);
  }
});

balanceSchema.pre('remove', async (next) => {
  try {
    console.log('Pre remove Balance hook!...');
    // PREVENT the category to be removed if at least one product is associated to it.
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
balanceSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'desc', 'createdAt', 'amount', 'mode'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
balanceSchema.statics = {

  /**
   * List Balances in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of balance to be skipped.
   * @param {number} limit - Limit number of balance to be returned.
   * @returns {Promise<Category[]>}
   */
  list({
    page = 1, perPage = 30,
  }) {
    const options = omitBy({ }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
};

/**
 * @typedef Balance
 */
module.exports = mongoose.model('Balance', balanceSchema);
