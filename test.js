/**
 * @typedef {import('./lib/util/schema.js').Schema} Schema
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {htmlElementAttributes} from 'html-element-attributes'
import {svgElementAttributes} from 'svg-element-attributes'
import {htmlEventAttributes} from 'html-event-attributes'
import {svgEventAttributes} from 'svg-event-attributes'
import {reactData} from './script/react-data.js'
import {normalize} from './lib/normalize.js'
import {find} from './lib/find.js'
import {xlink} from './lib/xlink.js'
import {xml} from './lib/xml.js'
import {xmlns} from './lib/xmlns.js'
import {aria} from './lib/aria.js'
import {html} from './lib/html.js'
import {svg} from './lib/svg.js'
import * as information from './index.js'

const own = {}.hasOwnProperty

const schemas = {html, svg, aria, xlink, xml, xmlns}

const htmlAttributes = htmlEventAttributes
  .concat(...Object.values(htmlElementAttributes))
  .sort()
const svgAttributes = svgEventAttributes
  .concat(...Object.values(svgElementAttributes))
  .sort()

const reactIgnore = new Set([
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
])

const legacy = [
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

const custom = [
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

const next = [
  // Media capture on `input[type=file]`
  // https://www.w3.org/TR/html-media-capture/
  'capture',
  // Show or hide control buttons on audio/video elements:
  // https://developers.google.com/web/updates/2017/03/chrome-58-media-updates#controlslist
  'controlslist'
]

// These are supported by `property-information`, but no longer or not yet in
// the core HTML specs.
const nonStandardAttributes = new Set([...legacy, ...custom, ...next])

// Some SVG properties:
const nonStandardSVGAttributes = new Set([
  'paint-order',
  'vector-effect',

  // https://github.com/wooorm/svg-element-attributes/commit/dcc7643
  'hatchContentUnits',
  'hatchUnits',
  'pitch'
])

test('schema', function () {
  assert.deepEqual(structuredClone(information.html.property.className), {
    space: 'html',
    attribute: 'class',
    property: 'className',
    spaceSeparated: true
  })

  assert.deepEqual(structuredClone(information.html.property.srcSet), {
    space: 'html',
    attribute: 'srcset',
    property: 'srcSet'
  })

  assert.deepEqual(structuredClone(information.html.property.download), {
    space: 'html',
    attribute: 'download',
    property: 'download',
    overloadedBoolean: true
  })

  assert.deepEqual(structuredClone(information.html.property.xmlLang), {
    space: 'xml',
    attribute: 'xml:lang',
    property: 'xmlLang'
  })

  assert.deepEqual(structuredClone(information.html.property.span), {
    space: 'html',
    attribute: 'span',
    property: 'span',
    number: true
  })

  assert.deepEqual(structuredClone(information.html.property.value), {
    space: 'html',
    attribute: 'value',
    property: 'value',
    booleanish: true
  })

  assert.deepEqual(structuredClone(information.html.property.itemScope), {
    space: 'html',
    attribute: 'itemscope',
    property: 'itemScope',
    boolean: true
  })
})

test('normalize', function () {
  assert.equal(
    information.html.normal[normalize('className')],
    information.html.normal[normalize('class')],
    'properties should match normalized (#1)'
  )

  assert.equal(
    information.svg.normal[normalize('xmlLang')],
    information.svg.normal[normalize('xml:lang')],
    'properties should match attributes (#2)'
  )

  assert.equal(
    information.svg.normal[normalize('xLinkArcRole')],
    information.svg.normal[normalize('xlink:arcrole')],
    'properties should match attributes (#3)'
  )

  assert.equal(
    information.html.normal[normalize('httpEquiv')],
    information.html.normal[normalize('http-equiv')],
    'properties should match attributes (#4)'
  )

  assert.equal(
    information.html.normal[normalize('ariaValueNow')],
    information.html.normal[normalize('aria-valuenow')],
    'properties should match attributes (#5)'
  )

  assert.equal(
    information.svg.normal[normalize('glyphOrientationVertical')],
    information.svg.normal[normalize('glyph-orientation-vertical')],
    'properties should match attributes (#6)'
  )

  assert.equal(
    information.svg.normal[normalize('panose1')],
    information.svg.normal[normalize('panose-1')],
    'properties should match attributes (#7)'
  )

  assert.equal(
    normalize(':class'),
    ':class',
    'attribute delimiters should remain if not following a word boundary (GH-7)'
  )

  assert.equal(
    normalize('class-'),
    'class-',
    'attribute delimiters should remain if not preceding a word boundary (GH-7)'
  )

  assert.equal(
    normalize('class-name'),
    'class-name',
    'attribute delimiters should remain otherwise it will be handled as a different known property called className (GH-12)'
  )

  assert.equal(
    normalize('[cl]a[ss]'),
    '[cl]a[ss]',
    'non-attribute characters should not be removed (GH-7)'
  )
})

test('find', async function (t) {
  assert.deepEqual(
    structuredClone(find(information.html, 'for')),
    {
      space: 'html',
      attribute: 'for',
      property: 'htmlFor',
      spaceSeparated: true
    },
    'should find knowns by attribute'
  )

  assert.deepEqual(
    structuredClone(find(information.html, 'htmlFor')),
    {
      space: 'html',
      attribute: 'for',
      property: 'htmlFor',
      spaceSeparated: true
    },
    'should find knowns by property'
  )

  assert.deepEqual(
    structuredClone(find(information.html, 'FoR')),
    {
      space: 'html',
      attribute: 'for',
      property: 'htmlFor',
      spaceSeparated: true
    },
    'should find knowns by weirdly cased attribute'
  )

  assert.deepEqual(
    structuredClone(find(information.html, 'hTMLfOR')),
    {
      space: 'html',
      attribute: 'for',
      property: 'htmlFor',
      spaceSeparated: true
    },
    'should find knowns by weirdly cased property'
  )

  assert.deepEqual(
    structuredClone(find(information.html, 'xml:lang')),
    {space: 'xml', attribute: 'xml:lang', property: 'xmlLang'},
    'should find XML knowns by attribute'
  )

  assert.deepEqual(
    structuredClone(find(information.html, 'xmlLang')),
    {space: 'xml', attribute: 'xml:lang', property: 'xmlLang'},
    'should find knowns by property'
  )

  assert.deepEqual(
    structuredClone(find(information.html, 'xlink:arcrole')),
    {space: 'xlink', attribute: 'xlink:arcrole', property: 'xLinkArcRole'},
    'should find XLink knowns by attribute'
  )

  assert.deepEqual(
    structuredClone(find(information.html, 'xLinkArcRole')),
    {space: 'xlink', attribute: 'xlink:arcrole', property: 'xLinkArcRole'},
    'should find XLink knowns by property'
  )

  assert.deepEqual(
    structuredClone(find(information.html, 'xmlns:xlink')),
    {space: 'xmlns', attribute: 'xmlns:xlink', property: 'xmlnsXLink'},
    'should find XMLNS knowns by attribute'
  )

  assert.deepEqual(
    structuredClone(find(information.html, 'xmlnsXLink')),
    {space: 'xmlns', attribute: 'xmlns:xlink', property: 'xmlnsXLink'},
    'should find XMLNS knowns by property'
  )

  assert.deepEqual(
    structuredClone(find(information.html, 'aria-valuenow')),
    {attribute: 'aria-valuenow', property: 'ariaValueNow', number: true},
    'should find aria attributes'
  )

  assert.deepEqual(
    structuredClone(find(information.html, 'ariaValueNow')),
    {attribute: 'aria-valuenow', property: 'ariaValueNow', number: true},
    'should find aria properties'
  )

  assert.deepEqual(
    structuredClone(find(information.html, 'class-name')),
    {attribute: 'class-name', property: 'class-name'},
    'should not handle class-name as class property (GH-12)'
  )

  await t.test('data', function () {
    const mapping = {
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
    let index = -1
    /** @type {keyof mapping} */
    let attribute

    for (attribute in mapping) {
      if (own.call(mapping, attribute)) {
        const property = mapping[attribute]
        index++

        assert.deepEqual(
          structuredClone(find(information.html, attribute)),
          {attribute, property},
          'should find data (#' + index + ', attribute)'
        )

        assert.deepEqual(
          structuredClone(find(information.html, property)),
          {attribute, property},
          'should find data (#' + index + ', property)'
        )
      }
    }

    assert.deepEqual(
      structuredClone(find(information.html, 'dataFoo-bar')),
      {attribute: 'dataFoo-bar', property: 'dataFoo-bar'},
      'should ignore invalid properties'
    )

    assert.deepEqual(
      structuredClone(find(information.html, 'data!Foo-bar')),
      {attribute: 'data!Foo-bar', property: 'data!Foo-bar'},
      'should ignore invalid attributes'
    )
  })

  assert.deepEqual(
    structuredClone(find(information.html, 'foo')),
    {attribute: 'foo', property: 'foo'},
    'should find unknown values (#1)'
  )

  assert.deepEqual(
    structuredClone(find(information.html, 'Bar')),
    {attribute: 'Bar', property: 'Bar'},
    'should find unknown values (#2)'
  )

  assert.deepEqual(
    structuredClone(find(information.html, 'BAZ')),
    {attribute: 'BAZ', property: 'BAZ'},
    'should find unknown values (#3)'
  )

  assert.deepEqual(
    structuredClone(find(information.html, 'QuX')),
    {attribute: 'QuX', property: 'QuX'},
    'should find unknown values (#4)'
  )

  assert.equal(
    find(information.html, 'id').defined,
    true,
    'should mark known properties as defined'
  )

  assert.equal(
    find(information.html, 'data-x').defined,
    true,
    'should mark data properties as defined'
  )

  assert.equal(
    find(information.html, 'foo').defined,
    false,
    'should mark undefined properties'
  )
})

