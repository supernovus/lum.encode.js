// Test for Safe64 with Data.

const plan = 6;

const t = require('@lumjs/tests').new({module, plan});
const lib = require('../lib/safe64');
const UBJ = lib.FORMAT.UBJSON;
const PHP = lib.FORMAT.PHP;

const o1 = {"hello":["world","darkness my old friend"]};
const o1_json = "SV03F1T1eyJoZWxsbyI6WyJ3b3JsZCIsImRhcmtuZXNzIG15IG9sZCBmcmllbmQiXX0";
const o1_ubj = "SV03F3T1e2kFaGVsbG9bU2kFd29ybGRTaRZkYXJrbmVzcyBteSBvbGQgZnJpZW5kXX0";
const o1_php = "SV03F2YToxOntzOjU6ImhlbGxvIjthOjI6e2k6MDtzOjU6IndvcmxkIjtpOjE7czoyMjoiZGFya25lc3MgbXkgb2xkIGZyaWVuZCI7fX0";

t.is(lib.encodeData(o1), o1_json, 'encodeData(obj)');
t.is(lib.encodeData(o1, {format: UBJ}), o1_ubj, 'encodeData(:format<UBJSON>)');
t.is(lib.encodeData(o1, {format: PHP}), o1_php, 'encodeData(:format<PHP>)');

t.isJSON(lib.decodeData(o1_json), o1, 'decode(s64json)');
t.isJSON(lib.decodeData(o1_ubj), o1, 'decode(s64ubjson)');
t.isJSON(lib.decodeData(o1_php), o1, 'decode(s64php)');

t.done();
