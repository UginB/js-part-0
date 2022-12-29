// Test utils

const testBlock = (name: string) => {
    console.groupEnd();
    console.group(`# ${name}\n`);
};

const areEqual = (a: any, b: any) => {
    if (a instanceof Array && b instanceof Array) {
        return JSON.stringify(a) === JSON.stringify(b);
    }
    return a === b;
};

const test = (whatWeTest: string, actualResult: any, expectedResult: any) => {
    if (areEqual(actualResult, expectedResult)) {
        console.log(`[OK] ${whatWeTest}\n`);
    } else {
        console.error(`[FAIL] ${whatWeTest}`);
        console.debug('Expected:');
        console.debug(expectedResult);
        console.debug('Actual:');
        console.debug(actualResult);
        console.log('');
    }
};

// Functions

const getType = (value: any) => {
    return typeof value;
};

const getTypesOfItems = (arr: any) => {
    return arr.map((item: any) => getType(item));
};

const allItemsHaveTheSameType = (arr: Array<any>) => {
    return arr.every((item) => getType(item) === getType(arr[0]));
};

const getRealType = (value: any) => {
    switch (getType(value)) {
        case 'string':
            return 'string';
        case 'boolean':
            return 'boolean';
        case 'bigint':
            return 'bigint';
        case 'symbol':
            return 'symbol';
        case 'undefined':
            return 'undefined';
        case 'number':
            if (isNaN(value)) {
                return 'NaN';
            } else if (value === Infinity) {
                return 'Infinity';
            }
            return 'number';
        case 'function':
            return 'function';
        case 'object':
            if (value === null) {
                return 'null';
            } else if (value instanceof Date) {
                return 'date';
            } else if (value instanceof RegExp) {
                return 'regexp';
            } else if (value instanceof Set) {
                return 'set';
            } else if (value instanceof Map) {
                return 'map';
            } else if (value instanceof Array) {
                return 'array';
            } else if (value instanceof Object) {
                return 'object';
            }
        default:
            return 'unknown';
    }
};

const getRealTypesOfItems = (arr: Array<any>) => {
    return arr.map((item) => getRealType(item));
};

const everyItemHasAUniqueRealType = (arr: Array<any>) => {
    if (arr.length === new Set(getRealTypesOfItems(arr)).size) {
        return true;
    }
    return false;
};

const countRealTypes = (arr: Array<any>) => {
    const resObj: {[index: string]:any} = {};
    for (let i = 0; i < arr.length; i++) {
        const item = getRealType(arr[i]);
        if (resObj[item]) {
            resObj[item] += 1;
        } else {
            resObj[item] = 1;
        }
    }
    return Object.entries(resObj).sort((a, b) => {
        if (a[0] < b[0]) {
            return -1;
        }
        if (a[0] > b[0]) {
            return 1;
        }
        return 0;
    });
};

// Tests

testBlock('getType');

test('Boolean', getType(true), 'boolean');
test('Number', getType(123), 'number');
test('String', getType('whoo'), 'string');
test('Array', getType([]), 'object');
test('Object', getType({}), 'object');
test(
    'Function',
    getType(() => {}),
    'function'
);
test('Undefined', getType(undefined), 'undefined');
test('Null', getType(null), 'object');

testBlock('allItemsHaveTheSameType');

test('All values are numbers', allItemsHaveTheSameType([11, 12, 13]), true);

test('All values are strings', allItemsHaveTheSameType(['11', '12', '13']), true);

test('All values are strings but wait', allItemsHaveTheSameType(['11', new String('12'), '13']), false);

test('Values like a number', allItemsHaveTheSameType([123, 123 / 'a', 1 / 0]), true);

test('Values like an object', allItemsHaveTheSameType([{}]), true);

testBlock('getTypesOfItems VS getRealTypesOfItems');

const knownTypes = [
    null,
    'string',
    true,
    10n,
    Symbol('id'),
    undefined,
    NaN,
    Infinity,
    1,
    new Date(),
    () => {},
    /\w+/,
    new Set(),
    new Map(),
    [],
    {},
];

test('Check basic types', getTypesOfItems(knownTypes), [
    'object',
    'string',
    'boolean',
    'bigint',
    'symbol',
    'undefined',
    'number',
    'number',
    'number',
    'object',
    'function',
    'object',
    'object',
    'object',
    'object',
    'object',
]);

test('Check real types', getRealTypesOfItems(knownTypes), [
    'null',
    'string',
    'boolean',
    'bigint',
    'symbol',
    'undefined',
    'NaN',
    'Infinity',
    'number',
    'date',
    'function',
    'regexp',
    'set',
    'map',
    'array',
    'object',
]);

testBlock('everyItemHasAUniqueRealType');

test('All value types in the array are unique', everyItemHasAUniqueRealType([true, 123, '123']), true);

test('Two values have the same type', everyItemHasAUniqueRealType([true, 123, '123' === 123]), false);

test('There are no repeated types in knownTypes', everyItemHasAUniqueRealType(knownTypes), true);

testBlock('countRealTypes');

test('Count unique types of array items', countRealTypes([true, null, !null, !!null, {}]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

test('Count unique types of array items', countRealTypes([() => {}, null, new Date(), 3123n, '', '', 342343]), [
    ['bigint', 1],
    ['date', 1],
    ['function', 1],
    ['null', 1],
    ['number', 1],
    ['string', 2],
]);

test('Counted unique types are sorted', countRealTypes([{}, null, true, !null, !!null]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

test('Counted unique types are sorted', countRealTypes(['', null, new Map(), new Set(), undefined]), [
    ['map', 1],
    ['null', 1],
    ['set', 1],
    ['string', 1],
    ['undefined', 1],
]);