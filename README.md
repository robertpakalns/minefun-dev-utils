# MineFun.io Development Utilities
Develop custom games outside MineFun.  
This utility improves developer experience (DX) by enabling hot module replacement (HMR), testing, and bundling.

## Usage
* Tampermonkey Script
  * Install [Tampermonkey](https://www.tampermonkey.net) in your browser
  * Copy the userscript `minefun-relay.user.js` into Tampermonkey
  * Ensure the userscript is enabled

* Local Server
  * Install [Bun](https://bun.sh/)
  * Clone this repository:
```bash
git clone https://github.com/robertpakalns/minefun-dev-utils.git
```
  * Run:
```bash
bun run dev
```
  * By default, the server uses port 3000. If the port is busy, update the port in both the server and `minefun-relay.user.js`.

## Limitations
* Requires the Bun JavaScript runtime.
* Supports only small payloads (~70 characters of code). Larger payloads will fail.
