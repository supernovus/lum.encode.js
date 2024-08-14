// Test for Base64 functions.

const plan = 6;

const t = require('@lumjs/tests').new({module, plan});
const lib = require('../lib/base64');

const s1 = 'Hello World';
const b1 = 'SGVsbG8gV29ybGQ=';

const o2 = true;
const s2 = 'hello? <>=';
const e2 = 'aGVsbG8_IDw-PQ';

const o2t = {url: true, useTildes: true};
const e2t = e2 + '~~';

// Regular Base64
t.is(lib.encode(s1), b1, 'encode(text)');
t.is(lib.decode(b1), s1, 'decode(text)');

// URL-safe Base64
t.is(lib.encode(s2, o2),  e2,  'encode(text, true)');
t.is(lib.decode(e2),      s2,  'decode(urlBase64)');
t.is(lib.encode(s2, o2t), e2t, 'encode(text, :useTildes)');
t.is(lib.decode(e2t),     s2,  'decode(urlTildes)');

// TODO: the encodeData() and decodeData() functions.

t.done();
