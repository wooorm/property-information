/**
 * @import {Schema} from 'property-information'
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {htmlElementAttributes} from 'html-element-attributes'
import {htmlEventAttributes} from 'html-event-attributes'
import {find, html, normalize, svg} from 'property-information'
import {svgElementAttributes} from 'svg-element-attributes'
import {svgEventAttributes} from 'svg-event-attributes'
import {aria} from './lib/aria.js'
import {xlink} from './lib/xlink.js'
import {xmlns} from './lib/xmlns.js'
import {xml} from './lib/xml.js'
import {reactData} from './script/react-data.js'

/** @type {Record<string, Schema>} */
const schemas = {aria, html, svg, xlink, xmlns, xml}

const htmlAttributes = [
  ...htmlEventAttributes,
  ...Object.values(htmlElementAttributes).flat()
].sort()

const svgAttributes = [
  ...svgEventAttributes,
  ...Object.values(svgElementAttributes).flat()
].sort()

// Note: there are also values misclassified in the react data,
// between HTML and SVG.
// Those can be patched in `script/generate-react.js`.
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
  'vocab'
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

// These are supported by `property-information`,
// but no longer or not yet in the core HTML specs.
const nonStandardAttributes = new Set([...legacy, ...custom, ...next])

// Some SVG properties:
const nonStandardSvgAttributes = new Set([
  'paint-order',
  'vector-effect',

  // https://github.com/wooorm/svg-element-attributes/commit/dcc7643
  'hatchContentUnits',
  'hatchUnits',
  'pitch',

  // https://github.com/facebook/react/pull/26115.
  'transform-origin'
])

test('property-information', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('property-information')).sort(), [
      'find',
      'hastToReact',
      'html',
      'normalize',
      'svg'
    ])
  })
})

test('schema', async function (t) {
  await t.test('should support `className`', async function () {
    assert.deepEqual(structuredClone(html.property.className), {
      attribute: 'class',
      property: 'className',
      spaceSeparated: true,
      space: 'html'
    })
  })

  await t.test('should support `srcSet`', async function () {
    assert.deepEqual(structuredClone(html.property.srcSet), {
      attribute: 'srcset',
      property: 'srcSet',
      space: 'html'
    })
  })

  await t.test('should support `download`', async function () {
    assert.deepEqual(structuredClone(html.property.download), {
      attribute: 'download',
      overloadedBoolean: true,
      property: 'download',
      space: 'html'
    })
  })

  await t.test('should support `xmlLang`', async function () {
    assert.deepEqual(structuredClone(html.property.xmlLang), {
      attribute: 'xml:lang',
      property: 'xmlLang',
      space: 'xml'
    })
  })

  await t.test('should support `span`', async function () {
    assert.deepEqual(structuredClone(html.property.span), {
      attribute: 'span',
      number: true,
      property: 'span',
      space: 'html'
    })
  })

  await t.test('should support `value`', async function () {
    assert.deepEqual(structuredClone(html.property.value), {
      attribute: 'value',
      booleanish: true,
      property: 'value',
      space: 'html'
    })
  })

  await t.test('should support `itemScope`', async function () {
    assert.deepEqual(structuredClone(html.property.itemScope), {
      attribute: 'itemscope',
      boolean: true,
      property: 'itemScope',
      space: 'html'
    })
  })
})

test('normalize', async function (t) {
  await t.test('should normalize properties (#1)', async function () {
    assert.equal(
      html.normal[normalize('className')],
      html.normal[normalize('class')]
    )
  })

  await t.test('should normalize properties (#2)', async function () {
    assert.equal(
      svg.normal[normalize('xmlLang')],
      svg.normal[normalize('xml:lang')]
    )
  })

  await t.test('should normalize properties (#3)', async function () {
    assert.equal(
      svg.normal[normalize('xLinkArcRole')],
      svg.normal[normalize('xlink:arcrole')]
    )
  })

  await t.test('should normalize properties (#4)', async function () {
    assert.equal(
      html.normal[normalize('httpEquiv')],
      html.normal[normalize('http-equiv')]
    )
  })

  await t.test('should normalize properties (#5)', async function () {
    assert.equal(
      html.normal[normalize('ariaValueNow')],
      html.normal[normalize('aria-valuenow')]
    )
  })

  await t.test('should normalize properties (#6)', async function () {
    assert.equal(
      svg.normal[normalize('glyphOrientationVertical')],
      svg.normal[normalize('glyph-orientation-vertical')]
    )
  })

  await t.test('should normalize properties (#7)', async function () {
    assert.equal(
      svg.normal[normalize('panose1')],
      svg.normal[normalize('panose-1')]
    )
  })

  await t.test(
    'should keep attribute delimiters if not following a word boundary (GH-7)',
    async function () {
      assert.equal(normalize(':class'), ':class')
    }
  )

  await t.test(
    'should keep attribute delimiters if not preceding a word boundary (GH-7)',
    async function () {
      assert.equal(normalize('class-'), 'class-')
    }
  )

  await t.test('should kep non-attribute characters (GH-7)', async function () {
    assert.equal(normalize('[cl]a[ss]'), '[cl]a[ss]')
  })

  await t.test('should keep attribute delimiters (GH-12)', async function () {
    assert.equal(normalize('class-name'), 'class-name')
  })
})

