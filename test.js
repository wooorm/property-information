import assert from 'assert'
import test from 'tape'
import union from 'arr-union'
import values from 'object.values'
import {htmlElementAttributes} from 'html-element-attributes'
import {svgElementAttributes} from 'svg-element-attributes'
import {htmlEventAttributes} from 'html-event-attributes'
import {svgEventAttributes} from 'svg-event-attributes'
import {reactData} from './script/react-data.js'
import {normalize} from './normalize.js'
import {find} from './find.js'
import * as information from './index.js'
import {xlink} from './lib/xlink.js'
import {xml} from './lib/xml.js'
import {xmlns} from './lib/xmlns.js'
import {aria} from './lib/aria.js'
import {html} from './lib/html.js'
import {svg} from './lib/svg.js'

var schemas = {html, svg, aria, xlink, xml, xmlns}

var htmlAttributes = values(htmlElementAttributes).concat(htmlEventAttributes)
var svgAttributes = values(svgElementAttributes).concat(svgEventAttributes)

htmlAttributes = union.apply(null, htmlAttributes).sort()
svgAttributes = union.apply(null, svgAttributes).sort()

var reactIgnore = [
  // React specific:
  'children',
  'dangerouslysetinnerhtml',
  'defaultchecked',
  'defaultvalue',
  'innerhtml',
  'suppresscontenteditablewarning',
  'suppresshydrationwarning',

  // HTML
  // Existed on the deprecated `<keygen>`.
  'challenge',
  'keyparams',
  'keytype',
  // Existed on the deprecated `<command>`.
  'icon',
  'radiogroup',
  // Deprecated on all elements.
  'contextmenu',
  // Deprecated, existed on `<audio>` and `<video>`.
  'mediagroup',
  // Existed on the `<param>` element of the deprecated `<embed>` attribute.
  'wmode',

  // SVG
  // Deprecated on the `<switch>` element.
  'allowreorder',
  // Deprecated SMIL attributes.
  'autoreverse',
  'decelerate',
  'speed',

  // RDFa
  'inlist',
  'vocab',

  // These are supported, but grouped by React as SVG, even though they aren’t.
  'prefix',
  'results',
  'security',
  'unselectable'
]

var legacy = [
  'bordercolor',
  'bottommargin',
  'event',
  'leftmargin',
  'lowsrc',
  // `ondragexit` -> `ondragleave`
  'ondragexit',
  // `onloadend` -> `onload` probably?
  'onloadend',
  'rightmargin',
  'topmargin',
  'scoped',
  'seamless'
]

var custom = [
  // Iframes, supported everywhere
  'allowtransparency',
  // `autoCorrect` is supported in Mobile Safari for keyboard hints.
  // https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/Attributes.html#//apple_ref/doc/uid/TP40008058-autocorrect
  'autocorrect',
  // `autoSave` allows WebKit/Blink to persist values of input fields on page reloads.
  // https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/Attributes.html#//apple_ref/doc/uid/TP40008058-autosave
  'autosave',
  // https://developers.google.com/web/updates/2018/10/watch-video-using-picture-in-picture
  'disablepictureinpicture',
  // https://w3c.github.io/remote-playback/
  'disableremoteplayback',
  // `prefix` on `<html>` and `property` on `<meta>` are from OpenGraph
  // http://ogp.me
  'prefix',
  'property',
  // `results` show looking glass icon and recent searches on input search
  // fields in WebKit/Blink.
  // https://www.wufoo.com/html5/search-type/
  'results',
  // IE-only attribute that specifies security restrictions on an iframe as
  // an alternative to the sandbox attribute on IE < 10.
  'security',
  // IE-only attribute that controls focus behavior.
  // http://help.dottoro.com/lhwdpnva.php
  'unselectable'
]

var next = [
  // Media capture on `input[type=file]`
  // https://www.w3.org/TR/html-media-capture/
  'capture',
  // Show or hide control buttons on audio/video elements:
  // https://developers.google.com/web/updates/2017/03/chrome-58-media-updates#controlslist
  'controlslist'
]

// These are supported by `property-information`, but no longer or not yet in
// the core HTML specs.
var nonStandardAttributes = [].concat(legacy, custom, next)

// Some SVG properties:
var nonStandardSVGAttributes = [
  'paint-order',
  'vector-effect',

  // https://github.com/wooorm/svg-element-attributes/commit/dcc7643
  'hatchContentUnits',
  'hatchUnits',
  'pitch'
]

test('schema', function (t) {
  t.deepLooseEqual(information.html.property.className, {
    space: 'html',
    attribute: 'class',
    property: 'className',
    spaceSeparated: true
  })

  t.deepLooseEqual(information.html.property.srcSet, {
    space: 'html',
    attribute: 'srcset',
    property: 'srcSet',
    commaSeparated: true
  })

  t.deepLooseEqual(information.html.property.download, {
    space: 'html',
    attribute: 'download',
    property: 'download',
    overloadedBoolean: true
  })

  t.deepLooseEqual(information.html.property.xmlLang, {
    space: 'xml',
    attribute: 'xml:lang',
    property: 'xmlLang'
  })

  t.deepLooseEqual(information.html.property.span, {
    space: 'html',
    attribute: 'span',
    property: 'span',
    number: true
  })

  t.deepLooseEqual(information.html.property.value, {
    space: 'html',
    attribute: 'value',
    property: 'value',
    booleanish: true
  })

  t.deepLooseEqual(information.html.property.itemScope, {
    space: 'html',
    attribute: 'itemscope',
    property: 'itemScope',
    boolean: true
  })

  t.end()
})

