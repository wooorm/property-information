'use strict'

var normalize = require('../../normalize')
var Schema = require('./schema')
var DefinedInfo = require('./defined-info')

module.exports = create

function create(definition) {
  var property = {}
  var normal = {}
  var prop
  var info

  for (prop in definition.properties) {
    info = new DefinedInfo(
      prop,
      definition.transform(definition.attributes, prop),
      definition.properties[prop],
      definition.space
    )

    if (
      definition.mustUseProperty &&
      definition.mustUseProperty.indexOf(prop) > -1
    ) {
      info.mustUseProperty = true
    }

    property[prop] = info

    normal[normalize(prop)] = prop
    normal[normalize(info.attribute)] = prop
  }

  return new Schema(property, normal, definition.space)
}
