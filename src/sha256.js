const crypto = require('crypto')

function toBuffer256(number) {
  return Buffer.from(number.toString(16).padStart(512, '0'), 'hex')
}

function sha256(left, right) {
  return crypto
    .createHash('sha256')
    .update(toBuffer256(left))
    .update(toBuffer256(right))
    .digest('hex')
}

module.exports = sha256