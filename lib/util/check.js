'use strict'

module.exports = check

function check(value, mask) {
  return (value & mask) === mask
}
