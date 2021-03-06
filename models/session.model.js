const mongoose = require('mongoose');
const DateOnly = require('mongoose-dateonly')(mongoose);
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const { toUTC, dateTime } = require('../utils/time');
const APIError = require('../utils/api.error');
const Float = require('mongoose-float').loadType(mongoose, 3);
const { ServiceSchema } = require('../models/service.model');
const fs = require('fs');
const { push } = require('../utils/pusher-cli');
const Balance = require('./balance.model');
const { sessionChannel, onRemovedSessionEvt, onSessionEvt, env } = require('../config/vars');
const moment = require('moment-timezone');

const INCOME = 'income';

const CustomerSchema = new mongoose.Schema({
  id: {
    type: mongoose.SchemaTypes.ObjectId,
    index: true,
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
 * Transaction Type const
 */
const types = ['cash','card'];

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
  services: {
    type: [ServiceSchema],
    default: [],
  },
  owner: UserSchema,
  total: {
    type: Float,
    min: 0,
    default: 0,
  },
  itbms: {
    type: Float,
    min: 0,
    default: 0,
  },
  subtotal: {
    type: Float,
    min: 0,
    default: 0,
  },
  rating: {
    type: Number
  },
  transactionType: {
    type: String,
    enum: types,
  },
  customer: CustomerSchema,
  state: {
    type: String,
    enum: states,
    default: 'opened',
  },
  isTax: {
    type: Boolean,
  },
  discount: {
    type: Number,
    default: 0,
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
    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * - post-save
 */
sessionSchema.post('save', async (s, next) => {
  try {
    if(!s.isCrudUpdate) {
      if (s.state === 'closed'){
        console.log('finishing session status: %s', s.state);
        push(sessionChannel, onRemovedSessionEvt,s.id);
        const balance = new Balance({
          desc: `Entrada de dinero por sesion de cliente: ${s.customer.name}`,
          amount: s.total > 0 ? s.total : s.subtotal,
          mode: INCOME,
          sessionId: s._id,
        });
        balance.save();
      } else if (s.state === 'opened') {
        console.log('channel: %s, event: %s, env: %s', sessionChannel, onSessionEvt, env);
        console.log('on post save: %s',JSON.stringify(s));
        push(sessionChannel, onSessionEvt, s.transform());
      }
    } else {
      console.log('do nothing probably a simple update!');
    }
    return next();
  } catch(e) {
    console.log(e);
    return next(e);
  }
});

/**
 * post-remove hook
 */
sessionSchema.post('remove', async (s, next) => {
	try{
    console.log('session post remove hook...!');
    push(sessionChannel,onRemovedSessionEvt, s.id);
    const balance = await Balance.findOne({sessionId: s.id});
    if (balance) {
      console.log('removing associated balance: %s', JSON.stringify(balance));
      balance.remove();
    }
		return next();
	}catch (e) {
		console.log('Error on session post remove hook: %s', JSON.stringify(e));
		return next(e);
	}

});

/**
 * Methods
 */
sessionSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'services', 'owner', 'total', 'rating', 'customer', 'state', 'endedAt','createdAt','comment','subtotal','itbms','isTax','transactionType','discount'];

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

  listBalance(date) {

    let gte = null;
    let lte = null;
    console.log('about to query balance...');
    if (env === 'production') {
      gte = moment(dateTime(date, '07:00:00')).add(5, 'hours').format();
      lte = moment(dateTime(date, '23:59:59')).add(5,'hours').format();
    } else {
      gte = toUTC(dateTime(date, '07:00:00'));
      lte = toUTC(dateTime(date, '23:59:59'));
    }
    console.log('querying sessions from: %s, to: %s', gte, lte);
    return this.find({ createdAt: { $gte: gte, $lte: lte}})
      .sort({ createdAt: -1 })
      .exec();
  },

  /**
   * List sessions in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of categories to be skipped.
   * @param {number} limit - Limit number of categories to be returned.
   * @returns {Promise<Category[]>}
   */
  list({
    page = 1, perPage = 30, name, state = 'opened'
  }) {
    const options = omitBy({ name }, isNil);
    options.state = state;
    if (state === 'any') delete options.state;

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
