'use strict'

var assert = require('assert')
var test = require('tape')
var union = require('arr-union')
var values = require('object.values')
var htmlAttributes = require('html-element-attributes')
var svgAttributes = require('svg-element-attributes')
var reactHtmlProperties = require('./script/react-html')
var reactSvgProperties = require('./script/react-svg')
var normalize = require('./normalize')
var find = require('./find')
var information = require('.')

htmlAttributes = union.apply(null, values(htmlAttributes)).sort()
svgAttributes = union.apply(null, values(svgAttributes)).sort()

var htmlReactIgnore = [
  // Spelled `classId` here, in alignment with `itemId`.
  'classID',
  // Existed on the deprecated `<keygen>`.
  'challenge',
  'keyParams',
  'keyType',
  // Existed on the deprecated `<command>`.
  'icon',
  'radioGroup',
  // Deprecated on all elements.
  'contextMenu',
  // Deprecated, existed on `<audio>` and `<video>`.
  'mediaGroup',
  // Existed on the `<param>` element of the deprecated `<embed>` attribute.
  'wmode'
]

var svgReactIgnore = [
  // Deprecated on the `<switch>` element.
  'allowReorder',
  // Deprecated SMIL attributes.
  'autoReverse',
  'decelerate',
  'speed',
  // Cased differently here:
  'strokeDasharray', // `strokeDashArray`
  'strokeDashoffset', // `strokeDashOffset`
  'strokeLinecap', // `strokeLineCap`
  'strokeLinejoin', // `strokeLineJoin`
  'strokeMiterlimit' // `strokeMiterLimit`
]

var legacy = [
  'bordercolor',
  'bottommargin',
  'event',
  'leftmargin',
  'lowsrc',
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
var nonStandardSVGAttributes = ['paint-order', 'vector-effect']

test('schema', function(t) {
  t.deepEqual(information.html.property.className, {
    space: 'html',
    attribute: 'class',
    property: 'className',
    spaceSeparated: true
  })

  t.deepEqual(information.html.property.srcSet, {
    space: 'html',
    attribute: 'srcset',
    property: 'srcSet',
    commaSeparated: true
  })

  t.deepEqual(information.html.property.download, {
    space: 'html',
    attribute: 'download',
    property: 'download',
    overloadedBoolean: true
  })

  t.deepEqual(information.html.property.xmlLang, {
    space: 'xml',
    attribute: 'xml:lang',
    property: 'xmlLang'
  })

  t.deepEqual(information.html.property.span, {
    space: 'html',
    attribute: 'span',
    property: 'span',
    number: true
  })

  t.deepEqual(information.html.property.value, {
    space: 'html',
    attribute: 'value',
    property: 'value',
    booleanish: true
  })

  t.deepEqual(information.html.property.itemScope, {
    space: 'html',
    attribute: 'itemscope',
    property: 'itemScope',
    boolean: true
  })

  t.end()
})

test('normalize', function(t) {
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
    normalize(':class'),
    ':class',
    `non-word characters should not be removed
    when they did not serve as a delimiter (#7)`
  )

  t.equal(
    normalize('[class]'),
    '[class]',
    `non-word characters should not be removed
    when they did not serve as a delimiter (#7) / 2`
  )

  t.equal(
    normalize('class-'),
    'class-',
    `non-word characters should not be removed
    when they did not serve as a delimiter (#7) / 3`
  )

  t.end()
})

