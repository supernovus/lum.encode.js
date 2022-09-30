// Test for Base64 functions.

const plan = 2;

const t = require('@lumjs/tests').new({module, plan});
const lib = require('../lib/base64');

const s1 = 'Hello World';
const b1 = 'SGVsbG8gV29ybGQ=';

t.is(lib.encode(s1), b1, 'encode(text)');
t.is(lib.decode(b1), s1, 'decode(text)');

t.done();
