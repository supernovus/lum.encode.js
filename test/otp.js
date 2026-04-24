'use strict';

const plan = 52;

const t = require('@lumjs/tests').new({ module, plan });
const { HOTP, TOTP } = require('../lib/sets/otp.js');

/** 
 * OTP test suite adapted from the `notp` npm package.
 * 
 * Uses test values from RFC 4226 (HOTP) and RFC 6238 (TOTP).
 *
 *    The following test data uses the ASCII string
 *    "12345678901234567890" for the secret:
 *
 * Secret = 0x3132333435363738393031323334353637383930
 * 
 * @see https://datatracker.ietf.org/doc/html/rfc4226
 * @see https://datatracker.ietf.org/doc/html/rfc6238
 * @see https://www.npmjs.com/package/notp
 */
const key = '12345678901234567890';
const hotp = new HOTP({ key, window: 0 });
const totp = new TOTP({ key, window: 0 });

const hotpTests = [
  '755224', '287082', '359152', '969429', '338314',
  '254676', '287922', '162583', '399871', '520489',
];

const totpTests = [
  ['287082', 59],
  ['005924', 1234567890],
  ['081804', 1111111109],
  ['279037', 2000000000],
];

const totpOOS = 91;

/**
 * Test HOTP generate() and verify() methods.
 * 
 * Table 1 details for each count, the intermediate HMAC value.
 *
 * count    Hexadecimal HMAC-SHA-1(secret, count)
 * 0        cc93cf18508d94934c64b65d8ba7667fb7cde4b0
 * 1        75a48a19d4cbe100644e8ac1397eea747a2d33ab
 * 2        0bacb7fa082fef30782211938bc1c5e70416ff44
 * 3        66c28227d03a2d5529262ff016a1e6ef76557ece
 * 4        a904c900a64b35909874b33e61c5938a8e15ed1c
 * 5        a37e783d7b7233c083d4f62926c7a25f238d0316
 * 6        bc9cd28561042c83f219324d3c607256c03272ae
 * 7        a4fb960c0bc06e1eabb804e5b397cdc4b45596fa
 * 8        1b3c89f65e6c9e883012052823443f048b4332db
 * 9        1637409809a679dc698207310c8c7fc07290d9e5
 *
 * Table 2 details for each count the truncated values (both in
 * hexadecimal and decimal) and then the HOTP value.
 *
 *                   Truncated
 * count    Hexadecimal    Decimal        HOTP
 * 0        4c93cf18       1284755224     755224
 * 1        41397eea       1094287082     287082
 * 2         82fef30        137359152     359152
 * 3        66ef7655       1726969429     969429
 * 4        61c5938a       1640338314     338314
 * 5        33c083d4        868254676     254676
 * 6        7256c032       1918287922     287922
 * 7         4e5b397         82162583     162583
 * 8        2823443f        673399871     399871
 * 9        2679dc69        645520489     520489
 *
 * Also testing various out-of-sync counter values.
 */
t.async(async function () {
  let res = await hotp.verify('WILL NOT PASS');
  t.is(res.ok, false, 'HOTP rejects fake token');

  for (let i = 0; i < hotpTests.length; i++) {
    let num = i + 1;
    hotp.setOptions({ counter: i });

    res = await hotp.generate();
    t.is(res.code, hotpTests[i], 'HOTP generate() '+num);

    res = await hotp.verify(hotpTests[i]);
    t.is(res.ok, true, `HOTP verify() ${num} was valid`);
    t.is(res.delta, 0, `HOTP verify() ${num} in sync`);
  }

  // Out-of-sync tests.
  let label = 'HOTP out-of-sync';
  let token = hotpTests[9];
  hotp.setOptions({counter: 1, window: 7});

  res = await hotp.verify(token);
  t.is(res.ok, false, label+' window < 8 fails validation');

  hotp.setOptions({window: 8});
  res = await hotp.verify(token);
  t.is(res.ok, true, label+' window >= 8 passes validation');
  t.is(res.delta, 8, label+' positive offset delta');

  // Out-of-sync negative counter value.
  token = hotpTests[0];
  hotp.setOptions({counter: 7});
  res = await hotp.verify(token);
  t.is(res.ok, true, label+' negative counter validated');
  t.is(res.delta, -7, label+' negative offset delta');
});

/**
 * Test TOTP generate() and verify() methods.
 */
t.async(async function () {
  let res = await totp.verify('WILL NOT PASS');
  t.is(res.ok, false, 'TOTP rejects fake token');

  for (let i = 0; i < totpTests.length; i++) {
    let num = i + 1;
    let [token, ts] = totpTests[i];
    totp.setOptions({ time: ts * 1000 });

    res = await totp.generate();
    t.is(res.code, token, 'TOTP generate() '+num);

    res = await totp.verify(token);
    t.is(res.ok, true, `TOTP verify() ${num} was valid`);
    t.is(res.delta, 0, `TOTP verify() ${num} in sync`);

    num++;
  }

  // Out-of-sync tests.
  let label = 'TOTP out-of-sync';
  let [token, ts] = totpTests[3];
  totp.setOptions({ time: (ts-totpOOS)*1000, window: 2 });

  res = await totp.verify(token);
  t.is(res.ok, false, label+' window < 3 fails validation');

  totp.setOptions({window: 3});
  res = await totp.verify(token);
  t.is(res.ok, true, label+ ' window >= 3 passes validation');
  t.is(res.delta, 3, label+ ' offset delta');
});

t.done();
