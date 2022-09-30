// Test 'util' module. 

const plan = 16;

const t = require('@lumjs/tests').new({module, plan});
const {ord, numByteArray: nba} = require('../lib/util');

const NBA = params => `numByteArray(${params})`;

t.is(ord('K'), 75, 'ord(singleChar)');
t.is(ord("\uD800\uDC00"), 65536, 'ord(unicodePair)');

const s1 = '0FD4';   // base16
const s2 = '0FD040'; // " "
const s3 = '100021'; // base8
const s4 = '0e1b';   // base20

t.isJSON(nba(s1), [15,212], NBA(':defaults'));
t.isJSON(nba(s1.toLowerCase()), [15,212], NBA(':caseTest'));
t.isJSON(nba(s1, 1), [0,15,13,4], NBA(':size(1)'));
t.isJSON(nba(s2, 3), [253,64], NBA(':size(3)'));

t.isJSON(nba(s3, {base: 8, size: 3}), [64, 17], NBA(':base(8)'));
t.isJSON(nba(s4, {base: 20}), [14, 31], NBA(':base(20)'));

t.isJSON(nba(s1, 3), [253, 4], NBA(':remainder[1]'));
t.isJSON(nba(s1, {size: 3, pad: true}), [0, 4052], NBA(':pad[1]'));
t.isJSON(nba(s2, 4), [4048, 64], NBA(':remainder[2]'));
t.isJSON(nba(s2, {size: 4, pad: true}), [15, 53312], NBA(':pad[2]'));

t.diesWith(() => nba(s1, {size: 3, strict: true}), RangeError, NBA(':strict'));
t.diesWith(() => nba(s1, 0), RangeError, NBA(':sizeBelowMin'));
t.diesWith(() => nba(s1, {base: 1}), RangeError, NBA(':baseBelowMin'));
t.diesWith(() => nba(s1, {base: 37}), RangeError, NBA(':baseAboveMax'));

// TODO: test `wordToByteArray()`

t.done();
