# thingy-crypto-node 

# Background
Thingy Nodes usually have an assymetric keypair - this way all authentication works between the nodes in the thingy-ecosystem.
The thingy-crypto-node is the keeper of the keypair of this node - implementing all basic crypto functionality for this specific keypair.

# Usage
Current Functionality
---------------------
```coffescript
import { ThingyCryptoNode } from "thingy-crypto-node"

options = {
    secretKeyHex: "..." # required
    publicKeyHex: "..." # required
    context: "..." # optional
}
cryptoNode = new ThingyCryptoNode(options)


## Signing and Verifiying
content = STRING
signatureHex = await cryptoNode.sign(content)
signatureHex = STRINGHEX

true = await cryptoNode.verify(signatureHex, content)

## Encrypting and Decrypting
content = STRING
secretsObject = await cryptoNode.encrypt(content)
secretsObject = { referencePointHex, encryptedContentHex }
secretsObject = { STRINGHEX, STRINGHEX }

content = await cryptoNode.decrypt(secretsObject)

## DiffieHellman For shared secret with specific foreign node
id = STRINGHEX64
salt = STRING
timestamp = NUMBER
sharedSecretHex = await cryptoNode.diffieHellmanFor(id, salt, timestamp)
sharedSecretHex = STRINGHEX128

```

---

# Further steps

- Add more features when the requirement pops up.


All sorts of inputs are welcome, thanks!

---

# License
[CC0](https://creativecommons.org/publicdomain/zero/1.0/)
