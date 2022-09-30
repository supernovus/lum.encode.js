// Test for Base91 functions.

const plan = 4;

const t = require('@lumjs/tests').new({module, plan});
const lib = require('../lib/base91');

const s1 = 'Hello World!';
const b1 = '>OwJh>Io0Tv!8PE';
const a1 = [1352,27749,108,28524,467055,1824,28503,111,11378,91244,356,33];

t.is(lib.encode(s1), b1, 'encode(text)');
t.isJSON(lib.decode(b1), a1, 'decode(text)');
t.is(lib.decode(b1, true), s1, 'decode(text, true)');
t.is(lib.decode(b1, {string: true}), s1, 'decode(text, :string)');

t.done();
