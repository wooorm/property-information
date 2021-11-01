import fs from 'node:fs'
import path from 'node:path'
import {bail} from 'bail'
import alphaSort from 'alpha-sort'
import {normalize} from '../lib/normalize.js'
import {xlink} from '../lib/xlink.js'
import {xml} from '../lib/xml.js'
import {xmlns} from '../lib/xmlns.js'
import {aria} from '../lib/aria.js'
import {html} from '../lib/html.js'
import {svg} from '../lib/svg.js'
import {reactData} from './react-data.js'

const own = {}.hasOwnProperty

const schemas = {html, svg, aria, xlink, xml, xmlns}

/** @type {Array.<string>} */
const reactAdditional = []
/** @type {Object.<string, string>} */
const hastPropToReact = {}
/** @type {string} */
let type
/** @type {string} */
let attr
/** @type {import('../lib/util/info.js').Info} */
let info

for (type in reactData) {
  if (own.call(reactData, type)) {
    info = schemas[type]

    for (attr in reactData[type]) {
      if (!info.normal[normalize(attr)]) {
        reactAdditional.push(attr)
      } else if (reactData[type][attr] !== info.normal[normalize(attr)]) {
        hastPropToReact[info.normal[normalize(attr)]] = reactData[type][attr]
      }
    }
  }
}

/** @type {Object.<string, string>} */
const toReact = {}
const sorted = Object.keys(hastPropToReact).sort(alphaSort())
let index = -1

while (++index < sorted.length) {
  toReact[sorted[index]] = hastPropToReact[sorted[index]]
}

fs.writeFile(
  path.join('lib', 'hast-to-react.js'),
  'export const hastToReact = ' + JSON.stringify(toReact, null, 2) + '\n',
  bail
)
