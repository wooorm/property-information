# property-information [![Build Status][build-badge]][build-status] [![Coverage Status][coverage-badge]][coverage-status]

Information for properties and attributes on the web-platform (HTML, SVG, ARIA,
XML, XMLNS, XLink).

## Installation

[npm][]:

```bash
npm install property-information
```

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
