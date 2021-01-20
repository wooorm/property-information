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

Object.keys(react).forEach(function (type) {
  var info = schemas[type]

  Object.keys(react[type]).forEach(function (attr) {
    var reactProp = react[type][attr]
    var hastProp = info.normal[normalize(attr)]

    if (!hastProp) {
      reactAdditional.push(attr)
    } else if (reactProp !== hastProp) {
      hastPropToReact[hastProp] = reactProp
    }
  })
})

var toReact = {}

Object.keys(hastPropToReact)
  .sort(alphaSort)
  .forEach((x) => {
    toReact[x] = hastPropToReact[x]
  })

fs.writeFile(
  path.join('hast-to-react.json'),
  JSON.stringify(toReact, null, 2) + '\n',
  bail
)
