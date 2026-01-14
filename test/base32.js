// Test for Base64 functions.

const plan = 25;

const t = require('@lumjs/tests').new({module, plan});
const lib = require('../lib/base32');
const cp = Object.assign;

// First set of tests is against the default variant. The strings were chosen
// to test basic compatibility with the node-specific thirty-two library.
// https://github.com/chrisumbel/thirty-two/blob/master/spec/thirty-two_spec.js

const rfc_enc_tests = [
  ['a',                    'ME======'],
  ['be',                   'MJSQ===='],
  ['bee',                  'MJSWK==='],
  ['beer',                 'MJSWK4Q='],
  ['beers',                'MJSWK4TT'],
  ['beers 1',              'MJSWK4TTEAYQ===='],
  ['shockingly dismissed', 'ONUG6Y3LNFXGO3DZEBSGS43NNFZXGZLE'],
];

const rfc_dec_tests = rfc_enc_tests.map(test => test.slice().reverse());
rfc_dec_tests.push(rfc_dec_tests[5].slice().map(str => str.toLowerCase()));

// The rest of the tests are for the other Base32 variants.
// As I didn't look for other implementations using those variants,
// I made up the test strings, so that's why they're boring.

const more_enc_tests = [
  ['be', lib.TYPES.zbase32, 'cj1o====', "encode('be', lib.TYPES.zbase32)"],
  ['be', 'CROCKFORD', 'C9JG====', "encode('be', 'CROCKFORD')"],
  ['be', {type: 'geohash', pad: false}, 'd9kh', 
    "encode('be', {type: 'geohash', pad: false})"],
];

function decType(opt) {
  if (typeof opt === 'string' || Array.isArray(opt)) {
    opt = {type: opt, string: true};
  }
  else {
    opt = cp({string: true}, opt);
  }
  return opt;
}

const more_dec_tests = more_enc_tests.map(test => [
  test[2], 
  decType(test[1]), 
  test[0], 
  test[3]
    .replace('encode', 'decode')
    .replace('pad: false', 'string: true')
    .replace(test[0], test[2])
]);

for (let [ss,es] of rfc_enc_tests) {
  t.is(lib.encode(ss), es, `encode('${ss}')`);
}

for (let [es,ds] of rfc_dec_tests) {
  t.is(lib.decode(es, true), ds, `decode('${es}',true)`);
}

let benop = rfc_enc_tests[1][1].replaceAll('=', '');
t.is(lib.encode('be', false), benop, `encode('be', false)`);
t.is(lib.decode(benop, true), 'be', `decode('${benop}', true)`);

for (let [ss,opt,es,desc] of more_enc_tests) {
  t.is(lib.encode(ss, opt), es, desc);
}

for (let [es,opt,ds,desc] of more_dec_tests) {
  t.is(lib.decode(es, opt), ds, desc);
}

const crockford_says = 'crockford says';
const crockford_dec_tests = [
  ['cds6yrvbcsqq4sl0edgqjwr', crockford_says, 'crockford lowercase letter l'],
  ['CDS6YRVBCSQQ4SIOEDGQJWR', crockford_says, 'crockford letters I and O'],
];
const crockford_opts = {type: 'crockford', string: true};

for (let [es,ds,desc] of crockford_dec_tests) {
  t.is(lib.decode(es, crockford_opts), ds, desc);
}

// TODO: test binary data

t.done();
