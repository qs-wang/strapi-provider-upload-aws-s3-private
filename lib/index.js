'use strict';

/**
 * Copied from strapi official strapi-provider-upload-aws-s3
 * Modified to hide the public url
 * Author: Q.s. Wang
 * 
 */
/**
 * Module dependencies
 */

/* eslint-disable no-unused-vars */
// Public node modules.
const _ = require('lodash');
const AWS = require('aws-sdk');
const isImage = require('is-image');

module.exports = {
  init(config) {
    const S3 = new AWS.S3({
      apiVersion: '2006-03-01',
      ...config,
    });

    return {
      upload(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // upload file on S3 bucket
          const path = file.path ? `${file.path}/` : '';
          const targetPath = `${path}${file.hash}${file.ext}`

          S3.upload(
            {
              Key: targetPath,
              Body: Buffer.from(file.buffer, 'binary'),
              ACL: isImage(targetPath) ? 'public-read' : null,
              ContentType: file.mime,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              // set the file path with customized protocol 
              // this way the bucket name is hidden from end user
              // a separate api should be provided for parsing
              // and generating the s3 pre-signed url
              if (isImage(targetPath)) {
                file.url = data.Location;
              } else {
                file.url = `s3://${customParams.Bucket}/${path}${file.hash}${file.ext}`;
              }

              resolve();
            }
          );
        });
      },
      delete(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // delete file on S3 bucket
          const path = file.path ? `${file.path}/` : '';
          S3.deleteObject(
            {
              Key: `${path}${file.hash}${file.ext}`,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              resolve();
            }
          );
        });
      },
    };
  },
};
