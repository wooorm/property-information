'use strict'

var fs = require('fs')
var path = require('path')
var https = require('https')
var bail = require('bail')
var concat = require('concat-stream')
var alphaSort = require('alpha-sort')

https.get(
  'https://raw.githubusercontent.com/facebook/react/master/packages/react-dom/src/shared/possibleStandardNames.js',
  onreact
)

function onreact(res) {
  res.pipe(concat(onconcat)).on('error', bail)

  function onconcat(buf) {
    var doc = String(buf)
    var ns = ['xlink', 'xmlns', 'xml']
    var html = doc.match(/\/\/ HTML\s*?\n/)
    var svg = doc.match(/\/\/ SVG\s*?\n/)

    var data = {}

    data.html = process(doc.slice(html.index + html[0].length, svg.index))
    data.svg = process(
      doc.slice(svg.index + svg[0].length, doc.indexOf('}', svg.index))
    )

    fs.writeFile(
      path.join('script', 'react-data.json'),
      JSON.stringify(data, null, 2) + '\n',
      bail
    )

    function process(doc) {
      var map = {}
      var re = /\s+(?:'([^']+)'|(\w+)): '([^']+)',/g
      var match

      while ((match = re.exec(doc))) {
        map[match[1] || match[2]] = match[3]
      }

      return Object.keys(map)
        .sort(alphaSort.ascending)
        .filter(filter)
        .reduce((all, d) => {
          all[d] = map[d]
          return all
        }, {})

      function filter(d) {
        if (d === 'role') {
          data.aria = {}
          data.aria[d] = map[d]
          return false
        }

        return ns.every(function(space) {
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