test('html', function () {
  // Does this throw an error?
  // Then an attribute was likely recently added to HTML.
  // The solution is probably to define it in `lib/html.js`.
  assert.doesNotThrow(function () {
    let index = -1
    while (++index < htmlAttributes.length) {
      assert(
        normalize(htmlAttributes[index]) in information.html.normal,
        htmlAttributes[index]
      )
    }
  }, 'known HTML attributes should be defined')

  assert.doesNotThrow(function () {
    const info = Object.keys(information.html.property)
      .map((prop) => information.html.property[prop])
      .filter((info) => info.space === 'html')
    let index = -1

    while (++index < info.length) {
      assert(
        htmlAttributes.includes(info[index].attribute) ||
          nonStandardAttributes.has(info[index].attribute),
        info[index].attribute + ' should be known or marked as non-standard'
      )
    }
  }, 'Defined HTML attributes should be known')
})

test('svg', function () {
  assert.doesNotThrow(function () {
    // Ignore these. In tiny they’re cased. In SVG2 they’re lowercase.
    const ignore = new Set(['playbackOrder', 'timelineBegin'])
    let index = -1

    while (++index < svgAttributes.length) {
      if (!ignore.has(svgAttributes[index])) {
        assert(
          normalize(svgAttributes[index]) in information.svg.normal,
          svgAttributes[index]
        )
      }
    }
  }, 'known SVG attributes should be defined')

  assert.doesNotThrow(function () {
    const info = Object.keys(information.svg.property)
      .map((prop) => information.svg.property[prop])
      .filter((info) => info.space === 'svg')
    let index = -1

    while (++index < info.length) {
      const defined =
        svgAttributes.includes(info[index].attribute) ||
        nonStandardSVGAttributes.has(info[index].attribute)
      assert(defined, info[index].attribute + ' is not known')
    }
  }, 'Defined SVG attributes should be known')
})

test('react', function () {
  /** @type {string} */
  let type

  for (type in reactData) {
    if (own.call(reactData, type)) {
      assert.doesNotThrow(function () {
        /** @type {Record<string, string>} */
        const data = reactData[type]
        /** @type {string} */
        let attr

        for (attr in data) {
          if (!reactIgnore.has(attr)) {
            /** @type {Schema} */
            // @ts-expect-error: hush
            const schema = schemas[type]
            assert(normalize(attr) in schema.normal, attr)
          }
        }
      }, 'known ' + type + ' properties should be defined')
    }
  }
})
