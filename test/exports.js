// Test the fundamental exports.

const plan = 7;

const core = require('@lumjs/core');
const {O,F} = core.types;
const t = require('@lumjs/tests').new({module, plan});
const lib = require('../lib/index');

t.isa(lib.ord, F, 'ord()');
t.isa(lib.numByteArray, F, 'numByteArray()');
t.isa(lib.Base64, O, 'Base64');
t.isa(lib.Base91, O, 'Base91');
t.isa(lib.Safe64, F, 'Safe64');
t.isa(lib.Hash, F, 'Hash');
t.isa(lib.Crypto, O, 'Crypto');

t.done();
