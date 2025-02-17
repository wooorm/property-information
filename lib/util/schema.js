/**
 * @import {Schema as SchemaType, Space} from '../../index.js'
 */

/** @type {SchemaType} */
export class Schema {
  /**
   * @constructor
   * @param {SchemaType['property']} property
   * @param {SchemaType['normal']} normal
   * @param {Space | null | undefined} [space]
   */
  constructor(property, normal, space) {
    this.normal = normal
    this.property = property

    if (space) {
      this.space = space
    }
  }
}

Schema.prototype.normal = {}
Schema.prototype.property = {}
Schema.prototype.space = null
