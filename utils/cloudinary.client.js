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
  processBase64Object
}