############################################################
import * as secUtl from "secret-manager-crypto-utils"

############################################################
defaultContext =  "standard ThingyCryptoNode"

############################################################
export class ThingyCryptoNode
    constructor: (o) ->
        @key = o.secretKeyHex
        @id = o.publicKeyHex
        @ctx = o.context
        if !@ctx? then @ctx = defaultContext

    ########################################################
    sign: (content) -> await secUtl.createSignatureHex(content, @key)
    verify: (sig, content) -> await secUtl.verifyHex(sig, @id, content)
    encrypt: (content) -> await secUtl.asymmetricEncryptHex(content, @id)
    decrypt: (secretsObj) -> await secUtl.asymmetricDecryptHex(secretsObj, @key)
    diffieHellmanFor: (id, salt, timestamp) ->
        context = "#{salt}:#{@ctx}_#{timestamp}"
        return await secUtl.diffieHellmanSecretHashHex(@key, id, context)

