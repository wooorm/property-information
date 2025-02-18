/**
 * @import {Schema} from 'property-information'
 */

import fs from 'node:fs/promises'
import alphaSort from 'alpha-sort'
import {aria} from '../lib/aria.js'
import {html} from '../lib/html.js'
import {svg} from '../lib/svg.js'
import {xlink} from '../lib/xlink.js'
import {xmlns} from '../lib/xmlns.js'
import {xml} from '../lib/xml.js'
import {reactData} from './react-data.js'

/** @type {Record<string, Schema>} */
const schemas = {aria, html, svg, xlink, xmlns, xml}

/** @type {Array<string>} */
const reactAdditional = []
/** @type {Record<string, string>} */
const hastPropertyToReact = {}

for (const [type, map] of Object.entries(reactData)) {
  const info = schemas[type]

  for (const normal of Object.keys(map)) {
    if (!info.normal[normal]) {
      reactAdditional.push(normal)
    } else if (map[normal] !== info.normal[normal]) {
      hastPropertyToReact[info.normal[normal]] = map[normal]
    }
  }
}

/** @type {Record<string, string>} */
const toReact = {}
const sorted = Object.keys(hastPropertyToReact).sort(alphaSort())

for (const key of sorted) {
  toReact[key] = hastPropertyToReact[key]
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
    'export const hastToReact = ' + JSON.stringify(toReact, undefined, 2),
    ''
  ].join('\n')
)
