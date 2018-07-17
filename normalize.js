'use strict'

module.exports = normalize

var re = /[^a-z0-9]/gi

function normalize(value) {
  return value.replace(re, '').toLowerCase()
}
