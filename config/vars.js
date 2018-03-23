const path = require('path');

// import .env variables
require('dotenv-safe').load({
  path: path.join(__dirname, '../.env'),
  sample: path.join(__dirname, '../.env.example'),
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,
  mongo: {
    uri: process.env.NODE_ENV === 'test'
      ? process.env.MONGO_URI_TESTS
      : process.env.MONGO_URI,
  },
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  privateKey: process.env.PRIVATE_KEY,
  publicKey: process.env.PUBLIC_KEY,
  passphrase: process.env.KEY_PASSPHRASE,
  emailFrom: process.env.EMAIL_FROM,
  emailSubject: process.env.EMAIL_SUBJECT,
  emailHtml: process.env.EMAIL_HTML,
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  emailIsSsl: process.env.EMAIL_SSL,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  emailRejecAuth: process.env.EMAIL_REJECT_AUTH,
  pass: process.env.PASS,
  cloudinaryName: process.env.CLOUDINARY_NAME,
  cloudinaryKey: process.env.CLOUDINARY_KEY,
  cloudinarySecret: process.env.CLOUDINARY_SECRET,
  adminPwd: process.env.ADMIN_PWD,
  uiUrl: process.env.NODE_ENV === 'production' ? process.env.UI_PROD_URL : process.env.UI_LOCAL_URL,
  mgApiKey: process.env.MAIL_GUN_API_KEY,
  isMg: process.env.IS_MG,
  isSes: process.env.IS_SES,
  mgDomain: process.env.MG_DOMAIN,
  awsRegion: process.env.AWS_REGION,
  awsAccessKey: process.env.AWS_ACCESS_KEY,
  awsSecretKey: process.env.AWS_SECRET_KEY,
  awsS3Bucket: process.env.AWS_S3_BUCKET_NAME,
  pusherAppId: process.env.PUSHER_APP_ID,
  pusherKey: process.env.PUSHER_KEY,
  pusherSecret: process.env.PUSHER_SECRET,
  pusherCluster: process.env.PUSHER_CLUSTER,
  elasticUser: process.env.ELASTIC_USERNAME,
  elasticKey: process.env.ELASTIC_KEY,
};
