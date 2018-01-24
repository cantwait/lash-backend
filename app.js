const { port, env } = require('./config/vars');
const app = require('./config/express');
const mongoose = require('./config/mongoose');
Promise = require('bluebird');

// open mongoose connection
mongoose.connect();

// listen to requests
app.listen(port, () => console.info(`server started on port ${port} ${env}`));

/**
* Exports express
* @public
*/
module.exports = app;

//var users = require('./routes/users');

//app.use('/api/v1/users', users);
