import u from 'unist-builder'
// @ts-ignore remove when typed
import zone from 'mdast-zone'
import {xlink} from '../lib/xlink.js'
import {xml} from '../lib/xml.js'
import {xmlns} from '../lib/xmlns.js'
import {aria} from '../lib/aria.js'
import {svg} from '../lib/svg.js'
import {html} from '../lib/html.js'
import {merge} from '../lib/util/merge.js'

var schemas = [xml, xlink, xmlns, svg, html, aria]
var all = merge(schemas)

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
  var properties = all.property
  var props = Object.keys(properties).sort()
  var rows = [
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
            var info = properties[property]
            /** @type {import('mdast').PhrasingContent[]} */
            var spaces = []
            /** @type {import('mdast').RowContent[]} */
            var fields = [
              u('tableCell', [u('inlineCode', property)]),
              u('tableCell', [u('inlineCode', info.attribute)])
            ]
            var index = -1
            /** @type {import('../lib/util/info').Info} */
            var propInfo

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
