const AWS = require('aws-sdk');
const HttpError = require('../middleware/HttpError');
const config = require('../config/config');

AWS.config.update({ region: 'eu-central-1' });

const s3 = new AWS.S3({
  accessKeyId: config.AmazonAccessKeyId,
  secretAccessKey: config.AmazonSecretAccessKey,
});

exports.upload = async (req, res, next) => {
  try {
    const key = `${req.user.id}/${Math.random()}.jpeg`;
    s3.getSignedUrl(
      'putObject',
      {
        Bucket: 'dictionary-1',
        ContentType: 'image/jpeg',
        Key: key,
      },
      (err, url) => res.send({ key, url }),
    );
  } catch (error) {
    return next(new HttpError('Image upload error!', 500));
  }
};
