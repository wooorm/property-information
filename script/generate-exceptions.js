'use strict'

var fs = require('fs')
var path = require('path')
var bail = require('bail')
var alphaSort = require('alpha-sort')()
var normalize = require('../normalize')
var react = require('./react-data.json')

var schemas = {
  html: require('../lib/html'),
  svg: require('../lib/svg'),
  aria: require('../lib/aria'),
  xlink: require('../lib/xlink'),
  xml: require('../lib/xml'),
  xmlns: require('../lib/xmlns')
}

var reactAdditional = []
var hastPropToReact = {}
var type
var attr

for (type in react) {
  var info = schemas[type]

  for (attr in react[type]) {
    if (!info.normal[normalize(attr)]) {
      reactAdditional.push(attr)
    } else if (react[type][attr] !== info.normal[normalize(attr)]) {
      hastPropToReact[info.normal[normalize(attr)]] = react[type][attr]
    }
  }
}

var toReact = {}
var sorted = Object.keys(hastPropToReact).sort(alphaSort)
var index = -1

while (++index < sorted.length) {
  toReact[sorted[index]] = hastPropToReact[sorted[index]]
}

fs.writeFile(
  path.join('hast-to-react.json'),
  JSON.stringify(toReact, null, 2) + '\n',
  bail
)
