import {Info} from './info.js'
import * as types from './types.js'

var checks = Object.keys(types)

DefinedInfo.prototype = new Info()
DefinedInfo.prototype.defined = true

export function DefinedInfo(property, attribute, mask, space) {
  var index = -1
  var check

  mark(this, 'space', space)

  Info.call(this, property, attribute)

  while (++index < checks.length) {
    check = checks[index]
    mark(this, check, (mask & types[check]) === types[check])
  }
}

function mark(values, key, value) {
  if (value) {
    values[key] = value
  }
}
