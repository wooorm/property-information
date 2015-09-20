# property-information [![Build Status](https://img.shields.io/travis/wooorm/property-information.svg?style=flat)](https://travis-ci.org/wooorm/property-information) [![Coverage Status](https://img.shields.io/coveralls/wooorm/property-information.svg?style=flat)](https://coveralls.io/r/wooorm/property-information?branch=master)

Information for HTML properties.

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
npm install property-information
```

**property-information** is also available for
[bower](http://bower.io/#install-packages), [duo](http://duojs.org/#getting-started),
and for AMD, CommonJS, and globals ([uncompressed](property-information.js) and
[compressed](property-information.min.js)).

## Usage

```js
console.log(propertyInformation('itemScope'));
```

Yields:

```json
{
  "name": "class",
  "propertyName": "className",
  "mustUseAttribute": true,
  "mustUseProperty": false,
  "boolean": false,
  "overloadedBoolean": false,
  "numeric": false,
  "positiveNumeric": false
}
```

## API

### propertyInformation(name)

Get information for a DOM property.

Parameters:

*   `name` (`string`) — Case-insensitive name.

Returns: [`Information?`](#information) — Information, when available.

### propertyInformation.all

`Object` mapping case-insensitive names to [Information](#information)
objects. This gives raw access to the information returned by
[`propertyInformation()`](#propertyinformationname): do not change the
objects.

### Information

Properties:

*   `name` (`string`) — Case-insensitive name;

*   `propertyName` (`string`)
    — Case-sensitive IDL attribute (e.g., a `class` attribute is added in HTML
    and a `className` is added in Web IDL);

*   `mustUseAttribute` (`boolean`)
    — Whether `setAttribute` must be used when patching a DOM node;

*   `mustUseProperty` (`boolean`)
    — Whether `node[propertyName]` must be used when patching a DOM node;

*   `boolean` (`boolean`)
    — Whether the value of the property is `boolean`;

*   `overloadedBoolean` (`boolean`)
    — Whether the value of the property can be `boolean`;

*   `numeric` (`boolean`)
    — Whether the value of the property is `number`;

*   `positiveNumeric` (`boolean`)
    — Whether the value of the property is `number` and positive;

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)

Derivative work based on [React](https://github.com/facebook/react/blob/f445dd9/src/renderers/dom/shared/HTMLDOMPropertyConfig.js)
licensed under [BSD-3-Clause-Clear](https://github.com/facebook/react/blob/88cdc27/LICENSE),
© 2013-2015, Facebook, Inc.
