'use strict';
const nodemailer = require('nodemailer');
const { emailFrom,
        emailSubject, 
        emailText, 
        emailHtml, 
        emailHost, 
        emailPort, 
        emailIsSsl, 
        emailUser, 
        emailPass,
        emailRejecAuth } = require('../config/vars');

module.exports.send =  function(to, body, isHtml, options) {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailIsSsl, // true for 465, false for other ports
        auth: {
            user: emailUser, // generated ethereal user
            pass: emailPass  // generated ethereal password
        },
        tls: {
            rejectUnauthorized: emailRejecAuth
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: options.from || emailFrom, // sender address
        to: options.to, // list of receivers
        subject: options.subject || emailSubject, // Subject line
        text: isHtml ? '' : options.text, // plain text body
        html: isHtml ? options.html : ''// html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Error: %s', error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
};