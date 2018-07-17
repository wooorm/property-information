'use strict';

var fs = require('fs');
var path = require('path');
var https = require('https');
var bail = require('bail');
var concat = require('concat-stream');
var alphaSort = require('alpha-sort');
var unified = require('unified');
var parse = require('remark-parse');
var frontmatter = require('remark-frontmatter');
var visit = require('unist-util-visit');
var toString = require('mdast-util-to-string');

var proc = unified().use(parse).use(frontmatter);

https.get('https://raw.githubusercontent.com/reactjs/reactjs.org/master/content/docs/reference-dom-elements.md', onreact);

function onreact(res) {
  res.pipe(concat(onconcat)).on('error', bail);

  function onconcat(buf) {
    var tree = proc.parse(buf);

    visit(tree, 'code', visitor, true);

    function visitor(node, index, parent) {
      var headline = toString(parent.children[index - 1]);

      if (/SVG/.test(headline)) {
        add(node, 'svg');
      }

      if (/DOM/.test(headline)) {
        add(node, 'html');
        return visit.EXIT;
      }
    }

    function add(node, type) {
      var value = node.value.split(/\s/g).sort(alphaSort.asc).filter(filter);

      fs.writeFile(
        path.join('build', 'react-' + type + '.json'),
        JSON.stringify(value, null, 2) + '\n',
        bail
      );
    }

    function filter(value) {
      return !/^(xml|xlink|xmlns)/.test(value);
    }
  }
}
