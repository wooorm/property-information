/**
 * @import {Info, Space} from '../../index.js'
 */

/**
 * @typedef Definition
 * @property {Record<string, string>} [attributes]
 * @property {Array<string>} [mustUseProperty]
 * @property {Record<string, number | null>} properties
 * @property {Space} [space]
 * @property {(attributes: Record<string, string>, property: string) => string} transform
 */

import {normalize} from '../normalize.js'
import {Schema} from './schema.js'
import {DefinedInfo} from './defined-info.js'

const own = {}.hasOwnProperty

/**
 * @param {Definition} definition
 * @returns {Schema}
 */
export function create(definition) {
  /** @type {Record<string, Info>} */
  const property = {}
  /** @type {Record<string, string>} */
  const normal = {}
  /** @type {string} */
  let prop

  for (prop in definition.properties) {
    if (own.call(definition.properties, prop)) {
      const value = definition.properties[prop]
      const info = new DefinedInfo(
        prop,
        definition.transform(definition.attributes || {}, prop),
        value,
        definition.space
      )

      if (
        definition.mustUseProperty &&
        definition.mustUseProperty.includes(prop)
      ) {
        info.mustUseProperty = true
      }

      property[prop] = info

      normal[normalize(prop)] = prop
      normal[normalize(info.attribute)] = prop
    }
  }

  return new Schema(property, normal, definition.space)
}
