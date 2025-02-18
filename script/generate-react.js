import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
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

assert(html)
assert(html.index)
assert(svg)
assert(svg.index)

data.html = process(text.slice(html.index + html[0].length, svg.index))
data.svg = process(
  text.slice(svg.index + svg[0].length, text.indexOf('}', svg.index))
)

// Was added to the wrong section.
data.html.popovertargetaction = data.svg.popovertargetaction
data.html.popovertarget = data.svg.popovertarget
data.html.popover = data.svg.popover
data.html.prefix = data.svg.prefix
data.html.results = data.svg.results
data.html.security = data.svg.security
data.html.unselectable = data.svg.unselectable
delete data.svg.popovertargetaction
delete data.svg.popovertarget
delete data.svg.popover
delete data.svg.prefix
delete data.svg.results
delete data.svg.security
delete data.svg.unselectable

await fs.writeFile(
  new URL('react-data.js', import.meta.url),
  [
    '/**',
    ' * @type {Record<string, Record<string, string>>}',
    ' */',
    'export const reactData = ' + JSON.stringify(data, undefined, 2),
    ''
  ].join('\n')
)

/** @param {string} document */
function process(document) {
  const re = /\s+(?:'([^']+)'|(\w+)): '([^']+)',/g
  /** @type {Record<string, string>} */
  const map = {}
  /** @type {Record<string, string>} */
  const clean = {}
  /** @type {RegExpMatchArray | null} */
  let match

  while ((match = re.exec(document))) {
    map[match[1] || match[2]] = match[3]
  }

  for (const key of Object.keys(map).sort(alphaSort())) {
    if (key === 'role') {
      data.aria = {}
      data.aria[key] = map[key]
    } else {
      /** @type {string | undefined} */
      let space

      for (const value of ns) {
        if (key.startsWith(value)) {
          space = value
          break
        }
      }

      if (space) {
        // Ignore the ones w/o colon:
        if (key.includes(':') || key === space) {
          const dat = data[space] || (data[space] = {})
          dat[key] = map[key]
        }
      } else {
        clean[key] = map[key]
      }
    }
  }

  return clean
}
