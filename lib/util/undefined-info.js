'use strict'

var util = require('util')
var isUndefinedProperty = require('./is-undefined-property')
var mark = require('./mark')
var definedInfo = require('./defined-info')

module.exports = UndefinedInfo

util.inherits(UndefinedInfo, definedInfo)

function UndefinedInfo(property, attribute, mask, space) {
  mark(this, 'attribute', attribute)
  mark(this, 'property', property)
  mark(this, 'undefined', isUndefinedProperty(property, attribute, space))
}
