const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const moment = require('moment-timezone');
const fs = require('fs');
const APIError = require('../utils/api.error');
const User = require('./user.model');

/**
 * Comment Schema
 * @private
 */
const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    maxlength: 350,
    trim: true,
    text: true,
  },
  user: {
    type: User
  },
  uId: {
    type: mongoose.SchemaType.ObjectId,
    ref: 'User'
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
commentSchema.pre('save', async function save(next) {
  try {
    console.log('Pre Save Comment hook!...');
    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
commentSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'text','user','createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
commentSchema.statics = {

  /**
   * List categories in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of categories to be skipped.
   * @param {number} limit - Limit number of categories to be returned.
   * @returns {Promise<Category[]>}
   */
  list({
    page = 1, perPage = 30,
  }) {
    // const options = omitBy({ name }, isNil);

    return this.find()
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

};

/**
 * @typedef Comment
 */
module.exports = mongoose.model('Comment', commentSchema);
