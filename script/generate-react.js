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

function onreact(response) {
  response.pipe(concat(onconcat)).on('error', bail)

  function onconcat(buffer) {
    var doc = String(buffer)
    var ns = ['xlink', 'xmlns', 'xml']
    var html = doc.match(/\/\/ HTML\s*?\n/)
    var svg = doc.match(/\/\/ SVG\s*?\n/)

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

    function process(doc) {
      var map = {}
      var re = /\s+(?:'([^']+)'|(\w+)): '([^']+)',/g
      var clean = {}
      var match
      var sorted
      var index = -1

      while ((match = re.exec(doc))) {
        map[match[1] || match[2]] = match[3]
      }

      sorted = Object.keys(map).sort(alphaSort()).filter(filter)

      while (++index < sorted.length) {
        clean[sorted[index]] = map[sorted[index]]
      }

      return clean

      function filter(d) {
        if (d === 'role') {
          data.aria = {}
          data.aria[d] = map[d]
          return false
        }

        return ns.every(function (space) {
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
