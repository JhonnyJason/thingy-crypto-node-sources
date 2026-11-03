# thingy-crypto-node 

# Background
Thingy Nodes usually have an asymmetric keypair - this way all authentication works between the nodes in the thingy-ecosystem.
The thingy-crypto-node is the keeper of the keypair of this node - implementing all basic crypto functionality for this specific keypair.

It is a convenience layer over [secret-manager-crypto-utils](https://www.npmjs.com/package/secret-manager-crypto-utils) - see there for the cryptographic details and security notes.

# Usage
```js
import { ThingyCryptoNode } from "thingy-crypto-node"

const cryptoNode = new ThingyCryptoNode({
    secretKeyHex: "...", // required
    publicKeyHex: "...", // required
    context: "..."       // optional, default "standard ThingyCryptoNode"
})
```

## Signing and Verifying
```js
const signatureHex = await cryptoNode.sign(content) // content: string

const err = await cryptoNode.sigCheck(signatureHex, content)
if (err) throw new Error(err) // "Invalid signature!" or "Malformed input!"
// valid from here
```
**`sigCheck` resolves `undefined` when the signature is valid** and an error string when it is not. It never throws.
So the check is `if (err)` - and a forgotten `await` fails closed, because a Promise is truthy.

`sigCheck` checks signatures of this node's own key.

## Encrypting and Decrypting
Encrypts for this node's own key - e.g. for storing secrets only this node can read.
```js
const secretsObject = await cryptoNode.encrypt(content) // { referencePointHex, encryptedContentHex }
const content = await cryptoNode.decrypt(secretsObject)
```
`decrypt` rejects with `Error("Decryption failed!")` on a wrong key or changed data.

## Diffie-Hellman shared secret with a specific foreign node
```js
const sharedSecretHex = await cryptoNode.diffieHellmanFor(id, salt, timestamp)
// id: the other node's publicKeyHex
// salt: string, timestamp: number
// sharedSecretHex: 128 hex chars (64 bytes)
```
Both nodes get the same secret when they use the same `salt`, `timestamp` and `context`.

# Breaking Updates

`0.0.x` -> `0.1.y`
------------------
Updated to secret-manager-crypto-utils 0.4 - new encryption format and new shared secrets.

| 0.0.x | 0.1.x | What changed |
|---|---|---|
| `sign` | `sign` | nothing - same signatures |
| `verify` → `true` when valid | `sigCheck` → `undefined` when valid | **removed, inverted meaning** - see below |
| `encrypt` | `encrypt` | new format, 0.0.x cannot decrypt it |
| `decrypt` | `decrypt` | reads the new format only |
| `diffieHellmanFor` | `diffieHellmanFor` | different secret than 0.0.x |

- `verify` is removed on purpose, so every old call fails loudly with `TypeError: cryptoNode.verify is not a function` - instead of silently accepting invalid signatures. Mind the inverted meaning:
  ```js
  // before
  if (!(await cryptoNode.verify(sig, content))) return reject()
  // now
  if (await cryptoNode.sigCheck(sig, content)) return reject()
  ```
- Signatures are compatible both ways: 0.0.x nodes verify signatures of 0.1.x nodes and vice versa.

## Legacy functions
**Only for compatibility with data and nodes of 0.0.x. Never use them in new code. They will be removed in a future version.**

| Function | 1:1 like 0.0.x | Use for |
|---|---|---|
| `verifyLegacy(sig, content)` | `verify` → `true` when valid (malformed input → `false` instead of throwing) | a quick fix until you switch to `sigCheck` |
| `decryptLegacy(secretsObject)` | `decrypt` | reading data encrypted with 0.0.x -> encrypting it in new format is recommended |
| `diffieHellmanForLegacy(id, salt, timestamp)` | `diffieHellmanFor` | nodes that still run 0.0.x shared secrets |

Migrating encrypted data:
```js
let content
try { content = await cryptoNode.decrypt(secretsObject) }
catch { content = await cryptoNode.decryptLegacy(secretsObject) }
secretsObject = await cryptoNode.encrypt(content) // store this one
```

Talking to a node that still runs 0.0.x:
```js
const sharedSecretHex = peerIsLegacy
    ? await cryptoNode.diffieHellmanForLegacy(id, salt, timestamp)
    : await cryptoNode.diffieHellmanFor(id, salt, timestamp)
```
There is no way to detect a legacy node from the secret itself: you have to know which version the other node runs.
Anything that was keyed with an old shared secret has to be re-derived.

---

# License
[CC0](https://creativecommons.org/publicdomain/zero/1.0/)