test('find', function(t) {
  t.deepEqual(
    find(information.html, 'for'),
    {
      space: 'html',
      attribute: 'for',
      property: 'htmlFor',
      spaceSeparated: true
    },
    'should find knowns by attribute'
  )

  t.deepEqual(
    find(information.html, 'htmlFor'),
    {
      space: 'html',
      attribute: 'for',
      property: 'htmlFor',
      spaceSeparated: true
    },
    'should find knowns by property'
  )

  t.deepEqual(
    find(information.html, 'FoR'),
    {
      space: 'html',
      attribute: 'for',
      property: 'htmlFor',
      spaceSeparated: true
    },
    'should find knowns by weirdly cased attribute'
  )

  t.deepEqual(
    find(information.html, 'hTMLfOR'),
    {
      space: 'html',
      attribute: 'for',
      property: 'htmlFor',
      spaceSeparated: true
    },
    'should find knowns by weirdly cased property'
  )

  t.deepEqual(
    find(information.html, 'xml:lang'),
    {space: 'xml', attribute: 'xml:lang', property: 'xmlLang'},
    'should find XML knowns by attribute'
  )

  t.deepEqual(
    find(information.html, 'xmlLang'),
    {space: 'xml', attribute: 'xml:lang', property: 'xmlLang'},
    'should find knowns by property'
  )

  t.deepEqual(
    find(information.html, 'xlink:arcrole'),
    {space: 'xlink', attribute: 'xlink:arcrole', property: 'xLinkArcRole'},
    'should find XLink knowns by attribute'
  )

  t.deepEqual(
    find(information.html, 'xLinkArcRole'),
    {space: 'xlink', attribute: 'xlink:arcrole', property: 'xLinkArcRole'},
    'should find XLink knowns by property'
  )

  t.deepEqual(
    find(information.html, 'xmlns:xlink'),
    {space: 'xmlns', attribute: 'xmlns:xlink', property: 'xmlnsXLink'},
    'should find XMLNS knowns by attribute'
  )

  t.deepEqual(
    find(information.html, 'xmlnsXLink'),
    {space: 'xmlns', attribute: 'xmlns:xlink', property: 'xmlnsXLink'},
    'should find XMLNS knowns by property'
  )

  t.deepEqual(
    find(information.html, 'aria-valuenow'),
    {attribute: 'aria-valuenow', property: 'ariaValueNow', number: true},
    'should find aria attributes'
  )

  t.deepEqual(
    find(information.html, 'ariaValueNow'),
    {attribute: 'aria-valuenow', property: 'ariaValueNow', number: true},
    'should find aria properties'
  )

  t.test('data', function(st) {
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

    Object.keys(mapping).forEach(check)

    function check(attribute, index) {
      var property = mapping[attribute]

      st.deepEqual(
        find(information.html, attribute),
        {attribute: attribute, property: property},
        'should find data (#' + index + ', attribute)'
      )

      st.deepEqual(
        find(information.html, property),
        {attribute: attribute, property: property},
        'should find data (#' + index + ', property)'
      )
    }

    st.deepEqual(
      find(information.html, 'dataFoo-bar'),
      {attribute: 'dataFoo-bar', property: 'dataFoo-bar'},
      'should ignore invalid properties'
    )

    st.deepEqual(
      find(information.html, 'data!Foo-bar'),
      {attribute: 'data!Foo-bar', property: 'data!Foo-bar'},
      'should ignore invalid attributes'
    )

    st.end()
  })

  t.deepEqual(
    find(information.html, 'foo'),
    {attribute: 'foo', property: 'foo'},
    'should find unknown values (#1)'
  )

  t.deepEqual(
    find(information.html, 'Bar'),
    {attribute: 'Bar', property: 'Bar'},
    'should find unknown values (#2)'
  )

  t.deepEqual(
    find(information.html, 'BAZ'),
    {attribute: 'BAZ', property: 'BAZ'},
    'should find unknown values (#3)'
  )

  t.deepEqual(
    find(information.html, 'QuX'),
    {attribute: 'QuX', property: 'QuX'},
    'should find unknown values (#4)'
  )

  t.end()
})

test('html', function(t) {
  t.doesNotThrow(function() {
    htmlAttributes.forEach(function(attribute) {
      assert(normalize(attribute) in information.html.normal, attribute)
    })
  }, 'known HTML attributes should be defined')

  t.doesNotThrow(function() {
    reactHtmlProperties.forEach(function(property) {
      if (htmlReactIgnore.indexOf(property) === -1) {
        assert(property in information.html.property, property)
      }
    })
  }, 'known React properties should be defined')

  t.doesNotThrow(function() {
    Object.keys(information.html.property)
      .map(function(prop) {
        return information.html.property[prop]
      })
      .filter(function(info) {
        return info.space === 'html'
      })
      .forEach(function(info) {
        var attribute = info.attribute
        var defined =
          htmlAttributes.indexOf(attribute) !== -1 ||
          nonStandardAttributes.indexOf(attribute) !== -1
        assert(
          defined,
          attribute + ' should be known or marked as non-standard'
        )
      })
  }, 'Defined HTML attributes should be known')

  t.end()
})

test('svg', function(t) {
  t.doesNotThrow(function() {
    // Ignore these. In tiny they’re cased. In SVG2 they’re lowercase.
    var ignore = ['playbackOrder', 'timelineBegin']

    svgAttributes.forEach(function(attribute) {
      if (ignore.indexOf(attribute) === -1) {
        assert(normalize(attribute) in information.svg.normal, attribute)
      }
    })
  }, 'known SVG attributes should be defined')

  t.doesNotThrow(function() {
    reactSvgProperties.forEach(function(property) {
      if (svgReactIgnore.indexOf(property) === -1) {
        assert(property in information.svg.property, property)
      }
    })
  }, 'known React properties should be defined')

  t.doesNotThrow(function() {
    Object.keys(information.svg.property)
      .map(function(prop) {
        return information.svg.property[prop]
      })
      .filter(function(info) {
        return info.space === 'svg'
      })
      .forEach(function(info) {
        var attribute = info.attribute
        var defined =
          svgAttributes.indexOf(attribute) !== -1 ||
          nonStandardSVGAttributes.indexOf(attribute) !== -1
        assert(defined, attribute + ' is not known')
      })
  }, 'Defined SVG attributes should be known')

  t.end()
})
