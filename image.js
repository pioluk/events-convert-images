'use strict'

const gm = require('gm').subClass({ imageMagick: true })

class Image {

  constructor(buffer) {
    this.gm = gm(buffer)
  }

  map(config) {
    this.gm = this.gm.strip().interlace('Plane')

    if (config.size) {
      this.gm = this.gm.resize(...config.size)
    }

    if (config.quality) {
      this.gm = this.gm.quality(config.quality)
    }

  }

  toBuffer() {
    return new Promise((resolve, reject) => {
      this.gm.toBuffer((error, buffer) => {
        if (error) {
          reject(error)
        } else {
          resolve(buffer)
        }
      })
    })
  }

}

module.exports = Image
