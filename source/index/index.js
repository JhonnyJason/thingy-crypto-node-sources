import * as secUtl from "secret-manager-crypto-utils"
import * as legacy from "secret-manager-crypto-utils/legacy"

const defaultContext = "standard ThingyCryptoNode"

export class ThingyCryptoNode {
    constructor(o) {
        this.key = o.secretKeyHex
        this.id = o.publicKeyHex
        this.ctx = o.context ?? defaultContext
    }

    sign(content) { return secUtl.createSignature(content, this.key) }
    // undefined when valid, an error string otherwise - never throws
    sigCheck(sig, content) { return secUtl.verifySignature(sig, this.id, content) }
    encrypt(content) { return secUtl.asymmetricEncrypt(content, this.id) }
    decrypt(secretsObj) { return secUtl.asymmetricDecrypt(secretsObj, this.key) }
    diffieHellmanFor(id, salt, timestamp) {
        return secUtl.diffieHellmanSecretHash(this.key, id, contextFor(salt, this.ctx, timestamp))
    }

    // Legacy: 1:1 with thingy-crypto-node 0.0.x - only for compatibility, will be removed
    async verifyLegacy(sig, content) { return !(await this.sigCheck(sig, content)) }
    decryptLegacy(secretsObj) { return legacy.asymmetricDecryptV0_3_1(secretsObj, this.key) }
    diffieHellmanForLegacy(id, salt, timestamp) {
        return legacy.diffieHellmanSecretHashV0_3_1(this.key, id, contextFor(salt, this.ctx, timestamp))
    }
}

const contextFor = (salt, ctx, timestamp) => `${salt}:${ctx}_${timestamp}`
