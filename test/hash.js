// Test for Hash functions.

const plan = 7;

const t = require('@lumjs/tests').new({module, plan});
const lib = require('../lib/hash');

const s0 = "Test"

const s1 = "hello world";
const s1_b64 = "uU0nuZNNPgilLlLX2n2r+sSE7+N6U4DukIj3rOLvzek=";
const s1_hex = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9";

const s0_s1_b64 = "xl98L9J0O1iafwFc5tQ2Vq5ED3ewLK/itHBk+/QEv08=";
const s0_s1_s64 = "xl98L9J0O1iafwFc5tQ2Vq5ED3ewLK_itHBk-_QEv08";
const s0_s1_b91 = "j~o>.5p$uPq~GtA[U$10bw%nCfg&}25nF=wVds)B";
const s0_s1_hex = "c65f7c2fd2743b589a7f015ce6d43656ae440f77b02cafe2b47064fbf404bf4f";

const s1_s0_b64 = "f0VsxcA+Zg7HW1gRzr1jg1CvYDNWXrr7+194PpojByM=";

const h1 = new lib();

const addS0S1 = function()
{
  h1.add(s0);
  h1.add(s1);
}

const addS1S0 = function()
{
  h1.add(s1);
  h1.add(s0);
}

async function runTests()
{
  let val = await h1.hex(s1);
  t.is(val, s1_hex, 'hex(string)');

  val = await h1.base64(s1);
  t.is(val, s1_b64, 'base64(string)');

  addS0S1();
  val = await h1.hex();
  t.is(val, s0_s1_hex, 'add() with hex()');
  
  addS0S1();
  val = await h1.base64();
  t.is(val, s0_s1_b64, 'add() with base64()');
  
  addS0S1();
  val = await h1.base64(null, {url: true});
  t.is(val, s0_s1_s64, 'add() with URL-safe Base64()');
  
  addS0S1();
  val = await h1.base91();
  t.is(val, s0_s1_b91, 'add() with base91()');

  addS1S0();
  val = await h1.base64();
  t.is(val, s1_s0_b64, 'add() reversed order');
}

t.async(runTests);
t.done();
