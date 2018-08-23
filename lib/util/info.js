'use strict'

var types = require('./types')

module.exports = Info

var proto = Info.prototype

proto.space = null
proto.attribute = null
proto.property = null
proto.boolean = false
proto.booleanish = false
proto.overloadedBoolean = false
proto.number = false
proto.commaSeparated = false
proto.spaceSeparated = false
proto.commaOrSpaceSeparated = false
proto.mustUseProperty = false
proto.unspecified = false

function Info(property, attribute, mask, space) {
  mark(this, 'space', space)
  mark(this, 'attribute', attribute)
  mark(this, 'property', property)
  mark(this, 'boolean', check(mask, types.boolean))
  mark(this, 'booleanish', check(mask, types.booleanish))
  mark(this, 'overloadedBoolean', check(mask, types.overloadedBoolean))
  mark(this, 'number', check(mask, types.number))
  mark(this, 'commaSeparated', check(mask, types.commaSeparated))
  mark(this, 'spaceSeparated', check(mask, types.spaceSeparated))
  mark(this, 'commaOrSpaceSeparated', check(mask, types.commaOrSpaceSeparated))
  mark(this, 'unspecified', isUnspecifiedProperty(property, attribute, space))
}

function mark(values, key, value) {
  if (value) {
    values[key] = value
  }
}

function check(value, mask) {
  return (value & mask) === mask
}

function isUnspecifiedProperty(property, attribute, space) {
  // Everything except for ARIA has a namespace attached,
  // and ARIA always has different casing, except for role.
  return space === undefined && property === attribute && property !== 'role'
}
