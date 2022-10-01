// Test for "raw" Safe64.

const plan = 10;

const t = require('@lumjs/tests').new({module, plan});
const lib = require('../lib/safe64');

const s1 = 'hello? <>=';
const e1 = 'aGVsbG8_IDw-PQ';
const e1t = e1 + '~~';
const v3 = 'SV03';
const f0 = 'F0';
const t0 = 'T0';
const e1h = v3 + e1;
const e1hf = v3 + f0 + e1;
const e1hft = v3 + f0 + t0 + e1;  

t.is(lib.encode(s1), e1, 'encode(text)');
t.is(lib.decode(e1), s1, 'decode(safe64str)');
t.is(lib.encode(s1, {useTildes: true}), e1t, 'encode(text, :useTildes)');
t.is(lib.encode(s1, true), e1t, 'encode(text, true)');
t.is(lib.decode(e1t), s1, 'decode(safe64str~~)');

const eo = {addHeader: true};
t.is(lib.encode(s1, eo), e1h, 'encode(text, :addHeader)');
eo.fullHeader = true;
t.is(lib.encode(s1, eo), e1hft, 'encode(text, :fullHeader)');

t.is(lib.decode(e1h), s1, 'decode(v3shortStr)');
t.is(lib.decode(e1hft), s1, 'decode(v3fullStr)');
t.is(lib.decode(e1hf), s1, 'decode(v3partStr)');

t.done();
