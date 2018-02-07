const SMTPServer = require('smtp-server').SMTPServer;
const { env, emailIsSsl,emailUser,emailPass,emailPort } = require('../config/vars');

module.exports.start = function() {
    if(env === 'development'){
        console.log('starting smtp server');
        const server = new SMTPServer({
            secure: emailIsSsl,
            maxClients: 1,
            name: 'Dummy SMTP Server',
            onAuth(auth, session, callback){
                if(auth.username !== emailUser || auth.password !== emailPass){
                    return callback(new Error('Invalid username or password'));
                }
                callback(null, {user: 1}); // where 123 is the user id or similar property
            },
            onConnect(session, callback){
                if(session.remoteAddress === '127.0.0.1'){
                    //return callback(new Error('No connections from localhost allowed'));
                }
                return callback(); // Accept the connection
            },
            onClose(session){
                console.log('closing session: %s', JSON.stringify(session));
            },
            onData(stream, session, callback){
                stream.pipe(process.stdout); // print message to console
                stream.on('end', callback);
            }
        });

        server.listen(emailPort, ()=>{
            console.log('Dummy SMTP Server started on port: %s', emailPort);
        });
    } else {
        console.log('Server is only allowed in development mode');
    }
}