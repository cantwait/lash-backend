const mongoose = require('mongoose');
const DateOnly = require('mongoose-dateonly')(mongoose);
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const APIError = require('../utils/api.error');
const Float = require('mongoose-float').loadType(mongoose, 3);
const { ServiceSchema } = require('../models/service.model');
const fs = require('fs');
const { push } = require('../utils/pusher-cli');

const CustomerSchema = new mongoose.Schema({
  id: {
    type: mongoose.SchemaTypes.ObjectId,
    unique: true,
  },
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    maxlength: 128,
    trim: true,
  },
  birthdate: {
    type: DateOnly
  },
  phone: {
    type: String,
    minlength: 7,
    maxlength: 12,
    trim: true,
  }
});

const UserSchema = new mongoose.Schema({
  id: {
    type: mongoose.SchemaTypes.ObjectId,
    unique: true,
  },
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    maxlength: 128,
    trim: true,
  },
  role: {
    type: String,
  },
  picture: {
    type: String,
    trim: true,
  },
  fee: {
    type: Number,
  },
});

/**
* Session State
*/
const states = ['opened', 'closed'];

/**
 * Session Schema
 * @private
 */
const sessionSchema = new mongoose.Schema({
  comment: {
    type: String,
    maxlength: 500,
    trim: true
  },
  endDate: {
    type: Date,
  },
  services: [ServiceSchema],
  owner: UserSchema,
  total: {
    type: Float,
    min: 0,
  },
  rating: {
    type: Number
  },
  customer: CustomerSchema,
  state: {
    type: String,
    enum: states,
    default: 'opened',
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
sessionSchema.pre('save', async function save(next) {
  try {
    console.log('Pre Save Session hook!...');
    return next();
  } catch (error) {
    return next(error);
  }
});

sessionSchema.pre('remove', async (next) => {
  try {
    console.log('Pre Session Category hook!...');
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
 * - post-save
 */
sessionSchema.post('save', async (s, next) => {
  try {
    push('sessions', 'onSession', s);
    return next();
  } catch(e) {
    console.log(e);
    return next(e);
  }
});

/**
 * Methods
 */
sessionSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
sessionSchema.statics = {

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
 * @typedef Session
 */
module.exports = mongoose.model('Session', sessionSchema);
