import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import {bail} from 'bail'
import concat from 'concat-stream'
import alphaSort from 'alpha-sort'

https.get(
  'https://raw.githubusercontent.com/facebook/react/master/packages/react-dom/src/shared/possibleStandardNames.js',
  onreact
)

/**
 * @param {import('http').IncomingMessage} response
 */
function onreact(response) {
  response.pipe(concat(onconcat)).on('error', bail)

  /**
   * @param {Buffer} buffer
   */
  function onconcat(buffer) {
    const doc = String(buffer)
    const ns = ['xlink', 'xmlns', 'xml']
    const html = doc.match(/\/\/ HTML\s*?\n/)
    const svg = doc.match(/\/\/ SVG\s*?\n/)
    /** @type {Object.<string, Object.<string, string>>}  */
    const data = {}

    data.html = process(doc.slice(html.index + html[0].length, svg.index))
    data.svg = process(
      doc.slice(svg.index + svg[0].length, doc.indexOf('}', svg.index))
    )

    fs.writeFile(
      path.join('script', 'react-data.js'),
      'export const reactData = ' + JSON.stringify(data, null, 2) + '\n',
      bail
    )

    /** @param {string} doc */
    function process(doc) {
      const re = /\s+(?:'([^']+)'|(\w+)): '([^']+)',/g
      let index = -1
      /** @type {Object.<string, string>} */
      const map = {}
      /** @type {Object.<string, string>} */
      const clean = {}
      /** @type {RegExpMatchArray} */
      let match

      while ((match = re.exec(doc))) {
        map[match[1] || match[2]] = match[3]
      }

      /** @type {Array.<string>} */
      const sorted = Object.keys(map)
        .sort(alphaSort())
        .filter(
          /**
           * @param {string} d
           * @returns {boolean}
           */
          function (d) {
            if (d === 'role') {
              data.aria = {}
              data.aria[d] = map[d]
              return false
            }

            return ns.every(function (space) {
              /** @type {Object.<string, string>} */
              let dat

              if (d.startsWith(space)) {
                // Ignore the ones w/o colon:
                if (!d.includes(':') && d !== space) {
                  return false
                }

                dat = data[space] || (data[space] = {})
                dat[d] = map[d]
                return false
              }

              return true
            })
          }
        )

      while (++index < sorted.length) {
        clean[sorted[index]] = map[sorted[index]]
      }

      return clean
    }
  }
}
