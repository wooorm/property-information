'use strict'

var xtend = require('xtend')
var Schema = require('./schema')

module.exports = merge

function merge(definitions) {
  var property = []
  var normal = []
  var index = -1

  while (++index < definitions.length) {
    property.push(definitions[index].property)
    normal.push(definitions[index].normal)
  }

  return new Schema(
    xtend.apply(null, property),
    xtend.apply(null, normal),
    definitions[0].space
  )
}
