/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module property-information
 * @fileoverview Test suite for `property-information`.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var test = require('tape');
var propertyInformation = require('./');

/*
 * Tests.
 */

test('propertyInformation(name)', function (t) {
    t.plan(7);

    t.deepEqual(propertyInformation('foo'), undefined);

    t.deepEqual(propertyInformation('class'), {
        'name': 'class',
        'propertyName': 'className',
        'mustUseAttribute': true,
        'mustUseProperty': false,
        'boolean': false,
        'overloadedBoolean': false,
        'numeric': false,
        'positiveNumeric': false,
        'commaSeparated': false,
        'spaceSeparated': true
    });

    t.deepEqual(propertyInformation('srcSet'), {
        'name': 'srcset',
        'propertyName': 'srcSet',
        'mustUseAttribute': true,
        'mustUseProperty': false,
        'boolean': false,
        'overloadedBoolean': false,
        'numeric': false,
        'positiveNumeric': false,
        'commaSeparated': true,
        'spaceSeparated': false
    });

    t.deepEqual(propertyInformation('download'), {
        'name': 'download',
        'propertyName': 'download',
        'mustUseAttribute': false,
        'mustUseProperty': false,
        'boolean': false,
        'overloadedBoolean': true,
        'numeric': false,
        'positiveNumeric': false,
        'commaSeparated': false,
        'spaceSeparated': false
    });

    t.deepEqual(propertyInformation('itemScope'), {
        'name': 'itemscope',
        'propertyName': 'itemScope',
        'mustUseAttribute': true,
        'mustUseProperty': false,
        'boolean': true,
        'overloadedBoolean': false,
        'numeric': false,
        'positiveNumeric': false,
        'commaSeparated': false,
        'spaceSeparated': false
    });

    t.deepEqual(propertyInformation('span'), {
        'name': 'span',
        'propertyName': 'span',
        'mustUseAttribute': false,
        'mustUseProperty': false,
        'boolean': false,
        'overloadedBoolean': false,
        'numeric': true,
        'positiveNumeric': true,
        'commaSeparated': false,
        'spaceSeparated': false
    });

    t.deepEqual(propertyInformation('value'), {
        'name': 'value',
        'propertyName': 'value',
        'mustUseAttribute': false,
        'mustUseProperty': true,
        'boolean': false,
        'overloadedBoolean': false,
        'numeric': false,
        'positiveNumeric': false,
        'commaSeparated': false,
        'spaceSeparated': false
    });
});

test('Should accept attributes', function (t) {
    t.plan(3);

    t.equal(
        propertyInformation('className'),
        propertyInformation('class')
    );

    t.equal(
        propertyInformation('xmlLang'),
        propertyInformation('xml:lang')
    );

    t.equal(
        propertyInformation('httpEquiv'),
        propertyInformation('http-equiv')
    );
});
