import fs from 'fs'
import path from 'path'
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

var schemas = {html, svg, aria, xlink, xml, xmlns}

/** @type {Array.<string>} */
var reactAdditional = []
/** @type {Object.<string, string>} */
var hastPropToReact = {}
/** @type {string} */
var type
/** @type {string} */
var attr
/** @type {import('../lib/util/info.js').Info} */
var info

for (type in reactData) {
  info = schemas[type]

  for (attr in reactData[type]) {
    if (!info.normal[normalize(attr)]) {
      reactAdditional.push(attr)
    } else if (reactData[type][attr] !== info.normal[normalize(attr)]) {
      hastPropToReact[info.normal[normalize(attr)]] = reactData[type][attr]
    }
  }
}

/** @type {Object.<string, string>} */
var toReact = {}
var sorted = Object.keys(hastPropToReact).sort(alphaSort())
var index = -1

while (++index < sorted.length) {
  toReact[sorted[index]] = hastPropToReact[sorted[index]]
}

fs.writeFile(
  path.join('lib', 'hast-to-react.js'),
  'export var hastToReact = ' + JSON.stringify(toReact, null, 2) + '\n',
  bail
)
