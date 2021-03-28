'use strict'

var u = require('unist-builder')
var zone = require('mdast-zone')
var xlink = require('../lib/xlink')
var xml = require('../lib/xml')
var xmlns = require('../lib/xmlns')
var aria = require('../lib/aria')
var svg = require('../lib/svg')
var html = require('../lib/html')
var merge = require('../lib/util/merge')

var schemas = [xml, xlink, xmlns, svg, html, aria]
var all = merge(schemas)

module.exports = parseErrors

function parseErrors() {
  return transform
}

function transform(tree) {
  zone(tree, 'list', visit)
}

function visit(start, nodes, end) {
  var properties = all.property
  var props = Object.keys(properties).sort()
  var rows = [
    u('tableRow', [
      u('tableCell', [u('text', 'Property')]),
      u('tableCell', [u('text', 'Attribute')]),
      u('tableCell', [u('text', 'Space')])
    ])
  ]

  return [start, u('table', {align: []}, rows.concat(props.map(map))), end]

  function map(property) {
    var info = properties[property]
    var spaces = []
    var fields = [
      u('tableCell', [u('inlineCode', property)]),
      u('tableCell', [u('inlineCode', info.attribute)])
    ]
    var index = -1
    var propInfo

    while (++index < schemas.length) {
      propInfo = schemas[index].property[property]

      if (propInfo && propInfo.space) {
        if (spaces.length > 0) {
          spaces.push(u('text', ', '))
        }

        spaces.push(u('inlineCode', propInfo.space))
      }
    }

    if (spaces.length > 0) {
      fields.push(u('tableCell', spaces))
    }

    return u('tableRow', fields)
  }
}
