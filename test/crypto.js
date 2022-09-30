// Test the CryptoJS helper functions.

const plan = 50;

const core = require('@lumjs/core');
const {O,F} = core.types;
const t = require('@lumjs/tests').new({module, plan});
const lib = require('../lib/crypto');

function isProgressive(what, desc)
{
  t.isa(what, O, desc+':type');
  t.isa(what.update, F, desc+':has(update)');
  t.isa(what.finalize, F, desc+':has(finalize)');
}

t.isa(lib.core, O, 'crypto.core');
t.isa(lib.WordArray, O, 'crypto.WordArray');

const load = lib.load;
t.isa(load, F, 'crypto.load');

const MD5 = load('md5');
t.isa(MD5, F, 'load(hashFunc)');
t.is(load.hash('md-5'), MD5, '@hash(func)');
t.is(lib.hash.md5, MD5, '#hash.func');
t.isa(lib.hash['sha-3'], F, '#hash[func]');

isProgressive(load.hash('md5', true), '@hash(algo, true)');
isProgressive(load.hash('sha3', {outputLength: 256}), '@hash(algo, options)');
isProgressive(lib.HASH.MD5(), '#HASH.algo()');

t.isa(load.hmac('RIPEmd160'), F, '@hmac(algo)');
t.isa(lib.hmac.SHA256, F, '#hmac.algo');
isProgressive(load.hmac('RipeMD-160', 'foo bar'), '@hmac(algo, text)');
isProgressive(lib.HMAC.sha256('secret passphrase'), '#HMAC.algo(text)');

const AES = load('Aes');
t.isa(AES, O, 'load(cipherLib)');
t.is(load.cipher('Aes'), AES, '@cipher(lib)');
t.isa(load.cipher('RC4-Drop'), O, '@cipher(libRuleFunc)');
t.isa(lib.cipher.rabbit, O, '#cipher.lib');
t.is(lib.cipher['aes'], AES, '#cipher[lib]');

t.isa(load.algo('rc4'), O, '@algo(cipher)');
t.isa(load.algo('TripleDes'), O, '@algo(cipherRuleName)');
t.isa(load.algo('Rabbit-Legacy'), O, '@algo(cipherRuleFunc)');
t.isa(load.algo('SHA256'), O, '@algo(hash)');
t.isa(lib.algo.RC4drop, O, '#algo.lib');
t.isa(lib.algo['sha-256'], O, '#algo[lib]');

const Base64 = load('enc-base64', false);
t.isa(Base64, O, 'load(encoderLib)');
t.is(load.enc('Base64'), Base64, '@enc(lib)');
t.isa(load.enc('Utf-16-LE'), O, '@enc(libRuleFunc)');
t.is(lib.enc.base64, Base64, '#enc.lib');
t.isa(lib.enc['UTF-8'], O, '#enc[lib]');

t.isa(load.pad('No-Padding'), O, '@pad(lib)');
t.isa(load.pad('PKCS-7'), O, '@pad(intLib)');
t.isa(load.pad('Ansi-X-923'), O, '@pad(libRuleFunc)');
t.isa(lib.pad.pkcs7, O, '#pad.lib')

t.isa(load.mode('Cfb'), O, '@mode(lib)');
t.isa(load.mode('CTR-gladman'), O, '@mode(libRuleFunc)');
t.isa(load.mode('CBC'), O, '@mode(intLibRule)');
t.isa(lib.mode['cbc'], O, '#mode[lib]');

t.isa(load.format('hex'), O, '@format(lib)');
t.isa(lib.format.OpenSSL, O, '#format.lib');

t.done();
