const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const moment = require('moment-timezone');
const Float = require('mongoose-float').loadType(mongoose, 3);
const fs = require('fs');
const APIError = require('../utils/api.error');
const cloudifyUtil = require('../utils/cloudinary.client');
const Customer = require('./customer.model');
const { push } = require('../utils/pusher-cli');

/**
 * Customer Queue Schema
 * @private
 */
const queueSchema = new mongoose.Schema({
  customer: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Customer'
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
 * - post-save
 */
queueSchema.post('save', async (q, next) => {
  try {
    // TODO we probably need to send the newly created queue to pusher to update the UI in real time...
    // PUSHER logic must be here.
    const queue = {
      id: q.id,
      customer: await Customer.findById(q.customer),
    }
    push('queues', 'onNewQueue', queue);
    return next();
  } catch(e) {
    console.log(e);
    return next(e);
  }
});

queueSchema.post('remove', async (q, next) => {
  try {
    console.log('queue: %s', q);
    push('queues', 'onQueueRemoved', q.id);
    return next();
  } catch(e) {
    return next(e);
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
    const fields = ['id','customer', 'createdAt', 'updatedAt'];

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
      .populate({
        path: 'customer',
        select: 'email name birthdate phone'
      })
      .sort({ createdAt: 1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
};

/**
 * @typedef QueueCustomer
 */
module.exports = mongoose.model('QueueCustomer', queueSchema);
