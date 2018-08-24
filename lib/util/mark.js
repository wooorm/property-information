'use strict'

module.exports = mark

function mark(values, key, value) {
  if (value) {
    values[key] = value
  }
}
