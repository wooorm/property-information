import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {fetch} from 'undici'
import alphaSort from 'alpha-sort'

const response = await fetch(
  'https://raw.githubusercontent.com/facebook/react/main/packages/react-dom-bindings/src/shared/possibleStandardNames.js'
)
const text = await response.text()

const ns = ['xlink', 'xmlns', 'xml']
const html = text.match(/\/\/ HTML\s*?\n/)
const svg = text.match(/\/\/ SVG\s*?\n/)
/** @type {Record<string, Record<string, string>>}  */
const data = {}

assert(html && html.index, 'expected `html` to match')
assert(svg && svg.index, 'expected `svg` to match')

data.html = process(text.slice(html.index + html[0].length, svg.index))
data.svg = process(
  text.slice(svg.index + svg[0].length, text.indexOf('}', svg.index))
)

await fs.writeFile(
  new URL('react-data.js', import.meta.url),
  [
    '/**',
    ' * @type {Record<string, Record<string, string>>}',
    ' */',
    'export const reactData = ' + JSON.stringify(data, null, 2),
    ''
  ].join('\n')
)

/** @param {string} doc */
function process(doc) {
  const re = /\s+(?:'([^']+)'|(\w+)): '([^']+)',/g
  /** @type {Record<string, string>} */
  const map = {}
  /** @type {Record<string, string>} */
  const clean = {}
  /** @type {RegExpMatchArray|null} */
  let match
  let index = -1

  while ((match = re.exec(doc))) {
    map[match[1] || match[2]] = match[3]
  }

  /** @type {Array<string>} */
  const sorted = Object.keys(map)
    .sort(alphaSort())
    .filter((d) => {
      if (d === 'role') {
        data.aria = {}
        data.aria[d] = map[d]
        return false
      }

      return ns.every(function (space) {
        if (d.startsWith(space)) {
          // Ignore the ones w/o colon:
          if (!d.includes(':') && d !== space) {
            return false
          }

          const dat = data[space] || (data[space] = {})
          dat[d] = map[d]
          return false
        }

        return true
      })
    })

  while (++index < sorted.length) {
    clean[sorted[index]] = map[sorted[index]]
  }

  return clean
}
