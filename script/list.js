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
  return transform
}

/**
 * @param {import('mdast').Root} tree
 */
function transform(tree) {
  zone(tree, 'list', visit)
}

/**
 * @param {import('unist').Node?} start
 * @param {unknown} _
 * @param {import('unist').Node?} end
 */
function visit(start, _, end) {
  const properties = all.property
  const props = Object.keys(properties).sort()
  const rows = [
    u('tableRow', [
      u('tableCell', [u('text', 'Property')]),
      u('tableCell', [u('text', 'Attribute')]),
      u('tableCell', [u('text', 'Space')])
    ])
  ]

  return [
    start,
    u(
      'table',
      {align: []},
      rows.concat(
        props.map(
          /**
           * @param {string} property
           * @returns {import('mdast').TableCell}
           */
          function (property) {
            const info = properties[property]
            /** @type {import('mdast').PhrasingContent[]} */
            const spaces = []
            /** @type {import('mdast').RowContent[]} */
            const fields = [
              u('tableCell', [u('inlineCode', property)]),
              u('tableCell', [u('inlineCode', info.attribute)])
            ]
            let index = -1
            /** @type {import('../lib/util/info').Info} */
            let propInfo

            while (++index < schemas.length) {
              propInfo = schemas[index].property[property]

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

            return u('tableRow', fields)
          }
        )
      )
    ),
    end
  ]
}
