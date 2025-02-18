/**
 * @import {Info, Space} from '../../index.js'
 */

/**
 * @typedef Definition
 *   Definition of a schema.
 * @property {Record<string, string> | undefined} [attributes]
 *   Normalzed names to special attribute case.
 * @property {ReadonlyArray<string> | undefined} [mustUseProperty]
 *   Normalized names that must be set as properties.
 * @property {Record<string, number | null>} properties
 *   Property names to their types.
 * @property {Space | undefined} [space]
 *   Space.
 * @property {Transform} transform
 *   Transform a property name.
 */

/**
 * @callback Transform
 *   Transform.
 * @param {Record<string, string>} attributes
 *   Attributes.
 * @param {string} property
 *   Property.
 * @returns {string}
 *   Attribute.
 */

import {normalize} from '../normalize.js'
import {DefinedInfo} from './defined-info.js'
import {Schema} from './schema.js'

/**
 * @param {Definition} definition
 *   Definition.
 * @returns {Schema}
 *   Schema.
 */
export function create(definition) {
  /** @type {Record<string, Info>} */
  const property = {}
  /** @type {Record<string, string>} */
  const normal = {}

  for (const [prop, value] of Object.entries(definition.properties)) {
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

  return new Schema(property, normal, definition.space)
}
