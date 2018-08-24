'use strict'

var mark = require('./mark')
var DefinedInfo = require('./defined-info')

module.exports = UndefinedInfo

UndefinedInfo.prototype = Object.create(DefinedInfo.prototype)
UndefinedInfo.prototype.constructor = UndefinedInfo

function UndefinedInfo(property, attribute, mask, space) {
  DefinedInfo.call(this, property, attribute, mask, space)
  mark(this, 'undefined', isUndefinedProperty(property, attribute, space))
}

function isUndefinedProperty(property, attribute, space) {
  // Everything except for ARIA has a namespace attached,
  // and ARIA always has different casing, except for role.
  return space === undefined && property === attribute
}
