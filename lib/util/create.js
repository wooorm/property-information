import {normalize} from '../../normalize.js'
import {Schema} from './schema.js'
import {DefinedInfo} from './defined-info.js'

export function create(definition) {
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