test('find', async function (t) {
  await t.test('should find known info by attribute', async function () {
    assert.deepEqual(structuredClone(find(html, 'for')), {
      attribute: 'for',
      property: 'htmlFor',
      spaceSeparated: true,
      space: 'html'
    })
  })

  await t.test('should find known info by property', async function () {
    assert.deepEqual(structuredClone(find(html, 'htmlFor')), {
      attribute: 'for',
      property: 'htmlFor',
      spaceSeparated: true,
      space: 'html'
    })
  })

  await t.test(
    'should find known info by weirdly cased attribute',
    async function () {
      assert.deepEqual(structuredClone(find(html, 'FoR')), {
        attribute: 'for',
        property: 'htmlFor',
        spaceSeparated: true,
        space: 'html'
      })
    }
  )

  await t.test(
    'should find known info by weirdly cased property',
    async function () {
      assert.deepEqual(structuredClone(find(html, 'hTMLfOR')), {
        attribute: 'for',
        property: 'htmlFor',
        spaceSeparated: true,
        space: 'html'
      })
    }
  )

  await t.test('should find known XML info by attribute', async function () {
    assert.deepEqual(structuredClone(find(html, 'xml:lang')), {
      attribute: 'xml:lang',
      property: 'xmlLang',
      space: 'xml'
    })
  })

  await t.test('should find known XML info by property', async function () {
    assert.deepEqual(structuredClone(find(html, 'xmlLang')), {
      attribute: 'xml:lang',
      property: 'xmlLang',
      space: 'xml'
    })
  })

  await t.test('should find known XLink info by attribute', async function () {
    assert.deepEqual(structuredClone(find(html, 'xlink:arcrole')), {
      attribute: 'xlink:arcrole',
      property: 'xLinkArcRole',
      space: 'xlink'
    })
  })

  await t.test('should find known XLink info by property', async function () {
    assert.deepEqual(structuredClone(find(html, 'xLinkArcRole')), {
      attribute: 'xlink:arcrole',
      property: 'xLinkArcRole',
      space: 'xlink'
    })
  })

  await t.test('should find known XMLNS info by attribute', async function () {
    assert.deepEqual(structuredClone(find(html, 'xmlns:xlink')), {
      attribute: 'xmlns:xlink',
      property: 'xmlnsXLink',
      space: 'xmlns'
    })
  })

  await t.test('should find known XMLNS info by property', async function () {
    assert.deepEqual(structuredClone(find(html, 'xmlnsXLink')), {
      attribute: 'xmlns:xlink',
      property: 'xmlnsXLink',
      space: 'xmlns'
    })
  })

  await t.test('should find known aria info by attribute', async function () {
    assert.deepEqual(structuredClone(find(html, 'aria-valuenow')), {
      attribute: 'aria-valuenow',
      number: true,
      property: 'ariaValueNow'
    })
  })

  await t.test('should find known aria info by property', async function () {
    assert.deepEqual(structuredClone(find(html, 'ariaValueNow')), {
      attribute: 'aria-valuenow',
      number: true,
      property: 'ariaValueNow'
    })
  })

  /** @type {Record<string, string>} */
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

  for (const [attribute, property] of Object.entries(mapping)) {
    await t.test(
      'should find data info by attribute (`' + attribute + '`)',
      async function () {
        assert.deepEqual(structuredClone(find(html, attribute)), {
          attribute,
          property
        })
      }
    )

    await t.test(
      'should find data info by property (`' + property + '`)',
      async function () {
        assert.deepEqual(structuredClone(find(html, property)), {
          attribute,
          property
        })
      }
    )
  }

  await t.test('should find unknown data values (#1)', async function () {
    assert.deepEqual(structuredClone(find(html, 'dataFoo-bar')), {
      attribute: 'dataFoo-bar',
      property: 'dataFoo-bar'
    })
  })

  await t.test('should find unknown data values (#2)', async function () {
    assert.deepEqual(structuredClone(find(html, 'data!Foo-bar')), {
      attribute: 'data!Foo-bar',
      property: 'data!Foo-bar'
    })
  })

  await t.test('should find unknown values (#3)', async function () {
    assert.deepEqual(structuredClone(find(html, 'foo')), {
      attribute: 'foo',
      property: 'foo'
    })
  })

  await t.test('should find unknown values (#4)', async function () {
    assert.deepEqual(structuredClone(find(html, 'Bar')), {
      attribute: 'Bar',
      property: 'Bar'
    })
  })

  await t.test('should find unknown values (#5)', async function () {
    assert.deepEqual(structuredClone(find(html, 'BAZ')), {
      attribute: 'BAZ',
      property: 'BAZ'
    })
  })

  await t.test('should find unknown values (#6)', async function () {
    assert.deepEqual(structuredClone(find(html, 'QuX')), {
      attribute: 'QuX',
      property: 'QuX'
    })
  })

  await t.test('should mark known properties as defined', async function () {
    assert.equal(find(html, 'id').defined, true)
  })

  await t.test('should mark data properties as defined', async function () {
    assert.equal(find(html, 'data-x').defined, true)
  })

  await t.test(
    'should mark undefined properties as not defined',
    async function () {
      assert.equal(find(html, 'foo').defined, false)
    }
  )
})

