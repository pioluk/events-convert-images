'use strict'

const s3 = require('./s3')
const Image = require('./image')
const config = require('./config.json')

const getObjectBody = s3.getObjectBody
const putObject = s3.putObject
const outputBucket = config.outputBucket
const resolutions = config.resolutions

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2))

  const bucket = event.Records[0].s3.bucket.name
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))
  const params = {
    Bucket: bucket,
    Key: key
  }

  getObjectBody(params)
    .then(buffer => {
      return Promise.all(
        resolutions.map(opts => {
          const img = new Image(buffer).map(opts).toBuffer()
          return img
            .then(buffer => {
              const outParams = {
                Bucket: outputBucket,
                Key: opts.directory + '/' + key,
                Body: buffer
              }

              return putObject(outParams)
            })
            .then(() => callback(null, 'Saved ' + opts.directory + '/' + key +
                                        ' with options ' + JSON.stringify(opts, null, 2)))
        })
      )
    })
    .then(() => callback(null, 'OK'))
    .catch(err => {
      console.error(err)
      callback(err)
    })
}
