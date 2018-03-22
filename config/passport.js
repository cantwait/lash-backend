const JwtStrategy = require('passport-jwt').Strategy;
const BearerStrategy = require('passport-http-bearer');
const { ExtractJwt } = require('passport-jwt');
const { publicKey, passphrase } = require('./vars');
const User = require('../models/user.model');
const fs = require('fs');

const jwtOptions = {
  secretOrKey: fs.readFileSync(publicKey),
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  algorithms: ['RS256']
};

const jwt = async (payload, done) => {
  try {
    const user = await User.findById(payload.sub);
    if (user) return done(null, user);
    return done(null, false);
  } catch (error) {
    console.log('error: %s', error)
    return done(error, false);
  }
};

exports.jwt = new JwtStrategy(jwtOptions, jwt);
