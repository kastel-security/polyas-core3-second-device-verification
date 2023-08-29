import { Ballot } from "../classes/ballot"
import { bufToHex, hexToBuf, toUint8Array} from "../main/utils"
import { SecondDeviceLoginResponse } from "../classes/communication"

function put(bytes: Uint8Array, input: string|Uint8Array|number|bigint, length?: number) {
    let bytesOfInput: Uint8Array = toUint8Array(input, length)
    return new Uint8Array([...bytes, ...bytesOfInput])
}

function putWithLength(bytes: Uint8Array, input: string|Uint8Array|number|bigint) {
    let bytesOfInput: Uint8Array = toUint8Array(input)
    bytes = put(bytes, bytesOfInput.length, 4)
    bytes = put(bytes, bytesOfInput)
    return bytes
}

/**
 * Computes the bytes to be verified for the ballot
 * @param response the response to the login request
 * @return The BTBS of the Ballot
 */
function computeBytesToBeSigned(response: SecondDeviceLoginResponse): Uint8Array {
    let bytes = new Uint8Array()
    bytes = putWithLength(bytes, response.publicLabel)
    bytes = putWithLength(bytes, response.initialMessageDecoded.publicCredential)
    bytes = putWithLength(bytes, response.ballotVoterId)
    bytes = new Uint8Array([...bytes, ...getBallotAsNormalizedBytestring(response.initialMessageDecoded.ballot)])
    return bytes
}

/**
 * Computes the fingerprint of the ballot
 * @param response the response to the login request
 * @return The fingerprint of the ballot
 */
async function computeFingerprint(response: SecondDeviceLoginResponse): Promise<string> {
    let bytes = computeBytesToBeSigned(response)
    const fingerprintBytes = await crypto.subtle.digest("SHA-256", bytes)
    return bufToHex(new Uint8Array(fingerprintBytes))
}

/**
 * Computes the normalized representation of the ballot
 * @param ballot 
 * @returns 
 */
function getBallotAsNormalizedBytestring(ballot: Ballot) {
    let bytes = new Uint8Array(0)
    bytes = put(bytes, ballot.encryptedChoice.ciphertexts.length, 4)
    
    for (let ciphertext of ballot.encryptedChoice.ciphertexts) {
        bytes = putWithLength(bytes, ciphertext.x)
        bytes = putWithLength(bytes, ciphertext.y)
    }
    bytes = put(bytes, ballot.proofOfKnowledgeOfEncryptionCoins.length, 4)
    for (let proof of ballot.proofOfKnowledgeOfEncryptionCoins) {
        bytes = putWithLength(bytes, proof.c)
        bytes = putWithLength(bytes, proof.f)
    }
    bytes = putWithLength(bytes, ballot.proofOfKnowledgeOfPrivateCredential.c)
    bytes = putWithLength(bytes, ballot.proofOfKnowledgeOfPrivateCredential.f)
    
    return bytes
}

/**
 * Verifies the signature on the ballot fingerprint with the verification key of the election
 * @param response 
 * @returns 
 */
async function checkSignature(response: SecondDeviceLoginResponse): Promise<boolean> {
    let publicKeyHex: string = response.initialMessageDecoded.secondDeviceParameterDecoded.verificationKey
    let publicKeyDecoded = await crypto.subtle.importKey("spki", hexToBuf(publicKeyHex, false), {name: "RSASSA-PKCS1-v1_5", hash: "SHA-256"}, true, ["verify"])
    let message = hexToBuf(await computeFingerprint(response))
    let signature = hexToBuf(response.initialMessageDecoded.signatureHex, false)
    return crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKeyDecoded, signature, message);
}

export{computeFingerprint, checkSignature, getBallotAsNormalizedBytestring }