test('normalize', function (t) {
  t.equal(
    information.html.normal[normalize('className')],
    information.html.normal[normalize('class')],
    'properties should match normalized (#1)'
  )

  t.equal(
    information.svg.normal[normalize('xmlLang')],
    information.svg.normal[normalize('xml:lang')],
    'properties should match attributes (#2)'
  )

  t.equal(
    information.svg.normal[normalize('xLinkArcRole')],
    information.svg.normal[normalize('xlink:arcrole')],
    'properties should match attributes (#3)'
  )

  t.equal(
    information.html.normal[normalize('httpEquiv')],
    information.html.normal[normalize('http-equiv')],
    'properties should match attributes (#4)'
  )

  t.equal(
    information.html.normal[normalize('ariaValueNow')],
    information.html.normal[normalize('aria-valuenow')],
    'properties should match attributes (#5)'
  )

  t.equal(
    information.svg.normal[normalize('glyphOrientationVertical')],
    information.svg.normal[normalize('glyph-orientation-vertical')],
    'properties should match attributes (#6)'
  )

  t.equal(
    information.svg.normal[normalize('panose1')],
    information.svg.normal[normalize('panose-1')],
    'properties should match attributes (#7)'
  )

  t.equal(
    normalize(':class'),
    ':class',
    'attribute delimiters should remain if not following a word boundary (GH-7)'
  )

  t.equal(
    normalize('class-'),
    'class-',
    'attribute delimiters should remain if not preceding a word boundary (GH-7)'
  )

  t.equal(
    normalize('class-name'),
    'class-name',
    'attribute delimiters should remain otherwise it will be handled as a different known property called className (GH-12)'
  )

  t.equal(
    normalize('[cl]a[ss]'),
    '[cl]a[ss]',
    'non-attribute characters should not be removed (GH-7)'
  )

  t.end()
})

