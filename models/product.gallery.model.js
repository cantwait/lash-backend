const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil, isArray } = require('lodash');
const moment = require('moment-timezone');
const Float = require('mongoose-float').loadType(mongoose, 3);
const fs = require('fs');
const APIError = require('../utils/api.error');
const cloudifyUtil = require('../utils/cloudinary.client');
const s3Utils = require('../utils/s3.client');

/**
 * ProductGallery Schema
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
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Product'
  },
  url: {
    type: String
  },
  picId: {
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
    this.picId = Math.floor(1000000 + Math.random() * 9000000) + '.png';
    if (isArray(this.url)) {
      this.url = await cloudifyUtil.processBase64Array(this.url);
    } else {
	try {
	  this.url = await s3Utils.uploadFileS3(this.url, this.picId);
	} catch (e) {
	  console.log(JSON.stringify(e));
	  return next(e);
	}
    }
    console.log('url: %s', this.url);
    return next();
  } catch (error) {
    return next(error);
  }
});

productGallerySchema.pre('remove', async function remove(next) {
  try {
    console.log('pre remove Gallery hook!...');
    s3Utils.destroyS3Object(this.picId);
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
  list(pId,{
    page = 1, perPage = 30,
  }) {

    return this.find({product: pId})
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
};

/**
 * @typedef ProductGallery
 */
module.exports = mongoose.model('ProductGallery', productGallerySchema);