test('html', async function (t) {
  await t.test('should know standard HTML attributes', async function () {
    // Does this throw an error?
    // Then an attribute was likely recently added to HTML:
    // either through `html-element-attributes` or `html-event-attributes`.
    // The solution is probably to define it in `lib/html.js`.
    for (const attribute of htmlAttributes) {
      assert(attribute in html.normal, attribute)
    }
  })

  await t.test(
    'should not know standard attributes as nonstandard',
    async function () {
      // Does this throw an error?
      // Then a previously nonstandard attribute is now in HTML.
      // It can be removed from `nonStandardAttributes`.
      for (const attribute of nonStandardAttributes) {
        assert(!htmlAttributes.includes(attribute), attribute)
      }
    }
  )

  await t.test('should not know undefined attributes', async function () {
    // Does this throw an error?
    // Then an attribute in this project is *not* in HTML.
    // If it is supposed to be here,
    // add it to `nonStandardAttributes`.
    for (const info of Object.values(html.property)) {
      if (info.space === 'html') {
        if (nonStandardAttributes.has(info.attribute)) continue

        assert(htmlAttributes.includes(info.attribute), info.attribute)
      }
    }
  })
})

test('svg', async function (t) {
  await t.test('should know standard SVG attributes', async function () {
    // Does this throw an error?
    // Then an attribute was likely recently added to SVG:
    // either through `svg-element-attributes` or `vg-event-attributes`.
    // The solution is probably to define it in `lib/svg.js`.
    for (const attribute of svgAttributes) {
      assert(normalize(attribute) in svg.normal, attribute)
    }
  })

  await t.test(
    'should not know standard attributes as nonstandard',
    async function () {
      // Does this throw an error?
      // Then a previously nonstandard attribute is now in SVG.
      // It can be removed from `nonStandardSvgAttributes`.
      for (const attribute of nonStandardSvgAttributes) {
        assert(!svgAttributes.includes(attribute), attribute)
      }
    }
  )

  await t.test('should not know undefined attributes', async function () {
    // Does this throw an error?
    // Then an attribute in this project is *not* in SVG.
    // If it is supposed to be here,
    // add it to `nonStandardSvgAttributes`.
    for (const info of Object.values(svg.property)) {
      if (info.space === 'svg') {
        if (nonStandardSvgAttributes.has(info.attribute)) continue
        assert(svgAttributes.includes(info.attribute), info.attribute)
      }
    }
  })
})

test('react', async function (t) {
  await t.test('should know react props', async function () {
    for (const [type, data] of Object.entries(reactData)) {
      const schema = schemas[type]
      assert(schema, type)

      for (const normal of Object.keys(data)) {
        if (reactIgnore.has(normal)) continue
        assert(normal in schema.normal, normal)
      }
    }
  })

  await t.test(
    'should not know standard attributes as nonstandard',
    async function () {
      /** @type {Record<string, string>} */
      const normals = {}

      for (const schema of Object.values(schemas)) {
        Object.assign(normals, schema.normal)
      }

      for (const normal of reactIgnore) {
        assert(!(normal in normals), normal)
      }
    }
  )
})
