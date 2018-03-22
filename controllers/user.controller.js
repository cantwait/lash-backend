const httpStatus = require('http-status');
const { omit } = require('lodash');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { env } = require('../config/vars');
const { handler: errorHandler } = require('../middlewares/error');
const cloudinaryUtil = require('../utils/cloudinary.client');
const { LOGGED_USER } = require('../middlewares/auth');
const Session = require('../models/session.model');
const  mongoose  = require('mongoose');

/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  console.log('loading logged user');
  try {
    const user = await User.get(id);
    console.log('loaded user: %s', user.role);
    if (user.role !== 'admin') {
       user.role = LOGGED_USER;
    }
    req.locals = { user };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * List all sessions by user
 */
exports.sessionsByUser = async (req,res,next) => {

 console.log('listong sessions by user id: %s', req.params.userId);
 try {
   const sessions = await Session.aggregate([{ $match: { 'services.responsible.id': mongoose.Types.ObjectId(req.params.userId)}},{$unwind: '$services'}]);
   //const transformedSessions = sessions.map(session => session.transform());
   res.json(sessions);
 } catch (e) {
   return next(e);
 }

}

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

exports.resetPwd = async (req, res, next) => {
  try {
    const { user } = req.locals;
    console.log('user loaded: %s', user);
    const current = req.body.current;
    const newPwd = req.body.newPwd;

    console.log('current: %s, newPwd: %s',current, newPwd);
    const areDiff = await bcrypt.compare(current, user.password);
	  console.log('arediff: %s',areDiff);
    if (!areDiff) {
      return res.status(401).json({ code: 01, message: 'Contrasena incorrecta!'});
    }
    const rounds = env === 'development' ? 1 : 10;
    const hash = await bcrypt.hash(newPwd, rounds);
    await User.findByIdAndUpdate(user.id,{ password: hash });

    return res.status(204).end();

  } catch (e) {
    return next(e);
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
  const query = { "_id": req.params.userId};
  //const picture = await cloudinaryUtil.processBase64Object(req.body.picture);
  const update = { name: req.body.name, email: req.body.email, role: req.body.role,phone: req.body.phone, address: req.body.address, fee: req.body.fee };
  //if(picture) {
  //  update['picture'] = picture;
  //}
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
