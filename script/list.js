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

var all = merge([xml, xlink, xmlns, svg, html, aria])

module.exports = parseErrors

function parseErrors() {
  return transform
}

function transform(tree) {
  zone(tree, 'list', visit)
}

function visit(start, nodes, end) {
  var properties = all.property
  var props = Object.keys(properties)
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
    var fields = [
      u('tableCell', [u('inlineCode', property)]),
      u('tableCell', [u('inlineCode', info.attribute)])
    ]

    if (info.space) {
      fields.push(u('tableCell', [u('inlineCode', info.space)]))
    }

    return u('tableRow', fields)
  }
}
