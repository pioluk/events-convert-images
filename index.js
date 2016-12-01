'use strict'

const s3 = require('./s3')
const gm = require('gm').subClass({ imageMagick: true })

const getObjectBody = s3.getObjectBody
const putObject = s3.putObject

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2))

  const bucket = event.Records[0].s3.bucket.name
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))
  const params = {
    Bucket: bucket,
    Key: key,
  }

  getObjectBody(params)
    .then(body => {
      gm(body).geometry('200').setFormat('jpeg').toBuffer((err, data) => {
        if (err) {
          console.error(err)
          return callback(err)
        }

        console.log('Processed image:', data != undefined ? 'OK' : 'Not OK')

        const outParams = {
          Bucket: 'pioluk-event-images-mini',
          Key: key,
          Body: data
        }

        return putObject(outParams)
          .then(() => callback(null, 'Done'))
          .catch(err => {
            console.error(err)
            callback(err)
          })
      })
    })
    .catch(err => {
      console.error(err)
      callback(err)
    })
}