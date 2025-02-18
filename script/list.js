/**
 * @import {PhrasingContent, Root, RowContent, TableRow} from 'mdast'
 */

import {zone} from 'mdast-zone'
import {xlink} from '../lib/xlink.js'
import {xml} from '../lib/xml.js'
import {xmlns} from '../lib/xmlns.js'
import {aria} from '../lib/aria.js'
import {svg} from '../lib/svg.js'
import {html} from '../lib/html.js'
import {merge} from '../lib/util/merge.js'

const schemas = [xml, xlink, xmlns, svg, html, aria]
const all = merge(schemas)

export default function remarkList() {
  /**
   * @param {Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree) {
    zone(tree, 'list', function (start, _, end) {
      const properties = all.property
      const props = Object.keys(properties).sort()
      /** @type {Array<TableRow>} */
      const rows = [
        {
          type: 'tableRow',
          children: [
            {type: 'tableCell', children: [{type: 'text', value: 'Property'}]},
            {type: 'tableCell', children: [{type: 'text', value: 'Attribute'}]},
            {type: 'tableCell', children: [{type: 'text', value: 'Space'}]}
          ]
        }
      ]

      let index = -1

      while (++index < props.length) {
        const property = props[index]
        const info = properties[property]
        /** @type {Array<PhrasingContent>} */
        const spaces = []
        /** @type {Array<RowContent>} */
        const fields = [
          {
            type: 'tableCell',
            children: [{type: 'inlineCode', value: property}]
          },
          {
            type: 'tableCell',
            children: [{type: 'inlineCode', value: info.attribute}]
          }
        ]
        let schemaIndex = -1

        while (++schemaIndex < schemas.length) {
          const propInfo = schemas[schemaIndex].property[property]

          if (propInfo && propInfo.space) {
            if (spaces.length > 0) {
              spaces.push({type: 'text', value: ', '})
            }

            spaces.push({type: 'inlineCode', value: propInfo.space})
          }
        }

        if (spaces.length > 0) {
          fields.push({type: 'tableCell', children: spaces})
        }

        rows.push({type: 'tableRow', children: fields})
      }

      return [start, {type: 'table', align: [], children: rows}, end]
    })
  }
}
