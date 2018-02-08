'use strict';
const nodemailer = require('nodemailer');
const yn = require('yn');
const _ = require('lodash');
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

module.exports.sendPassword = function(email, pass) {
    const body = `
        <p>Bienvenido a lalalash su password es: <strong>${pass}</strong></p>
    `;
    const subject = 'Contraseña de Usuario';
    this.send(email,subject,body,true);
}

module.exports.send =  function(to, subject, body, isHtml, options) {
    // create reusable transporter object using the default SMTP transport
    const transPortOpts = {
        host: emailHost,
        port: emailPort,
        tls: {
            rejectUnauthorized: yn(emailRejecAuth)
        }
    };

    if(yn(emailIsSsl)){
        transPortOpts["secure"] = yn(emailIsSsl);
    }

    if(emailUser && emailPass){
        const user = {
            auth: {
                user: emailUser,
                pass: emailPass
            }
        };
        _.assign(transPortOpts, user);
    }    

    const transporter = nodemailer.createTransport(transPortOpts);

    // setup email data with unicode symbols
    let mailOptions = {
        from: emailFrom || options.from, // sender address
        to: to, // list of receivers
        subject: subject || emailSubject, // Subject line
        text: yn(isHtml) ? '' : body, // plain text body
        html: yn(isHtml) ? body : ''// html body
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