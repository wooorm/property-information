/**
 * @import {Schema} from '../index.js'
 */

import fs from 'node:fs/promises'
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

/** @type {Array<string>} */
const reactAdditional = []
/** @type {Record<string, string>} */
const hastPropToReact = {}
/** @type {string} */
let type

for (type in reactData) {
  if (own.call(reactData, type)) {
    const map = reactData[type]
    /** @type {Schema} */
    // @ts-expect-error: assume `type` matches.
    const info = schemas[type]
    /** @type {string} */
    let attr

    for (attr in map) {
      if (!info.normal[normalize(attr)]) {
        reactAdditional.push(attr)
      } else if (map[attr] !== info.normal[normalize(attr)]) {
        hastPropToReact[info.normal[normalize(attr)]] = map[attr]
      }
    }
  }
}

/** @type {Record<string, string>} */
const toReact = {}
const sorted = Object.keys(hastPropToReact).sort(alphaSort())
let index = -1

while (++index < sorted.length) {
  toReact[sorted[index]] = hastPropToReact[sorted[index]]
}

await fs.writeFile(
  new URL('../lib/hast-to-react.js', import.meta.url),
  [
    '/**',
    ' * Special cases for React (`Record<string, string>`).',
    ' *',
    ' * `hast` is close to `React` but differs in a couple of cases.',
    ' * To get a React property from a hast property,',
    ' * check if it is in `hastToReact`.',
    ' * If it is, use the corresponding value;',
    ' * otherwise, use the hast property.',
    ' *',
    ' * @type {Record<string, string>}',
    ' */',
    'export const hastToReact = ' + JSON.stringify(toReact, null, 2),
    ''
  ].join('\n')
)
