// Test 'util.parsePEM' function. 
'use strict';

const plan = 19;
const t = require('@lumjs/tests').new({module, plan});
const PEM = require('../lib/pem');
const LC = require('@lumjs/core/console');

// First set of tests is for valid data.

let pemTests = [
  {
    value: 'Hello, world!',
    label: 'PRIVATE KEY',
    base64: 'SGVsbG8sIHdvcmxkIQ==',
    text: `-----BEGIN PRIVATE KEY-----
SGVsbG8sIHdvcmxkIQ==
-----END PRIVATE KEY-----`,
  },
  {
    value: "Hello darkness, my old friend;\nI've come to talk with you again.",
    label: 'PUBLIC KEY',
    base64: `SGVsbG8gZGFya25lc3MsIG15IG9sZC
BmcmllbmQ7CkkndmUgY29tZSB0byB0
YWxrIHdpdGggeW91IGFnYWluLg==`,
    text: `-----BEGIN PUBLIC KEY-----
SGVsbG8gZGFya25lc3MsIG15IG9sZC
BmcmllbmQ7CkkndmUgY29tZSB0byB0
YWxrIHdpdGggeW91IGFnYWluLg==
-----END PUBLIC KEY-----`,
  },
];

let tid = 1;
for (let pt of pemTests) {
  let pem = PEM.parse(pt.text);
  t.ok((pem instanceof PEM),    'PEM instance '+tid);
  t.is(pem?.label,   pt.label,  'PEM type label '+tid);
  t.is(pem?.base64,  pt.base64, 'PEM base64 value '+tid);
  t.is(pem?.decode(), pt.value,  'PEM decoded data '+tid);
  tid++;
}

t.lives(() => new PEM(pemTests[0].text), 'new PEM(pemString)');

// Next is for strings that aren't valid PEM documents.

pemTests = [
  {
    name: 'missing PEM header/footer',
    text: 'SGVsbG8sIHdvcmxkIQ==',
  },
  {
    name: 'invalid PEM header 1',
    text: `----BEGIN KEY----
SGVsbG8sIHdvcmxkIQ==
-----END KEY-----`
  },
  {
    name: 'invalid PEM header 2',
    text: `-----START KEY-----
SGVsbG8sIHdvcmxkIQ==
-----END KEY-----`
  },
  {
    name: 'invalid PEM footer',
    text: `-----BEGIN KEY-----
SGVsbG8sIHdvcmxkIQ==
-----DONE KEY-----`
  },
  {
    name: 'mismatched PEM labels',
    text: `-----BEGIN PRIVATE KEY-----
SGVsbG8sIHdvcmxkIQ==
-----END PUBLIC KEY-----`
  }
]

for (let pt of pemTests) {
  let pem = PEM.parse(pt.text);
  t.is(pem, null, pt.name);
}

LC.muted(() => {
  t.dies(() => new PEM(pemTests[0].text), 'new PEM(invalid) throws');
});

// Lastly tests with invalid base64 data.
// These tests depend on a strict atob() function.
// Many browsers let atob() fail silently, but node is strict.

pemTests = [
  {
    label: 'PRIVATE KEY',
    text: `-----BEGIN PRIVATE KEY-----
SGVsbG8sIHdvcmxkIQ=
-----END PRIVATE KEY-----`
  },
  {
    label: 'PRIVATE KEY',
    text: `-----BEGIN PRIVATE KEY-----
SGsbG8sIHdvcmxkIQ==
-----END PRIVATE KEY-----`
  }
]

tid = 1;
for (let pt of pemTests) {
  let pem = PEM.parse(pt.text);
  t.is(pem?.label, pt.label, 'parsed PEM with invalid base64; test '+tid);
  let err = pem?.decode();
  t.ok((err instanceof Error), 'invalid base64 was rejectected; test '+tid);
  tid++;
}

t.done();
