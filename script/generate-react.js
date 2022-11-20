import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import {bail} from 'bail'
import concat from 'concat-stream'
import alphaSort from 'alpha-sort'

https.get(
  'https://raw.githubusercontent.com/facebook/react/main/packages/react-dom-bindings/src/shared/possibleStandardNames.js',
  (response) => {
    response
      .pipe(
        concat((buffer) => {
          const doc = String(buffer)
          const ns = ['xlink', 'xmlns', 'xml']
          const html = doc.match(/\/\/ HTML\s*?\n/)
          const svg = doc.match(/\/\/ SVG\s*?\n/)
          /** @type {Record<string, Record<string, string>>}  */
          const data = {}

          assert(html && html.index, 'expected `html` to match')
          assert(svg && svg.index, 'expected `svg` to match')

          data.html = process(doc.slice(html.index + html[0].length, svg.index))
          data.svg = process(
            doc.slice(svg.index + svg[0].length, doc.indexOf('}', svg.index))
          )

          fs.writeFile(
            path.join('script', 'react-data.js'),
            [
              '/**',
              ' * @type {Record<string, Record<string, string>>}',
              ' */',
              'export const reactData = ' + JSON.stringify(data, null, 2),
              ''
            ].join('\n'),
            bail
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
        })
      )
      .on('error', bail)
  }
)
