# property-information [![Build Status][build-badge]][build-status] [![Coverage Status][coverage-badge]][coverage-status]

Information for properties and attributes on the web-platform (HTML, SVG, ARIA,
XML, XMLNS, XLink).

## Installation

[npm][]:

```bash
npm install property-information
```

## Table of Contents

*   [Usage](#usage)
*   [API](#api)
    *   [propertyInformation.find(schema, name)](#propertyinformationfindschema-name)
    *   [propertyInformation.normalize(name)](#propertyinformationnormalizename)
    *   [propertyInformation.html](#propertyinformationhtml)
    *   [propertyInformation.svg](#propertyinformationsvg)
*   [Support](#support)
*   [Related](#related)
*   [License](#license)

## Usage

```js
var info = require('property-information')

console.log(info.find(info.html, 'className'))
// Or: info.find(info.html, 'class')
console.log(info.find(info.svg, 'horiz-adv-x'))
// Or: info.find(info.svg, 'horizAdvX')
console.log(info.find(info.svg, 'xlink:arcrole'))
// Or: info.find(info.svg, 'xLinkArcRole')
console.log(info.find(info.html, 'xmlLang'))
// Or: info.find(info.html, 'xml:lang')
console.log(info.find(info.html, 'ariaValueNow'))
// Or: info.find(info.html, 'aria-valuenow')
```

Yields:

```js
{ space: 'html',
  attribute: 'class',
  property: 'className',
  spaceSeparated: true }
{ space: 'svg',
  attribute: 'horiz-adv-x',
  property: 'horizAdvX',
  number: true }
{ space: 'xlink', attribute: 'xlink:arcrole', property: 'xLinkArcrole' }
{ space: 'xml', attribute: 'xml:lang', property: 'xmlLang' }
{ attribute: 'aria-valuenow', property: 'ariaValueNow', number: true }
```

## API

### `propertyInformation.find(schema, name)`

Look up info on a property.

In most cases, the given `schema` contains info on the property.
All standard, most legacy, and some non-standard properties are supported.
For these cases, the returned [`Info`][info] has hints about value of the
property.

`name` can be a [valid data attribute or property][data], in which case an
[`Info`][info] object with the correctly cased `attribute` and `property` is
returned.

`name` can be an unknown attribute, in which case an [`Info`][info] object
with `attribute` and `property` set to the given name is returned.
It is not recommended to provide unsupported legacy or recently specced
properties.

#### Parameters

*   `schema` ([`Schema`][schema])
    — Either `propertyInformation.html` or `propertyInformation.svg`
*   `name` (`string`)
    — An attribute-like or property-like name that is passed through
    [`normalize`][normalize] to find the correct info

#### Returns

[`Info`][info].

#### Note

`find` can be accessed directly from `require('property-information/find')` as
well.

#### Example

Aside from the aforementioned example, which shows known HTML, SVG, XML, XLink,
and ARIA support, data properties and attributes are also supported:

```js
console.log(info.find(info.html, 'data-date-of-birth'))
// Or: info.find(info.html, 'dataDateOfBirth')
```

Yields:

```js
{ attribute: 'data-date-of-birth', property: 'dataDateOfBirth' }
```

Unknown values are passed through untouched:

```js
console.log(info.find(info.html, 'un-Known'))
```

Yields:

```js
{ attribute: 'un-Known', property: 'un-Known' }
```

### `propertyInformation.normalize(name)`

Get the cleaned case-insensitive form of an attribute or a property.

This removed all non-alphanumerical characters from `name`, and lowercases
the result.

#### Parameters

*   `name` (`string`) — An attribute-like or property-like name

#### Returns

`string` that can be used to look up the properly cased property in a
[`Schema`][schema].

#### Note

`normalize` can be accessed directly from
`require('property-information/normalize')` as well.

#### Example

```js
info.html.normal[info.normalize('for')] // => 'htmlFor'
info.svg.normal[info.normalize('VIEWBOX')] // => 'viewBox'
info.html.normal[info.normalize('unknown')] // => undefined
```

### `propertyInformation.html`

### `propertyInformation.svg`

[`Schema`][schema] for either HTML or SVG, containing info on properties from
the primary space (HTML or SVG) and related embedded spaces (ARIA, XML, XMLNS,
XLink).

#### Note

`html` and `svg` can be accessed directly from
`require('property-information/html')` and `require('property-information/svg')`
as well.

#### Example

```js
console.log(info.html.property.htmlFor)
console.log(info.svg.property.viewBox)
console.log(info.html.property.unknown)
```

Yields:

```js
{ space: 'html',
  attribute: 'for',
  property: 'htmlFor',
  spaceSeparated: true }
{ space: 'svg', attribute: 'viewBox', property: 'viewBox' }
undefined
```

#### `Schema`

A schema for a primary space.

*   `space` (`'html'` or `'svg'`) — Primary space of the schema
*   `normal` (`Object.<string>`) — Object mapping normalized attributes and
    properties to properly cased properties
*   `property` ([`Object.<Info>`][info]) — Object mapping properties to info

#### `Info`

Info on a property.

*   `space` (`'html'`, `'svg'`, `'xml'`, `'xlink'`, `'xmlns'`, optional)
    — [Space][namespace] of the property
*   `attribute` (`string`) — Attribute name for the property that could be used
    in markup (for example: `'aria-describedby'`, `'allowfullscreen'`,
    `'xml:lang'`, `'for'`, or `'charoff'`)
*   `property` (`string`) — JavaScript-style camel-cased name, based on the
    DOM, but sometimes different (for example: `'ariaDescribedBy'`,
    `'allowFullScreen'`, `'xmlLang'`, `'htmlFor'`, `'chOff'`)
*   `boolean` (`boolean`) — The property is `boolean`.
    The default value of this property is false, so it can be omitted
*   `booleanish` (`boolean`) — The property is a `boolean`.
    The default value of this property is something other than false, so
    `false` must persist.
    The value can hold a string (as is the case with `ariaChecked` and its
    `'mixed'` value)
*   `overloadedBoolean` (`boolean`) — The property is `boolean`.
    The default value of this property is false, so it can be omitted.
    The value can hold a string (as is the case with `download` as its value
    reflects the name to use for the downloaded file)
*   `number` (`boolean`) — The property is `number`.
    These values can sometimes hold a string
*   `spaceSeparated` (`boolean`) — The property is a list separated by spaces
    (for example, `className`)
*   `commaSeparated` (`boolean`) — The property is a list separated by commas
    (for example, `srcSet`)
*   `commaOrSpaceSeparated` (`boolean`) — The property is a list separated by
    commas or spaces (for example, `strokeDashArray`)
*   `mustUseProperty` (`boolean`) — If a DOM is used, setting the property
    should be used for the change to take effect (this is true only for
    `'checked'`, `'multiple'`, `'muted'`, and `'selected'`)

## Support

<!--list start-->

| Property                     | Attribute                      | Space   |
| ---------------------------- | ------------------------------ | ------- |
| `xmlLang`                    | `xml:lang`                     | `xml`   |
| `xmlBase`                    | `xml:base`                     | `xml`   |
| `xmlSpace`                   | `xml:space`                    | `xml`   |
| `xLinkActuate`               | `xlink:actuate`                | `xlink` |
| `xLinkArcRole`               | `xlink:arcrole`                | `xlink` |
| `xLinkHref`                  | `xlink:href`                   | `xlink` |
| `xLinkRole`                  | `xlink:role`                   | `xlink` |
| `xLinkShow`                  | `xlink:show`                   | `xlink` |
| `xLinkTitle`                 | `xlink:title`                  | `xlink` |
| `xLinkType`                  | `xlink:type`                   | `xlink` |
| `xmlns`                      | `xmlns`                        | `xmlns` |
| `xmlnsXLink`                 | `xmlns:xlink`                  | `xmlns` |
| `about`                      | `about`                        | `svg`   |
| `accentHeight`               | `accent-height`                | `svg`   |
| `accumulate`                 | `accumulate`                   | `svg`   |
| `additive`                   | `additive`                     | `svg`   |
| `alignmentBaseline`          | `alignment-baseline`           | `svg`   |
| `alphabetic`                 | `alphabetic`                   | `svg`   |
| `amplitude`                  | `amplitude`                    | `svg`   |
| `arabicForm`                 | `arabic-form`                  | `svg`   |
| `ascent`                     | `ascent`                       | `svg`   |
| `attributeName`              | `attributeName`                | `svg`   |
| `attributeType`              | `attributeType`                | `svg`   |
| `azimuth`                    | `azimuth`                      | `svg`   |
| `bandwidth`                  | `bandwidth`                    | `svg`   |
| `baselineShift`              | `baseline-shift`               | `svg`   |
| `baseFrequency`              | `baseFrequency`                | `svg`   |
| `baseProfile`                | `baseProfile`                  | `svg`   |
| `bbox`                       | `bbox`                         | `svg`   |
| `begin`                      | `begin`                        | `svg`   |
| `bias`                       | `bias`                         | `svg`   |
| `by`                         | `by`                           | `svg`   |
| `calcMode`                   | `calcMode`                     | `svg`   |
| `capHeight`                  | `cap-height`                   | `svg`   |
| `className`                  | `class`                        | `html`  |
| `clip`                       | `clip`                         | `svg`   |
| `clipPath`                   | `clip-path`                    | `svg`   |
| `clipPathUnits`              | `clipPathUnits`                | `svg`   |
| `clipRule`                   | `clip-rule`                    | `svg`   |
| `color`                      | `color`                        | `html`  |
| `colorInterpolation`         | `color-interpolation`          | `svg`   |
| `colorInterpolationFilters`  | `color-interpolation-filters`  | `svg`   |
| `colorProfile`               | `color-profile`                | `svg`   |
| `colorRendering`             | `color-rendering`              | `svg`   |
| `content`                    | `content`                      | `html`  |
| `contentScriptType`          | `contentScriptType`            | `svg`   |
| `contentStyleType`           | `contentStyleType`             | `svg`   |
| `crossOrigin`                | `crossorigin`                  | `html`  |
| `cursor`                     | `cursor`                       | `svg`   |
| `cx`                         | `cx`                           | `svg`   |
| `cy`                         | `cy`                           | `svg`   |
| `d`                          | `d`                            | `svg`   |
| `dataType`                   | `datatype`                     | `svg`   |
| `defaultAction`              | `defaultAction`                | `svg`   |
| `descent`                    | `descent`                      | `svg`   |
| `diffuseConstant`            | `diffuseConstant`              | `svg`   |
| `direction`                  | `direction`                    | `svg`   |
| `display`                    | `display`                      | `svg`   |
| `dur`                        | `dur`                          | `svg`   |
| `divisor`                    | `divisor`                      | `svg`   |
| `dominantBaseline`           | `dominant-baseline`            | `svg`   |
| `download`                   | `download`                     | `html`  |
| `dx`                         | `dx`                           | `svg`   |
| `dy`                         | `dy`                           | `svg`   |
| `edgeMode`                   | `edgeMode`                     | `svg`   |
| `editable`                   | `editable`                     | `svg`   |
| `elevation`                  | `elevation`                    | `svg`   |
| `enableBackground`           | `enable-background`            | `svg`   |
| `end`                        | `end`                          | `svg`   |
| `event`                      | `event`                        | `html`  |
| `exponent`                   | `exponent`                     | `svg`   |
| `externalResourcesRequired`  | `externalResourcesRequired`    | `svg`   |
| `fill`                       | `fill`                         | `svg`   |
| `fillOpacity`                | `fill-opacity`                 | `svg`   |
| `fillRule`                   | `fill-rule`                    | `svg`   |
| `filter`                     | `filter`                       | `svg`   |
| `filterRes`                  | `filterRes`                    | `svg`   |
| `filterUnits`                | `filterUnits`                  | `svg`   |
| `floodColor`                 | `flood-color`                  | `svg`   |
| `floodOpacity`               | `flood-opacity`                | `svg`   |
| `focusable`                  | `focusable`                    | `svg`   |
| `focusHighlight`             | `focusHighlight`               | `svg`   |
| `fontFamily`                 | `font-family`                  | `svg`   |
| `fontSize`                   | `font-size`                    | `svg`   |
| `fontSizeAdjust`             | `font-size-adjust`             | `svg`   |
| `fontStretch`                | `font-stretch`                 | `svg`   |
| `fontStyle`                  | `font-style`                   | `svg`   |
| `fontVariant`                | `font-variant`                 | `svg`   |
| `fontWeight`                 | `font-weight`                  | `svg`   |
| `format`                     | `format`                       | `svg`   |
| `fr`                         | `fr`                           | `svg`   |
| `from`                       | `from`                         | `svg`   |
| `fx`                         | `fx`                           | `svg`   |
| `fy`                         | `fy`                           | `svg`   |
| `g1`                         | `g1`                           | `svg`   |
| `g2`                         | `g2`                           | `svg`   |
| `glyphName`                  | `glyph-name`                   | `svg`   |
| `glyphOrientationHorizontal` | `glyph-orientation-horizontal` | `svg`   |
| `glyphOrientationVertical`   | `glyph-orientation-vertical`   | `svg`   |
| `glyphRef`                   | `glyphRef`                     | `svg`   |
| `gradientTransform`          | `gradientTransform`            | `svg`   |
| `gradientUnits`              | `gradientUnits`                | `svg`   |
| `handler`                    | `handler`                      | `svg`   |
| `hanging`                    | `hanging`                      | `svg`   |
| `hatchContentUnits`          | `hatchContentUnits`            | `svg`   |
| `hatchUnits`                 | `hatchUnits`                   | `svg`   |
| `height`                     | `height`                       | `html`  |
| `href`                       | `href`                         | `html`  |
| `hrefLang`                   | `hreflang`                     | `html`  |
| `horizAdvX`                  | `horiz-adv-x`                  | `svg`   |
| `horizOriginX`               | `horiz-origin-x`               | `svg`   |
| `horizOriginY`               | `horiz-origin-y`               | `svg`   |
| `id`                         | `id`                           | `html`  |
| `ideographic`                | `ideographic`                  | `svg`   |
| `imageRendering`             | `image-rendering`              | `svg`   |
| `initialVisibility`          | `initialVisibility`            | `svg`   |
| `in`                         | `in`                           | `svg`   |
| `in2`                        | `in2`                          | `svg`   |
| `intercept`                  | `intercept`                    | `svg`   |
| `k`                          | `k`                            | `svg`   |
| `k1`                         | `k1`                           | `svg`   |
| `k2`                         | `k2`                           | `svg`   |
| `k3`                         | `k3`                           | `svg`   |
| `k4`                         | `k4`                           | `svg`   |
| `kernelMatrix`               | `kernelMatrix`                 | `svg`   |
| `kernelUnitLength`           | `kernelUnitLength`             | `svg`   |
| `keyPoints`                  | `keyPoints`                    | `svg`   |
| `keySplines`                 | `keySplines`                   | `svg`   |
| `keyTimes`                   | `keyTimes`                     | `svg`   |
| `kerning`                    | `kerning`                      | `svg`   |
| `lang`                       | `lang`                         | `html`  |
| `lengthAdjust`               | `lengthAdjust`                 | `svg`   |
| `letterSpacing`              | `letter-spacing`               | `svg`   |
| `lightingColor`              | `lighting-color`               | `svg`   |
| `limitingConeAngle`          | `limitingConeAngle`            | `svg`   |
| `local`                      | `local`                        | `svg`   |
| `markerEnd`                  | `marker-end`                   | `svg`   |
| `markerMid`                  | `marker-mid`                   | `svg`   |
| `markerStart`                | `marker-start`                 | `svg`   |
| `markerHeight`               | `markerHeight`                 | `svg`   |
| `markerUnits`                | `markerUnits`                  | `svg`   |
| `markerWidth`                | `markerWidth`                  | `svg`   |
| `mask`                       | `mask`                         | `svg`   |
| `maskContentUnits`           | `maskContentUnits`             | `svg`   |
| `maskUnits`                  | `maskUnits`                    | `svg`   |
| `mathematical`               | `mathematical`                 | `svg`   |
| `max`                        | `max`                          | `html`  |
| `media`                      | `media`                        | `html`  |
| `mediaCharacterEncoding`     | `mediaCharacterEncoding`       | `svg`   |
| `mediaContentEncodings`      | `mediaContentEncodings`        | `svg`   |
| `mediaSize`                  | `mediaSize`                    | `svg`   |
| `mediaTime`                  | `mediaTime`                    | `svg`   |
| `method`                     | `method`                       | `html`  |
| `min`                        | `min`                          | `html`  |
| `mode`                       | `mode`                         | `svg`   |
| `name`                       | `name`                         | `html`  |
| `navDown`                    | `nav-down`                     | `svg`   |
| `navDownLeft`                | `nav-down-left`                | `svg`   |
| `navDownRight`               | `nav-down-right`               | `svg`   |
| `navLeft`                    | `nav-left`                     | `svg`   |
| `navNext`                    | `nav-next`                     | `svg`   |
| `navPrev`                    | `nav-prev`                     | `svg`   |
| `navRight`                   | `nav-right`                    | `svg`   |
| `navUp`                      | `nav-up`                       | `svg`   |
| `navUpLeft`                  | `nav-up-left`                  | `svg`   |
| `navUpRight`                 | `nav-up-right`                 | `svg`   |
| `numOctaves`                 | `numOctaves`                   | `svg`   |
| `observer`                   | `observer`                     | `svg`   |
| `offset`                     | `offset`                       | `svg`   |
| `opacity`                    | `opacity`                      | `svg`   |
| `operator`                   | `operator`                     | `svg`   |
| `order`                      | `order`                        | `svg`   |
| `orient`                     | `orient`                       | `svg`   |
| `orientation`                | `orientation`                  | `svg`   |
| `origin`                     | `origin`                       | `svg`   |
| `overflow`                   | `overflow`                     | `svg`   |
| `overlay`                    | `overlay`                      | `svg`   |
| `overlinePosition`           | `overline-position`            | `svg`   |
| `overlineThickness`          | `overline-thickness`           | `svg`   |
| `paintOrder`                 | `paint-order`                  | `svg`   |
| `panose1`                    | `panose-1`                     | `svg`   |
| `path`                       | `path`                         | `svg`   |
| `pathLength`                 | `pathLength`                   | `svg`   |
| `patternContentUnits`        | `patternContentUnits`          | `svg`   |
| `patternTransform`           | `patternTransform`             | `svg`   |
| `patternUnits`               | `patternUnits`                 | `svg`   |
| `phase`                      | `phase`                        | `svg`   |
| `pitch`                      | `pitch`                        | `svg`   |
| `playbackOrder`              | `playbackorder`                | `svg`   |
| `pointerEvents`              | `pointer-events`               | `svg`   |
| `points`                     | `points`                       | `svg`   |
| `pointsAtX`                  | `pointsAtX`                    | `svg`   |
| `pointsAtY`                  | `pointsAtY`                    | `svg`   |
| `pointsAtZ`                  | `pointsAtZ`                    | `svg`   |
| `preserveAlpha`              | `preserveAlpha`                | `svg`   |
| `preserveAspectRatio`        | `preserveAspectRatio`          | `svg`   |
| `primitiveUnits`             | `primitiveUnits`               | `svg`   |
| `propagate`                  | `propagate`                    | `svg`   |
| `property`                   | `property`                     | `html`  |
| `r`                          | `r`                            | `svg`   |
| `radius`                     | `radius`                       | `svg`   |
| `refX`                       | `refX`                         | `svg`   |
| `refY`                       | `refY`                         | `svg`   |
| `rel`                        | `rel`                          | `html`  |
| `rev`                        | `rev`                          | `html`  |
| `renderingIntent`            | `rendering-intent`             | `svg`   |
| `repeatCount`                | `repeatCount`                  | `svg`   |
| `repeatDur`                  | `repeatDur`                    | `svg`   |
| `requiredExtensions`         | `requiredExtensions`           | `svg`   |
| `requiredFeatures`           | `requiredFeatures`             | `svg`   |
| `requiredFonts`              | `requiredFonts`                | `svg`   |
| `requiredFormats`            | `requiredFormats`              | `svg`   |
| `resource`                   | `resource`                     | `svg`   |
| `restart`                    | `restart`                      | `svg`   |
| `result`                     | `result`                       | `svg`   |
| `rotate`                     | `rotate`                       | `svg`   |
| `rx`                         | `rx`                           | `svg`   |
| `ry`                         | `ry`                           | `svg`   |
| `scale`                      | `scale`                        | `svg`   |
| `seed`                       | `seed`                         | `svg`   |
| `shapeRendering`             | `shape-rendering`              | `svg`   |
| `side`                       | `side`                         | `svg`   |
| `slope`                      | `slope`                        | `svg`   |
| `snapshotTime`               | `snapshotTime`                 | `svg`   |
| `specularConstant`           | `specularConstant`             | `svg`   |
| `specularExponent`           | `specularExponent`             | `svg`   |
| `spreadMethod`               | `spreadMethod`                 | `svg`   |
| `spacing`                    | `spacing`                      | `svg`   |
| `startOffset`                | `startOffset`                  | `svg`   |
| `stdDeviation`               | `stdDeviation`                 | `svg`   |
| `stemh`                      | `stemh`                        | `svg`   |
| `stemv`                      | `stemv`                        | `svg`   |
| `stitchTiles`                | `stitchTiles`                  | `svg`   |
| `stopColor`                  | `stop-color`                   | `svg`   |
| `stopOpacity`                | `stop-opacity`                 | `svg`   |
| `strikethroughPosition`      | `strikethrough-position`       | `svg`   |
| `strikethroughThickness`     | `strikethrough-thickness`      | `svg`   |
| `string`                     | `string`                       | `svg`   |
| `stroke`                     | `stroke`                       | `svg`   |
| `strokeDashArray`            | `stroke-dasharray`             | `svg`   |
| `strokeDashOffset`           | `stroke-dashoffset`            | `svg`   |
| `strokeLineCap`              | `stroke-linecap`               | `svg`   |
| `strokeLineJoin`             | `stroke-linejoin`              | `svg`   |
| `strokeMiterLimit`           | `stroke-miterlimit`            | `svg`   |
| `strokeOpacity`              | `stroke-opacity`               | `svg`   |
| `strokeWidth`                | `stroke-width`                 | `svg`   |
| `style`                      | `style`                        | `html`  |
| `surfaceScale`               | `surfaceScale`                 | `svg`   |
| `syncBehavior`               | `syncBehavior`                 | `svg`   |
| `syncBehaviorDefault`        | `syncBehaviorDefault`          | `svg`   |
| `syncMaster`                 | `syncMaster`                   | `svg`   |
| `syncTolerance`              | `syncTolerance`                | `svg`   |
| `syncToleranceDefault`       | `syncToleranceDefault`         | `svg`   |
| `systemLanguage`             | `systemLanguage`               | `svg`   |
| `tabIndex`                   | `tabindex`                     | `html`  |
| `tableValues`                | `tableValues`                  | `svg`   |
| `target`                     | `target`                       | `html`  |
| `targetX`                    | `targetX`                      | `svg`   |
| `targetY`                    | `targetY`                      | `svg`   |
| `textAnchor`                 | `text-anchor`                  | `svg`   |
| `textDecoration`             | `text-decoration`              | `svg`   |
| `textRendering`              | `text-rendering`               | `svg`   |
| `textLength`                 | `textLength`                   | `svg`   |
| `timelineBegin`              | `timelinebegin`                | `svg`   |
| `title`                      | `title`                        | `html`  |
| `transformBehavior`          | `transformBehavior`            | `svg`   |
| `type`                       | `type`                         | `html`  |
| `typeOf`                     | `typeof`                       | `svg`   |
| `to`                         | `to`                           | `svg`   |
| `transform`                  | `transform`                    | `svg`   |
| `u1`                         | `u1`                           | `svg`   |
| `u2`                         | `u2`                           | `svg`   |
| `underlinePosition`          | `underline-position`           | `svg`   |
| `underlineThickness`         | `underline-thickness`          | `svg`   |
| `unicode`                    | `unicode`                      | `svg`   |
| `unicodeBidi`                | `unicode-bidi`                 | `svg`   |
| `unicodeRange`               | `unicode-range`                | `svg`   |
| `unitsPerEm`                 | `units-per-em`                 | `svg`   |
| `values`                     | `values`                       | `svg`   |
| `vAlphabetic`                | `v-alphabetic`                 | `svg`   |
| `vMathematical`              | `v-mathematical`               | `svg`   |
| `vectorEffect`               | `vector-effect`                | `svg`   |
| `vHanging`                   | `v-hanging`                    | `svg`   |
| `vIdeographic`               | `v-ideographic`                | `svg`   |
| `version`                    | `version`                      | `html`  |
| `vertAdvY`                   | `vert-adv-y`                   | `svg`   |
| `vertOriginX`                | `vert-origin-x`                | `svg`   |
| `vertOriginY`                | `vert-origin-y`                | `svg`   |
| `viewBox`                    | `viewBox`                      | `svg`   |
| `viewTarget`                 | `viewTarget`                   | `svg`   |
| `visibility`                 | `visibility`                   | `svg`   |
| `width`                      | `width`                        | `html`  |
| `widths`                     | `widths`                       | `svg`   |
| `wordSpacing`                | `word-spacing`                 | `svg`   |
| `writingMode`                | `writing-mode`                 | `svg`   |
| `x`                          | `x`                            | `svg`   |
| `x1`                         | `x1`                           | `svg`   |
| `x2`                         | `x2`                           | `svg`   |
| `xChannelSelector`           | `xChannelSelector`             | `svg`   |
| `xHeight`                    | `x-height`                     | `svg`   |
| `y`                          | `y`                            | `svg`   |
| `y1`                         | `y1`                           | `svg`   |
| `y2`                         | `y2`                           | `svg`   |
| `yChannelSelector`           | `yChannelSelector`             | `svg`   |
| `z`                          | `z`                            | `svg`   |
| `zoomAndPan`                 | `zoomAndPan`                   | `svg`   |
| `abbr`                       | `abbr`                         | `html`  |
| `accept`                     | `accept`                       | `html`  |
| `acceptCharset`              | `accept-charset`               | `html`  |
| `accessKey`                  | `accesskey`                    | `html`  |
| `action`                     | `action`                       | `html`  |
| `allowFullScreen`            | `allowfullscreen`              | `html`  |
| `allowPaymentRequest`        | `allowpaymentrequest`          | `html`  |
| `allowUserMedia`             | `allowusermedia`               | `html`  |
| `alt`                        | `alt`                          | `html`  |
| `as`                         | `as`                           | `html`  |
| `async`                      | `async`                        | `html`  |
| `autoCapitalize`             | `autocapitalize`               | `html`  |
| `autoComplete`               | `autocomplete`                 | `html`  |
| `autoFocus`                  | `autofocus`                    | `html`  |
| `autoPlay`                   | `autoplay`                     | `html`  |
| `capture`                    | `capture`                      | `html`  |
| `charSet`                    | `charset`                      | `html`  |
| `checked`                    | `checked`                      | `html`  |
| `cite`                       | `cite`                         | `html`  |
| `cols`                       | `cols`                         | `html`  |
| `colSpan`                    | `colspan`                      | `html`  |
| `contentEditable`            | `contenteditable`              | `html`  |
| `controls`                   | `controls`                     | `html`  |
| `controlsList`               | `controlslist`                 | `html`  |
| `coords`                     | `coords`                       | `html`  |
| `data`                       | `data`                         | `html`  |
| `dateTime`                   | `datetime`                     | `html`  |
| `decoding`                   | `decoding`                     | `html`  |
| `default`                    | `default`                      | `html`  |
| `defer`                      | `defer`                        | `html`  |
| `dir`                        | `dir`                          | `html`  |
| `dirName`                    | `dirname`                      | `html`  |
| `disabled`                   | `disabled`                     | `html`  |
| `draggable`                  | `draggable`                    | `html`  |
| `encType`                    | `enctype`                      | `html`  |
| `form`                       | `form`                         | `html`  |
| `formAction`                 | `formaction`                   | `html`  |
| `formEncType`                | `formenctype`                  | `html`  |
| `formMethod`                 | `formmethod`                   | `html`  |
| `formNoValidate`             | `formnovalidate`               | `html`  |
| `formTarget`                 | `formtarget`                   | `html`  |
| `headers`                    | `headers`                      | `html`  |
| `hidden`                     | `hidden`                       | `html`  |
| `high`                       | `high`                         | `html`  |
| `htmlFor`                    | `for`                          | `html`  |
| `httpEquiv`                  | `http-equiv`                   | `html`  |
| `inputMode`                  | `inputmode`                    | `html`  |
| `integrity`                  | `integrity`                    | `html`  |
| `is`                         | `is`                           | `html`  |
| `isMap`                      | `ismap`                        | `html`  |
| `itemId`                     | `itemid`                       | `html`  |
| `itemProp`                   | `itemprop`                     | `html`  |
| `itemRef`                    | `itemref`                      | `html`  |
| `itemScope`                  | `itemscope`                    | `html`  |
| `itemType`                   | `itemtype`                     | `html`  |
| `kind`                       | `kind`                         | `html`  |
| `label`                      | `label`                        | `html`  |
| `language`                   | `language`                     | `html`  |
| `list`                       | `list`                         | `html`  |
| `loop`                       | `loop`                         | `html`  |
| `low`                        | `low`                          | `html`  |
| `manifest`                   | `manifest`                     | `html`  |
| `maxLength`                  | `maxlength`                    | `html`  |
| `minLength`                  | `minlength`                    | `html`  |
| `multiple`                   | `multiple`                     | `html`  |
| `muted`                      | `muted`                        | `html`  |
| `nonce`                      | `nonce`                        | `html`  |
| `noModule`                   | `nomodule`                     | `html`  |
| `noValidate`                 | `novalidate`                   | `html`  |
| `open`                       | `open`                         | `html`  |
| `optimum`                    | `optimum`                      | `html`  |
| `pattern`                    | `pattern`                      | `html`  |
| `ping`                       | `ping`                         | `html`  |
| `placeholder`                | `placeholder`                  | `html`  |
| `playsInline`                | `playsinline`                  | `html`  |
| `poster`                     | `poster`                       | `html`  |
| `preload`                    | `preload`                      | `html`  |
| `readOnly`                   | `readonly`                     | `html`  |
| `referrerPolicy`             | `referrerpolicy`               | `html`  |
| `required`                   | `required`                     | `html`  |
| `reversed`                   | `reversed`                     | `html`  |
| `rows`                       | `rows`                         | `html`  |
| `rowSpan`                    | `rowspan`                      | `html`  |
| `sandbox`                    | `sandbox`                      | `html`  |
| `scope`                      | `scope`                        | `html`  |
| `scoped`                     | `scoped`                       | `html`  |
| `seamless`                   | `seamless`                     | `html`  |
| `selected`                   | `selected`                     | `html`  |
| `shape`                      | `shape`                        | `html`  |
| `size`                       | `size`                         | `html`  |
| `sizes`                      | `sizes`                        | `html`  |
| `slot`                       | `slot`                         | `html`  |
| `span`                       | `span`                         | `html`  |
| `spellCheck`                 | `spellcheck`                   | `html`  |
| `src`                        | `src`                          | `html`  |
| `srcDoc`                     | `srcdoc`                       | `html`  |
| `srcLang`                    | `srclang`                      | `html`  |
| `srcSet`                     | `srcset`                       | `html`  |
| `start`                      | `start`                        | `html`  |
| `step`                       | `step`                         | `html`  |
| `translate`                  | `translate`                    | `html`  |
| `typeMustMatch`              | `typemustmatch`                | `html`  |
| `useMap`                     | `usemap`                       | `html`  |
| `value`                      | `value`                        | `html`  |
| `wrap`                       | `wrap`                         | `html`  |
| `align`                      | `align`                        | `html`  |
| `aLink`                      | `alink`                        | `html`  |
| `archive`                    | `archive`                      | `html`  |
| `axis`                       | `axis`                         | `html`  |
| `background`                 | `background`                   | `html`  |
| `bgColor`                    | `bgcolor`                      | `html`  |
| `border`                     | `border`                       | `html`  |
| `borderColor`                | `bordercolor`                  | `html`  |
| `bottomMargin`               | `bottommargin`                 | `html`  |
| `cellPadding`                | `cellpadding`                  | `html`  |
| `cellSpacing`                | `cellspacing`                  | `html`  |
| `ch`                         | `char`                         | `html`  |
| `chOff`                      | `charoff`                      | `html`  |
| `classID`                    | `classid`                      | `html`  |
| `clear`                      | `clear`                        | `html`  |
| `code`                       | `code`                         | `html`  |
| `codeBase`                   | `codebase`                     | `html`  |
| `codeType`                   | `codetype`                     | `html`  |
| `compact`                    | `compact`                      | `html`  |
| `declare`                    | `declare`                      | `html`  |
| `face`                       | `face`                         | `html`  |
| `frame`                      | `frame`                        | `html`  |
| `frameBorder`                | `frameborder`                  | `html`  |
| `hSpace`                     | `hspace`                       | `html`  |
| `leftMargin`                 | `leftmargin`                   | `html`  |
| `link`                       | `link`                         | `html`  |
| `longDesc`                   | `longdesc`                     | `html`  |
| `lowSrc`                     | `lowsrc`                       | `html`  |
| `marginHeight`               | `marginheight`                 | `html`  |
| `marginWidth`                | `marginwidth`                  | `html`  |
| `noResize`                   | `noresize`                     | `html`  |
| `noHref`                     | `nohref`                       | `html`  |
| `noShade`                    | `noshade`                      | `html`  |
| `noWrap`                     | `nowrap`                       | `html`  |
| `object`                     | `object`                       | `html`  |
| `profile`                    | `profile`                      | `html`  |
| `prompt`                     | `prompt`                       | `html`  |
| `rightMargin`                | `rightmargin`                  | `html`  |
| `rules`                      | `rules`                        | `html`  |
| `scheme`                     | `scheme`                       | `html`  |
| `scrolling`                  | `scrolling`                    | `html`  |
| `standby`                    | `standby`                      | `html`  |
| `summary`                    | `summary`                      | `html`  |
| `text`                       | `text`                         | `html`  |
| `topMargin`                  | `topmargin`                    | `html`  |
| `valueType`                  | `valuetype`                    | `html`  |
| `vAlign`                     | `valign`                       | `html`  |
| `vLink`                      | `vlink`                        | `html`  |
| `vSpace`                     | `vspace`                       | `html`  |
| `allowTransparency`          | `allowtransparency`            | `html`  |
| `autoCorrect`                | `autocorrect`                  | `html`  |
| `autoSave`                   | `autosave`                     | `html`  |
| `prefix`                     | `prefix`                       | `html`  |
| `results`                    | `results`                      | `html`  |
| `security`                   | `security`                     | `html`  |
| `unselectable`               | `unselectable`                 | `html`  |
| `ariaActiveDescendant`       | `aria-activedescendant`        |         |
| `ariaAtomic`                 | `aria-atomic`                  |         |
| `ariaAutoComplete`           | `aria-autocomplete`            |         |
| `ariaBusy`                   | `aria-busy`                    |         |
| `ariaChecked`                | `aria-checked`                 |         |
| `ariaColCount`               | `aria-colcount`                |         |
| `ariaColIndex`               | `aria-colindex`                |         |
| `ariaColSpan`                | `aria-colspan`                 |         |
| `ariaControls`               | `aria-controls`                |         |
| `ariaCurrent`                | `aria-current`                 |         |
| `ariaDescribedBy`            | `aria-describedby`             |         |
| `ariaDetails`                | `aria-details`                 |         |
| `ariaDisabled`               | `aria-disabled`                |         |
| `ariaDropEffect`             | `aria-dropeffect`              |         |
| `ariaErrorMessage`           | `aria-errormessage`            |         |
| `ariaExpanded`               | `aria-expanded`                |         |
| `ariaFlowTo`                 | `aria-flowto`                  |         |
| `ariaGrabbed`                | `aria-grabbed`                 |         |
| `ariaHasPopup`               | `aria-haspopup`                |         |
| `ariaHidden`                 | `aria-hidden`                  |         |
| `ariaInvalid`                | `aria-invalid`                 |         |
| `ariaKeyShortcuts`           | `aria-keyshortcuts`            |         |
| `ariaLabel`                  | `aria-label`                   |         |
| `ariaLabelledBy`             | `aria-labelledby`              |         |
| `ariaLevel`                  | `aria-level`                   |         |
| `ariaLive`                   | `aria-live`                    |         |
| `ariaModal`                  | `aria-modal`                   |         |
| `ariaMultiLine`              | `aria-multiline`               |         |
| `ariaMultiSelectable`        | `aria-multiselectable`         |         |
| `ariaOrientation`            | `aria-orientation`             |         |
| `ariaOwns`                   | `aria-owns`                    |         |
| `ariaPlaceholder`            | `aria-placeholder`             |         |
| `ariaPosInset`               | `aria-posinset`                |         |
| `ariaPressed`                | `aria-pressed`                 |         |
| `ariaReadOnly`               | `aria-readonly`                |         |
| `ariaRelevant`               | `aria-relevant`                |         |
| `ariaRequired`               | `aria-required`                |         |
| `ariaRoleDescription`        | `aria-roledescription`         |         |
| `ariaRowCount`               | `aria-rowcount`                |         |
| `ariaRowIndex`               | `aria-rowindex`                |         |
| `ariaRowSpan`                | `aria-rowspan`                 |         |
| `ariaSelected`               | `aria-selected`                |         |
| `ariaSetSize`                | `aria-setsize`                 |         |
| `ariaSort`                   | `aria-sort`                    |         |
| `ariaValueMax`               | `aria-valuemax`                |         |
| `ariaValueMin`               | `aria-valuemin`                |         |
| `ariaValueNow`               | `aria-valuenow`                |         |
| `ariaValueText`              | `aria-valuetext`               |         |
| `role`                       | `aria-`                        |         |

<!--list end-->

## Related

*   [`web-namespaces`][namespace]
    — List of web namespaces
*   [`space-separated-tokens`](https://github.com/wooorm/space-separated-tokens)
    — Parse/stringify space-separated tokens
*   [`comma-separated-tokens`](https://github.com/wooorm/comma-separated-tokens)
    — Parse/stringify comma-separated tokens
*   [`html-tag-names`](https://github.com/wooorm/html-tag-names)
    — List of HTML tags
*   [`mathml-tag-names`](https://github.com/wooorm/mathml-tag-names)
    — List of MathML tags
*   [`svg-tag-names`](https://github.com/wooorm/svg-tag-names)
    — List of SVG tags
*   [`html-void-elements`](https://github.com/wooorm/html-void-elements)
    — List of void HTML tag-names
*   [`svg-element-attributes`](https://github.com/wooorm/svg-element-attributes)
    — Map of SVG elements to allowed attributes
*   [`html-element-attributes`](https://github.com/wooorm/html-element-attributes)
    — Map of HTML elements to allowed attributes
*   [`aria-attributes`](https://github.com/wooorm/aria-attributes)
    — List of ARIA attributes

## License

[MIT][license] © [Titus Wormer][author]

Derivative work based on [React][source] licensed under
[BSD-3-Clause-Clear][source-license], © 2013-2015, Facebook, Inc.

[build-badge]: https://img.shields.io/travis/wooorm/property-information.svg?style=flat

[build-status]: https://travis-ci.org/wooorm/property-information

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/property-information.svg

[coverage-status]: https://codecov.io/github/wooorm/property-information

[npm]: https://docs.npmjs.com/cli/install

[author]: http://wooorm.com

[license]: LICENSE

[source]: https://github.com/facebook/react/blob/f445dd9/src/renderers/dom/shared/HTMLDOMPropertyConfig.js

[source-license]: https://github.com/facebook/react/blob/88cdc27/LICENSE

[data]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset

[namespace]: https://github.com/wooorm/web-namespaces

[info]: #info

[schema]: #schema

[normalize]: #propertyinformationnormalizename
