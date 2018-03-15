const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const moment = require('moment-timezone');
const fs = require('fs');
const Float = require('mongoose-float').loadType(mongoose, 3);
const APIError = require('../utils/api.error');
const cloudifyUtil = require('../utils/cloudinary.client');


const ProductSchema = new mongoose.Schema({
  id: {
    type: mongoose.SchemaTypes.ObjectId,
  },
  name: {
    type: String,
    maxlength: 128,
    trim: true,
  },
  category: {
    type: String,
  },
  price: {
    type: Float,
    min: 0,
  },
});
const UserSchema = new mongoose.Schema({
  _id: {
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
 * Service Schema
 * @private
 */
const serviceSchema = new mongoose.Schema({
  product: ProductSchema,
  responsible: {
    type: UserSchema,
    required: true
   },
   quantity: {
     type: Number,
     default: 1,
   },
   subTotal: {
     type: Float,
   }
}, {
  timestamps: true,
});

/**
 * @typedef Service
 */
module.exports = {
  ServiceSchema: serviceSchema,
};
