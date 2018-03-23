'use strict'
const AWS = require('aws-sdk');
const { awsAccessKey, awsSecretKey, awsS3Bucket } = require('../config/vars');

AWS.config.update({ accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey});

const s3 = new AWS.S3();
const ses = new AWS.SES();

module.exports.sendMail = function(to, msg, subject, fromMail) {
  var params = {
    Destination: { /* required */
      CcAddresses: [ ],
      ToAddresses: [
        to,
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
         Charset: "UTF-8",
         Data: msg,
        },
        // Text: {
        //  Charset: "UTF-8",
        //  Data: "TEXT_FORMAT_BODY"
        // }
       },
       Subject: {
        Charset: 'UTF-8',
        Data: subject
       }
      },
    Source: fromMail, /* required */
    ReplyToAddresses: [ ],
  };
  ses.sendEmail(params)
    .then(data => console.log(data.messageId))
    .catch(err => console.error(err, err.stack));
};

module.exports.uploadFileS3 = function(b64, id) {
  const base64Data = new Buffer(b64.replace(/^data:image\/\w+;base64,/, ""), 'base64')
  const params = {
    Bucket: awsS3Bucket,
    Key: id,
    Body: base64Data,
    ACL: 'public-read',
    ContentEncoding:'base64',
    ContentType: 'image/png',
  };

	console.log('Bucketname: %s', params.Bucket);

  return new Promise((res,rej) => {
	  s3.upload(params, (err,data) => {
		  if(err){
			  console.log('Error uploading document: %s', JSON.stringify(err));
			  return rej(err);
		  }
		  res(data.Location);

	  });
  });
};

module.exports.destroyS3Object = function(key) {
  const params = {
	  Bucket: awsS3Bucket,
	  Key: key
  };

  s3.deleteObject(params, (err, data) => {
	  if (err) {
		  console.log('Error deleting document: %s', err);
	  } else {
		  console.log('Document deleted: %s', data)
	  }
  });
};
