// Test for Hash functions.

const plan = 5;

const t = require('@lumjs/tests').new({module, plan});
const lib = require('../lib/hash');

const s0 = "Test"

const s1 = "hello world";
const s1_b64 = "uU0nuZNNPgilLlLX2n2r+sSE7+N6U4DukIj3rOLvzek=";
const s1_hex = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9";

const s0_s1_b64 = "xl98L9J0O1iafwFc5tQ2Vq5ED3ewLK/itHBk+/QEv08=";
const s0_s1_s64 = "xl98L9J0O1iafwFc5tQ2Vq5ED3ewLK_itHBk-_QEv08";
const s0_s1_b91 = "j~o>.5p$uPq~GtA[U$10bw%nCfg&}25nF=wVds)B";

const h1 = new lib();

const addS0S1 = function()
{
  h1.add(s0);
  h1.add(s1);
}

t.is(h1.base64(s1), s1_b64, 'base64(string)');
t.is(h1.hex(s1), s1_hex, 'hex(string)');

addS0S1();
t.is(h1.base64(), s0_s1_b64, 'add() with base64()');

addS0S1();
t.is(h1.safe64(), s0_s1_s64, 'add() with safe64()');

addS0S1();
t.is(h1.base91(), s0_s1_b91, 'add() with base91()');

t.done();
