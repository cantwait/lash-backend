'use strict'
const moment = require('moment-timezone');

exports.toUTC = function(date) {
  const utc = moment.tz(date, 'UTC').format();
  console.log('utc: %s', utc);
  return utc;
};

exports.dateTime = function(date, time) {
  const dt = moment(date +' '+ time).format('YYYY-MM-DD HH:mm:ss');
  console.log('datetime: %s', dt);
  return dt;
};