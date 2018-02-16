const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const moment = require('moment-timezone');
const Float = require('mongoose-float').loadType(mongoose, 3);
const fs = require('fs');
const APIError = require('../utils/api.error');
const cloudifyUtil = require('../utils/cloudinary.client');

/**
 * Product Schema
 * @private
 */
const productGallerySchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 128,
    index: true,
    trim: true,
  },
  product: {
    type: mongoose.SchemaType.ObjectId,
    ref: 'Product'
  },
  url: {
    type: String
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
productGallerySchema.pre('save', async function save(next) {
  try {
    console.log('Pre Save Gallery hook!...');
    this.url = await cloudifyUtil.processBase64Object(this.url);
    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
productGallerySchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'url', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
productGallerySchema.statics = {

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

    return this.find()
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
};

/**
 * @typedef ProductGallery
 */
module.exports = mongoose.model('Product', productGallerySchema);
