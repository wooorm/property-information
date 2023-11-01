/**
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').RowContent} RowContent
 * @typedef {import('mdast').TableRow} TableRow
 */

import {u} from 'unist-builder'
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
  return (tree) => {
    zone(tree, 'list', (start, _, end) => {
      const properties = all.property
      const props = Object.keys(properties).sort()
      /** @type {TableRow[]} */
      const rows = [
        u('tableRow', [
          u('tableCell', [u('text', 'Property')]),
          u('tableCell', [u('text', 'Attribute')]),
          u('tableCell', [u('text', 'Space')])
        ])
      ]

      let index = -1

      while (++index < props.length) {
        const property = props[index]
        const info = properties[property]
        /** @type {PhrasingContent[]} */
        const spaces = []
        /** @type {RowContent[]} */
        const fields = [
          u('tableCell', [u('inlineCode', property)]),
          u('tableCell', [u('inlineCode', info.attribute)])
        ]
        let schemaIndex = -1

        while (++schemaIndex < schemas.length) {
          const propInfo = schemas[schemaIndex].property[property]

          if (propInfo && propInfo.space) {
            if (spaces.length > 0) {
              spaces.push(u('text', ', '))
            }

            spaces.push(u('inlineCode', propInfo.space))
          }
        }

        if (spaces.length > 0) {
          fields.push(u('tableCell', spaces))
        }

        rows.push(u('tableRow', fields))
      }

      return [start, u('table', {align: []}, rows), end]
    })
  }
}
