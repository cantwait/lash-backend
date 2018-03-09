'use strict'
const { pusherKey, pusherSecret, pusherAppId, pusherCluster } = require('../config/vars');
const Pusher = require('pusher');

const pusher = new Pusher({
  appId: pusherAppId,
  key: pusherKey,
  secret: pusherSecret,
  cluster: pusherCluster,
  encrypted: true
});

module.exports.push = function(channel, eventName, object){
    pusher.trigger(channel, eventName, object);
}
