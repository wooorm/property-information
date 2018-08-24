'use strict'

module.exports = isUndefinedProperty

function isUndefinedProperty(property, attribute, space) {
  // Everything except for ARIA has a namespace attached,
  // and ARIA always has different casing, except for role.
  return space === undefined && property === attribute && property !== 'role'
}
