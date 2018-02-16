const httpStatus = require('http-status');
const { omit } = require('lodash');
const User = require('../models/user.model');
const { handler: errorHandler } = require('../middlewares/error');
const cloudinaryUtil = require('../utils/cloudinary.client');

/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const user = await User.get(id);
    req.locals = { user };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get user
 * @public
 */
exports.get = (req, res) => res.json(req.locals.user.transform());

/**
 * Get logged in user info
 * @public
 */
exports.loggedIn = (req, res) => res.json(req.user.transform());

/**
 * Create new user
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(httpStatus.CREATED);
    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Replace existing user
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const { user } = req.locals;
    const newUser = new User(req.body);
    const ommitRole = user.role !== 'admin' ? 'role' : '';
    const newUserObject = omit(newUser.toObject(), '_id', ommitRole);

    await user.update(newUserObject, { override: true, upsert: true });
    const savedUser = await User.findById(user._id);

    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Update existing user
 * @public
 */
exports.update = async (req, res, next) => {
  //const ommitRole = req.locals.user.role !== 'admin' ? 'role' : '';
  //const updatedUser = omit(req.body, ommitRole);
  //const user = Object.assign(req.locals.user, req.body)
  console.log(req.params);
  const query = { "_id": req.params.userId};
  const picture = await cloudinaryUtil.processBase64Object(req.body.picture);
  const update = { name: req.body.name, email: req.body.email, role: req.body.role };
  if(picture) {
    update['picture'] = picture;
  }
	const options = {new: true};
	User.findOneAndUpdate(query,update,options,(err,newUser)=>{
   if(err) return next(err);
   res.json(newUser.transform());
});
  //user.save()
    //.then(savedUser => res.json(savedUser.transform()))
    //.catch(e => next(User.checkDuplicateEmail(e)));
};

/**
 * Get user list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const users = await User.list(req.query);
    const transformedUsers = users.map(user => user.transform());
    res.json(transformedUsers);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @public
 */
exports.remove = (req, res, next) => {
  const { user } = req.locals;

  user.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};

exports.protected = (req,res,next) => {
  console.log('protected!')
  res.status(200);
  res.json({ hello: "hello" });
};
