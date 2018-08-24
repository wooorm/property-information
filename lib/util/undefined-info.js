'use strict'

var util = require('util')
var mark = require('./mark')
var definedInfo = require('./defined-info')

module.exports = UndefinedInfo

util.inherits(UndefinedInfo, definedInfo)

function UndefinedInfo(property, attribute, mask, space) {
  mark(this, 'attribute', attribute)
  mark(this, 'property', property)
  mark(this, 'undefined', isUndefinedProperty(property, attribute, space))
}

function isUndefinedProperty(property, attribute, space) {
  // Everything except for ARIA has a namespace attached,
  // and ARIA always has different casing, except for role.
  return space === undefined && property === attribute
}
