import fs from 'fs'
import path from 'path'
import https from 'https'
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
    var doc = String(buffer)
    var ns = ['xlink', 'xmlns', 'xml']
    var html = doc.match(/\/\/ HTML\s*?\n/)
    var svg = doc.match(/\/\/ SVG\s*?\n/)
    /** @type {Object.<string, Object.<string, string>>}  */
    var data = {}

    data.html = process(doc.slice(html.index + html[0].length, svg.index))
    data.svg = process(
      doc.slice(svg.index + svg[0].length, doc.indexOf('}', svg.index))
    )

    fs.writeFile(
      path.join('script', 'react-data.js'),
      'export var reactData = ' + JSON.stringify(data, null, 2) + '\n',
      bail
    )

    /** @param {string} doc */
    function process(doc) {
      var re = /\s+(?:'([^']+)'|(\w+)): '([^']+)',/g
      var index = -1
      /** @type {Object.<string, string>} */
      var map = {}
      /** @type {Object.<string, string>} */
      var clean = {}
      /** @type {RegExpMatchArray} */
      var match
      /** @type {Array.<string>} */
      var sorted

      while ((match = re.exec(doc))) {
        map[match[1] || match[2]] = match[3]
      }

      sorted = Object.keys(map).sort(alphaSort()).filter(filter)

      while (++index < sorted.length) {
        clean[sorted[index]] = map[sorted[index]]
      }

      return clean

      /**
       * @param {string} d
       * @returns {boolean}
       */
      function filter(d) {
        if (d === 'role') {
          data.aria = {}
          data.aria[d] = map[d]
          return false
        }

        return ns.every(function (space) {
          /** @type {Object.<string, string>} */
          var dat

          if (d.startsWith(space)) {
            // Ignore the ones w/o colon:
            if (d.indexOf(':') === -1 && d !== space) {
              return false
            }

            dat = data[space] || (data[space] = {})
            dat[d] = map[d]
            return false
          }

          return true
        })
      }
    }
  }
}
