'use strict';
const bcrypt = require('bcryptjs');
const { adminPwd, env } = require('../config/vars');
var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  const rounds = env === 'development' ? 1 : 10;
  const hash = await bcrypt.hash(pass, rounds);
  return db.insert('users', { role: 'admin', name: 'Administrador', email: 'cadenas.rafael@gmail.com', password: hash });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
