const { port, env } = require('./config/vars');
const app = require('./config/express');
const mongoose = require('./config/mongoose');
const mailServer = require('./config/mailer.server');
const mail = require('./utils/mail');

Promise = require('bluebird');

// open mongoose connection
mongoose.connect();
mailServer.start();

// mail.send('rafael.cadenas@grobanking.com','hello',false,{});

// listen to requests
app.listen(port, () => console.info(`server started on port ${port} ${env}`));

/**
* Exports express
* @public
*/
module.exports = app;

//var users = require('./routes/users');

//app.use('/api/v1/users', users);