test('find', function (t) {
  t.deepLooseEqual(
    find(information.html, 'for'),
    {
      space: 'html',
      attribute: 'for',
      property: 'htmlFor',
      spaceSeparated: true
    },
    'should find knowns by attribute'
  )

  t.deepLooseEqual(
    find(information.html, 'htmlFor'),
    {
      space: 'html',
      attribute: 'for',
      property: 'htmlFor',
      spaceSeparated: true
    },
    'should find knowns by property'
  )

  t.deepLooseEqual(
    find(information.html, 'FoR'),
    {
      space: 'html',
      attribute: 'for',
      property: 'htmlFor',
      spaceSeparated: true
    },
    'should find knowns by weirdly cased attribute'
  )

  t.deepLooseEqual(
    find(information.html, 'hTMLfOR'),
    {
      space: 'html',
      attribute: 'for',
      property: 'htmlFor',
      spaceSeparated: true
    },
    'should find knowns by weirdly cased property'
  )

  t.deepLooseEqual(
    find(information.html, 'xml:lang'),
    {space: 'xml', attribute: 'xml:lang', property: 'xmlLang'},
    'should find XML knowns by attribute'
  )

  t.deepLooseEqual(
    find(information.html, 'xmlLang'),
    {space: 'xml', attribute: 'xml:lang', property: 'xmlLang'},
    'should find knowns by property'
  )

  t.deepLooseEqual(
    find(information.html, 'xlink:arcrole'),
    {space: 'xlink', attribute: 'xlink:arcrole', property: 'xLinkArcRole'},
    'should find XLink knowns by attribute'
  )

  t.deepLooseEqual(
    find(information.html, 'xLinkArcRole'),
    {space: 'xlink', attribute: 'xlink:arcrole', property: 'xLinkArcRole'},
    'should find XLink knowns by property'
  )

  t.deepLooseEqual(
    find(information.html, 'xmlns:xlink'),
    {space: 'xmlns', attribute: 'xmlns:xlink', property: 'xmlnsXLink'},
    'should find XMLNS knowns by attribute'
  )

  t.deepLooseEqual(
    find(information.html, 'xmlnsXLink'),
    {space: 'xmlns', attribute: 'xmlns:xlink', property: 'xmlnsXLink'},
    'should find XMLNS knowns by property'
  )

  t.deepLooseEqual(
    find(information.html, 'aria-valuenow'),
    {attribute: 'aria-valuenow', property: 'ariaValueNow', number: true},
    'should find aria attributes'
  )

  t.deepLooseEqual(
    find(information.html, 'ariaValueNow'),
    {attribute: 'aria-valuenow', property: 'ariaValueNow', number: true},
    'should find aria properties'
  )

  t.deepLooseEqual(
    find(information.html, 'class-name'),
    {attribute: 'class-name', property: 'class-name'},
    'should not handle class-name as class property (GH-12)'
  )

  t.test('data', function (st) {
    var mapping = {
      'data-alpha': 'dataAlpha',
      'data-bravo-charlie': 'dataBravoCharlie',
      'data-delta:echo': 'dataDelta:echo',
      'data-foxtrot.golf': 'dataFoxtrot.golf',
      'data-hotel_india': 'dataHotel_india',
      'data-1-juliett': 'data1Juliett',
      'data-2.kilo': 'data2.kilo',
      'data-3-lima': 'data3Lima',
      'data-4:5': 'data4:5',
      'data-6-7': 'data6-7',
      'data-mike-1': 'dataMike-1',
      'data-november-1-2': 'dataNovember-1-2'
    }
    var index = -1
    var attribute
    var property

    for (attribute in mapping) {
      property = mapping[attribute]
      index++

      st.deepLooseEqual(
        find(information.html, attribute),
        {attribute: attribute, property: property},
        'should find data (#' + index + ', attribute)'
      )

      st.deepLooseEqual(
        find(information.html, property),
        {attribute: attribute, property: property},
        'should find data (#' + index + ', property)'
      )
    }

    st.deepLooseEqual(
      find(information.html, 'dataFoo-bar'),
      {attribute: 'dataFoo-bar', property: 'dataFoo-bar'},
      'should ignore invalid properties'
    )

    st.deepLooseEqual(
      find(information.html, 'data!Foo-bar'),
      {attribute: 'data!Foo-bar', property: 'data!Foo-bar'},
      'should ignore invalid attributes'
    )

    st.end()
  })

  t.deepLooseEqual(
    find(information.html, 'foo'),
    {attribute: 'foo', property: 'foo'},
    'should find unknown values (#1)'
  )

  t.deepLooseEqual(
    find(information.html, 'Bar'),
    {attribute: 'Bar', property: 'Bar'},
    'should find unknown values (#2)'
  )

  t.deepLooseEqual(
    find(information.html, 'BAZ'),
    {attribute: 'BAZ', property: 'BAZ'},
    'should find unknown values (#3)'
  )

  t.deepLooseEqual(
    find(information.html, 'QuX'),
    {attribute: 'QuX', property: 'QuX'},
    'should find unknown values (#4)'
  )

  t.equal(
    find(information.html, 'id').defined,
    true,
    'should mark known properties as defined'
  )

  t.equal(
    find(information.html, 'data-x').defined,
    true,
    'should mark data properties as defined'
  )

  t.equal(
    find(information.html, 'foo').defined,
    false,
    'should mark undefined properties'
  )

  t.end()
})

test('html', function (t) {
  t.doesNotThrow(function () {
    var index = -1
    while (++index < htmlAttributes.length) {
      assert(
        normalize(htmlAttributes[index]) in information.html.normal,
        htmlAttributes[index]
      )
    }
  }, 'known HTML attributes should be defined')

  t.doesNotThrow(function () {
    var info = Object.keys(information.html.property)
      .map((prop) => information.html.property[prop])
      .filter((info) => info.space === 'html')
    var index = -1

    while (++index < info.length) {
      assert(
        htmlAttributes.indexOf(info[index].attribute) !== -1 ||
          nonStandardAttributes.indexOf(info[index].attribute) !== -1,
        info[index].attribute + ' should be known or marked as non-standard'
      )
    }
  }, 'Defined HTML attributes should be known')

  t.end()
})

test('svg', function (t) {
  t.doesNotThrow(function () {
    // Ignore these. In tiny they’re cased. In SVG2 they’re lowercase.
    var ignore = ['playbackOrder', 'timelineBegin']
    var index = -1

    while (++index < svgAttributes.length) {
      if (ignore.indexOf(svgAttributes[index]) === -1) {
        assert(
          normalize(svgAttributes[index]) in information.svg.normal,
          svgAttributes[index]
        )
      }
    }
  }, 'known SVG attributes should be defined')

  t.doesNotThrow(function () {
    var info = Object.keys(information.svg.property)
      .map((prop) => information.svg.property[prop])
      .filter((info) => info.space === 'svg')
    var index = -1

    while (++index < info.length) {
      var defined =
        svgAttributes.indexOf(info[index].attribute) !== -1 ||
        nonStandardSVGAttributes.indexOf(info[index].attribute) !== -1
      assert(defined, info[index].attribute + ' is not known')
    }
  }, 'Defined SVG attributes should be known')

  t.end()
})

test('react', function (t) {
  var type

  for (type in reactData) {
    t.doesNotThrow(function () {
      var data = reactData[type]
      var attr

      for (attr in data) {
        if (reactIgnore.indexOf(attr) === -1) {
          assert(normalize(attr) in schemas[type].normal, attr)
        }
      }
    }, 'known ' + type + ' properties should be defined')
  }

  t.end()
})
