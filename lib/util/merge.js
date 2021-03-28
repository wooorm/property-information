import xtend from 'xtend'
import {Schema} from './schema.js'

export function merge(definitions) {
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
