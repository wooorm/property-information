/**
 * @import {Info, Space} from '../../index.js'
 */

import {Schema} from './schema.js'

/**
 * @param {Schema[]} definitions
 * @param {Space} [space]
 * @returns {Schema}
 */
export function merge(definitions, space) {
  /** @type {Record<string, Info>} */
  const property = {}
  /** @type {Record<string, string>} */
  const normal = {}
  let index = -1

  while (++index < definitions.length) {
    Object.assign(property, definitions[index].property)
    Object.assign(normal, definitions[index].normal)
  }

  return new Schema(property, normal, space)
}
