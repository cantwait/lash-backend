'use strict'
const AWS = require('aws-sdk');
const axios = require('axios');
const { awsAccessKey, awsSecretKey, awsS3Bucket, awsRegion, elasticKey, emailFrom, emailName } = require('../config/vars');

AWS.config.update({ accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey, region: awsRegion});

const s3 = new AWS.S3();

module.exports.send = function(to, msg, subject, fromMail) {
  console.log('sending pwd!');
  const body = encodeURI(msg);
  const fromM = emailFrom;
  const fromN = emailName;
  const subj = encodeURI(subject);
  const url = 'https://api.elasticemail.com/v2/email/send?apikey='+elasticKey+'&subject='+subj+'&from='+fromM+'&fromName='+fromN+'&to='+to+'&bodyHtml='+body;
  console.log('sending email: %s', url);
  axios.get(url)
    .then(res => console.log('Response: %s',JSON.stringify(res)))
    .catch(err => console.error('Error elasticmail: %s, stack: %s',err, err.stack));
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
