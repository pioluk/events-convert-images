'use strict'

const aws = require('aws-sdk')
const gm = require('gm').subClass({ imageMagick: true })

const s3 = new aws.S3({ apiVersion: '2006-03-01' })

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2))

  const bucket = event.Records[0].s3.bucket.name
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))
  const params = {
    Bucket: bucket,
    Key: key,
  }

  s3.getObject(params, (err, data) => {
    if (err) {
      console.error(err)
      const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
      console.log(message)
      return callback(message)
    }

    gm(data.Body).geometry('200').setFormat('jpeg').toBuffer((err, data) => {
      if (err) {
        console.error(err)
        return callback(err)
      }

      console.log('Processed image', data != undefined, data)

      const outParams = {
        Bucket: 'pioluk-event-images-mini',
        Key: key,
        Body: data
      }

      s3.putObject(outParams, (err, data) => {
        if (err) {
          console.error(err)
          return callback(err)
        }

        callback(null, 'Done')
      })
    })
  })
}
