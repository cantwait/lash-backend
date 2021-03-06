const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid-v4');
const randomstring = require("randomstring");
const APIError = require('../utils/api.error');
const { env,
        jwtSecret,
        jwtExpirationInterval,
        privateKey,
        passphrase } = require('../config/vars');
const fs = require('fs');
const mongoosePaginate = require('mongoose-paginate');
const mailClient = require('../utils/mail');
const cloudinaryUtil = require('../utils/cloudinary.client');

/**
* User Roles
*/
const roles = ['user', 'admin','cashier'];

/**
 * User Schema
 * @private
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    //required: false,
    //minlength: 6,
    maxlength: 128,
  },
  name: {
    type: String,
    maxlength: 128,
    trim: true,
  },
  role: {
    type: String,
    enum: roles,
    default: 'user',
  },
  picture: {
    type: String,
    trim: true,
  },
  fee: {
    type: Number,
  },
  active: {
    type: Boolean,
    default: true,
  },
  address: {
    type: String,
    maxlength: 128,
  },
  phone: {
    type: String,
    maxlength: 12,
  },
}, {
  timestamps: true,
});

userSchema.index({ email: 'text', name: 'text' });

userSchema.plugin(mongoosePaginate);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
userSchema.pre('save', async function save(next) {
  try {
    //if (!this.isModified('password')) return next();
    console.log('users pre save hook!...');
    const rounds = env === 'development' ? 1 : 10;
    const pass =  randomstring.generate(10);
    const hash = await bcrypt.hash(pass, rounds);
    this.password = hash;
    this.picture =  await cloudinaryUtil.processBase64Object(this.picture);
    mailClient.sendPassword(this.email, pass);
    return next();
  } catch (error) {
    console.log('error user pre save hook: %s', error);
    return next(error);
  }
});

userSchema.post('update', async (next) => {
  try {
    this._update.$set.updateAt = moment.now();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
userSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'email', 'picture', 'role', 'fee', 'active', 'createdAt', 'updatedAt','phone', 'address'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  token() {
    const playload = {
      exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
      iat: moment().unix(),
      sub: this._id,
    };
    return jwt.sign(playload, { key: fs.readFileSync(privateKey)  },{ algorithm: 'RS256' });
  },

  async passwordMatches(password) {
    return await bcrypt.compare(password, this.password);
  },

  async updatePassword(id, newPwd) {
    console.log('updating password');
    try {
      const rounds = env === 'development' ? 1 : 10;
      const hash = await bcrypt.hash(newPwd, rounds);
      await User.findByIdAndUpdate(id,{ password: hash });
    } catch (e) {
      console.log('error updating pwd: %s',e);
      return false;
    }
    return true;
  },

});

/**
 * Statics
 */
userSchema.statics = {

  roles,


  listLikeName({name}) {
    if (!name) {
      name = '';
    }
    return this
      .find({$text: { $search: name }})
      .sort({ name: 1 })
      .exec();
  },

  /**
   * Get user
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    console.log('id: %s', id);
    try {
      let user;

      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await this.findById(id).exec();
      }
      if (user) {
        return user;
      }

      throw new APIError({
        message: 'User does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findAndGenerateToken(options) {
    const { email, password, refreshObject } = options;
    if (!email) throw new APIError({ message: 'An email is required to generate a token' });

    const user = await this.findOne({ email }).exec();
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };
    if (password) {
      if (user && await user.passwordMatches(password)) {
        return { user, accessToken: user.token() };
      }
      err.message = 'Incorrect email or password';
    } else if (refreshObject && refreshObject.userEmail === email) {
      return { user, accessToken: user.token() };
    } else {
      err.message = 'Incorrect email or refreshToken';
    }
    throw new APIError(err);
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({
    page = 1, perPage = 30, name, email, role,
  }) {
    const options = omitBy({ name, email, role }, isNil);

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
          field: 'email',
          location: 'body',
          messages: ['"email" already exists'],
        }],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  },

  async oAuthLogin({
    service, id, email, name, picture,
  }) {
    const user = await this.findOne({ $or: [{ [`services.${service}`]: id }, { email }] });
    if (user) {
      user.services[service] = id;
      if (!user.name) user.name = name;
      if (!user.picture) user.picture = picture;
      return user.save();
    }
    const password = uuidv4();
    return this.create({
      services: { [service]: id }, email, password, name, picture,
    });
  },
};

/**
 * @typedef User
 */
module.exports = mongoose.model('User', userSchema);
