'use strict'
const cloudinary = require('cloudinary');
const base64Regex = require('base64-regex');
const { cloudinaryName,
        cloudinaryKey,
        cloudinarySecret } = require('../config/vars');

cloudinary.config({
  cloud_name: cloudinaryName,
  api_key: cloudinaryKey,
  api_secret: cloudinarySecret
});

async function processBase64Array(array) {
  let arr = [];
  if(this.pictures && this.pictures.length > 0) {
    array.forEach(async element => {
      if(isBase64(element)){
        const result = await uploadImage(element);
        if(result && result.secure_url) {
          arr.push(secure_url);
        }
      }else{
        arr.push(element);
      }
    });
  }

  return arr;
};

async function processBase64Object(picture){
  if(picture && isBase64(picture)){
    const url = await uploadImage(picture);
    if (url) {
      return url;
    }
  }else{
    return picture;
  }
};

/**
 * Removes a resource from Cloudinary
 *
 * @param {*} url
 */
function destroyPicture(url) {
  console.log('about to remove image from cloudinary')
  if(url && url.length > 0){
    /* example parts = 'https://res.cloudinary.com/diri18hbk/image/upload/v1518759104/bp36wjfbwahabje3tnol.jpg'.split('/')
     lastSegment = parts.pop() || parts.pop(); //get me the last path in this example: bp36wjfbwahabje3tnol.jpg
     then we just need to remove eveything after .*
    */
    const parts = url.split('/');
    const lastSegment = parts.pop() || parts.pop();
    if(lastSegment && lastSegment.length > 0) {
      const id = lastSegment.substr(0, lastSegment.lastIndexOf('.')) || input;
      cloudinary.v2.uploader.destroy(id,(err, result) => {
        if(err) console.log('Error deleting resource from cloudinary: %s',JSON.stringify(err));
        else console.log('Success deleting resource from cloudinary: %s',JSON.stringify(result));
      });
    }
  }
};

/**
 * Validate whether or not the string passed as argument is a valid base 64 encoded string.
 *
 * @param {*} val
 */
function isBase64(val) {
  console.log('isBase64!...');
  return base64Regex().test(val);
}

/**
 * Upload an image to cloudify
 *
 * @param {any} base64
 *
 * @returns {string} image_url
 */
function uploadImage(base64) {
  console.log('uploading image!...');
  return new Promise((res,rej) => {
    cloudinary.v2.uploader.upload(base64, (error, result) => {
      if (result) {
        console.log('image upload success');
        res(result.secure_url);
      } else {
        rej(new Error('could not upload image to cloudinary: %s', error));
      }
    });
  });
}

module.exports = {
  processBase64Array,
  processBase64Object,
  destroyPicture
}