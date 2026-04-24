# TODO

- Write tests for HMAC, HOTP, TOTP, etc.

## v3.x

- Target `@lumjs/core` 2.x once it is finalised.
- Rewrite this as ESM with native Typescript typings.
  That will let me drop all the compatibility cruft I've had to add
  just to get this package working for a Typescript project.
- I want to simplify the modules exported from this package.
  Right now there are direct modules for each class, plus _sets_ that
  include bundles of related classes. It's a rather convoluted mess.
  So instead I want to streamline the exported modules to:
  - `@lumjs/encode` (default) → composes `/digest`, `/otp`;
    this is the same as the `/all` module in v2.x.
  - `/base` → exports `Base32`, `Base64`, `Base91`, `Util`.
  - `/digest` → extends `/base`; exports `Hash`.
  - `/sign` → extends `/base`; exports `HMAC`, `PEM`, `Signature`.
  - `/otp` → extends `/sign`; exports `HOTP`, `TOTP`.
  - `/polyfill` → unchanged.
  - That's it; any other modules will be dropped entirely.
  - The docblock refs would be updated to reflect the new modules.

### Proposed `lib` structure

- base/
  - base32.js
  - base64.js
  - base91.js
  - index.js
- digest/
  - hash.js
  - index.js
- otp/
  - hotp.js
  - index.js
  - totp.js
- sign/
  - hmac.js
  - index.js
  - pem.js
  - signature.js
- index.js
- polyfill.js
- util.js

