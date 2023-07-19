import { ProjectivePoint } from "@noble/secp256k1"
import { Ballot, Core3Ballot, Proof, SecretProof } from "./classes/ballot"
import * as constants from "./constants"
import randomBytes from 'randombytes';
import { bufToBn, bufToNumber, hexToBuf, toUint8Array} from "./utils";
import * as crypto from "crypto"
import { SecondDeviceFinalMessage, SecondDeviceInitialMsg, SecondDeviceLoginResponse } from "./classes/communication";
import * as openpgp from "openpgp"

/**
 * 
 * @param limit Generates evenly distributed random number in a given range
 * @returns 
 */
function getRandomInRange(limit: bigint) {
    let random: bigint = limit
    while(random >= limit) {
        random = bufToBn(randomBytes(limit.toString(8).length))
    }
    return random
}

/**
 * Generates a random proof
 * @returns 
 */
function generateRandomProof(): SecretProof {
    const q: bigint = BigInt("0x" + constants.q)
    const e: bigint = getRandomInRange(q)
    const r: bigint = getRandomInRange(q)
    return generateSecretProof(e, r)
}

/**
 * Generates a proof from provided openings e, r
 * @param e 
 * @param r 
 * @returns 
 */
function generateSecretProof(e: bigint, r: bigint): SecretProof {
    const kPoint = ProjectivePoint.fromHex(constants.k)
    const gPoint = ProjectivePoint.fromHex(constants.g)
    const krPoint = kPoint.multiply(r)
    const gePoint = gPoint.multiply(e)
    const cPoint = krPoint.add(gePoint)
    return new SecretProof(e, r, BigInt('0x' + cPoint.toHex()))
}

function checkSecondDeviceParameters(parametersJson: string) {
    const hash = crypto.createHash("SHA512").update(parametersJson, 'utf-8').digest().toString('hex')
    return hash == constants.fingerprint
}

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
function computeFingerprint(response: SecondDeviceLoginResponse): string {
    let bytes = computeBytesToBeSigned(response)
    return crypto.createHash("SHA256").update(bytes).digest().toString('hex')
}

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

async function checkSignature(response: SecondDeviceLoginResponse): Promise<boolean> {
    let publicKeyHex: string = response.initialMessageDecoded.secondDeviceParameterDecoded.verificationKey
    let publicKeyDecoded = await crypto.subtle.importKey("spki", hexToBuf(publicKeyHex, false), {name: "RSASSA-PKCS1-v1_5", hash: "SHA-256"}, true, ["verify"])
    let message = hexToBuf(computeFingerprint(response)) 
    let signature = hexToBuf(response.initialMessageDecoded.signatureHex, false)
    return crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKeyDecoded, signature, message);
}

function kdfCounterMode(length: number, seed: Uint8Array, label: string, context: string) {
    let blockCount = Math.ceil(length / 64)
    let kdf = new Uint8Array()
    for (let t = 0; t < blockCount; t++) {
        let bytesToHash = new Uint8Array([...toUint8Array(t, 4), ...toUint8Array(label), 0, ...toUint8Array(context), ...toUint8Array(length, 4)])
        let hashedBytes = crypto.createHmac('sha512', seed).update(bytesToHash).digest()
        kdf = new Uint8Array([...kdf, ...hashedBytes])
    }
    return kdf.subarray(0, length)
}

function generateComKey(ballotNorm: Uint8Array, comSeed: string) {
    const hashBallot = crypto.createHash("SHA256").update(ballotNorm).digest()
    const key_derivation_key = new Uint8Array([...hexToBuf(comSeed, false), ...new Uint8Array(hashBallot)])
    return kdfCounterMode(32, key_derivation_key, '', '')
}

class NumbersInRangeFromSeed {
    private i:number
    private seed: Uint8Array
    private range: bigint
    public constructor(seed: string|Uint8Array, range: bigint) {
        this.i = 1
        this.seed = toUint8Array(seed)
        this.range = range
    }
    public getNextNumber(): bigint {
        const rangeBytes = hexToBuf(this.range.toString(16))
        const firstByteBitCount = Math.floor(Math.log2(rangeBytes[0])) + 1
        const byteCount = rangeBytes.length
        let bytes = kdfCounterMode(byteCount, new Uint8Array([...this.seed, ...toUint8Array(this.i, 4)]), 'generator', 'Polyas')
        bytes[0] = bytes[0] % Math.pow(2, firstByteBitCount)
        const num = bufToBn(bytes)
        this.i++
        if (num < this.range) {
            return num
        } else {
            return this.getNextNumber()
        }
    }
}

function checkZKP(initialMessage: SecondDeviceInitialMsg, finalMessage: SecondDeviceFinalMessage, proof: SecretProof, randomCoinSeed: bigint) {
    const cipherLength = initialMessage.ballot.encryptedChoice.ciphertexts.length
    if(!(initialMessage.factorA.length == cipherLength && initialMessage.factorB.length == cipherLength &&
         initialMessage.factorX.length == cipherLength && initialMessage.factorY.length == cipherLength && finalMessage.z.length == cipherLength)) {
        return false;
    }
    const gElem = ProjectivePoint.fromHex(constants.g)
    const hElem = ProjectivePoint.fromHex(initialMessage.secondDeviceParameterDecoded.publicKey)
    const q = BigInt("0x" +  constants.q)
    for (let t = 0; t < cipherLength; t++) {
        const x = initialMessage.factorX[t].toString(16)
        const y = initialMessage.factorY[t].toString(16)
        const xElem = ProjectivePoint.fromHex(x.padStart(constants.pointLength, "0"))
        const yElem = ProjectivePoint.fromHex(y.padStart(constants.pointLength, "0"))
        const aCalc = gElem.mul(finalMessage.z[t] % q, true).add(xElem.mul(proof.e, true).negate())
        const bCalc = hElem.mul(finalMessage.z[t] % q, true).add(yElem.mul(proof.e, true).negate())
        if (aCalc.toHex() != initialMessage.factorA[t].toString(16).padStart(constants.pointLength, "0") || 
            bCalc.toHex() != initialMessage.factorB[t].toString(16).padStart(constants.pointLength, "0")) {
            return false
        }
    }
    const numbersInRange = new NumbersInRangeFromSeed(toUint8Array(randomCoinSeed), q)
    for (let t = 0; t < cipherLength; t++) {
        //const uElem = new ProjectivePoint(initialMessage.ballot.encryptedChoice.ciphertexts[t].x, initialMessage.ballot.encryptedChoice.ciphertexts[t].y, BigInt(1))
        const uElem = ProjectivePoint.fromHex(initialMessage.ballot.encryptedChoice.ciphertexts[t].x.toString(16).padStart(constants.pointLength, "0"))
        const x = initialMessage.factorX[t].toString(16)
        const xElem = ProjectivePoint.fromHex(x.padStart(constants.pointLength, "0"))
        const r = numbersInRange.getNextNumber()
        if (!(uElem.add(xElem).toHex() === gElem.mul(r, true).toHex())) {
            return false
        }
    }
    return true
}

function decodeMultiPlaintext(multiPlaintext: Uint8Array) {
    console.log(multiPlaintext)
    const k = bufToNumber(multiPlaintext.subarray(0, 2))
    const zeroBytes = multiPlaintext.subarray(multiPlaintext.length - k, multiPlaintext.length)
    for (let t = 0; t < k; t++) {
        if (zeroBytes[t] != 0) {
            throw Error("Invalid multiplaintext")
        }
    }
    return multiPlaintext.subarray(2, multiPlaintext.length - k)

}

function decryptBallot(initialMessage: SecondDeviceInitialMsg, proof: SecretProof, randomCoinSeed: bigint): Uint8Array {
    const cipherLength = initialMessage.ballot.encryptedChoice.ciphertexts.length
    const gElem = ProjectivePoint.fromHex(constants.g)
    const q = BigInt("0x" +  constants.q)
    const numbersInRange = new NumbersInRangeFromSeed(toUint8Array(randomCoinSeed), q)
    const hElem = ProjectivePoint.fromHex(initialMessage.secondDeviceParameterDecoded.publicKey)
    let c: Uint8Array = new Uint8Array(0)
    for (let t = 0; t < cipherLength; t++) {
        const y = initialMessage.factorY[t].toString(16)
        const yElem = ProjectivePoint.fromHex(y.padStart(constants.pointLength, "0"))
        const u = initialMessage.ballot.encryptedChoice.ciphertexts[t].x.toString(16)
        const uElem = ProjectivePoint.fromHex(u.padStart(constants.pointLength, "0"))
        const r = numbersInRange.getNextNumber()
        const ci = uElem.add(yElem).add((hElem.mul(r, true)).negate())
        c = new Uint8Array([...c, ...toUint8Array((ci.x - BigInt(1)) / BigInt(constants.decodingK), constants.plaintextBlockSize)])
    }
    return decodeMultiPlaintext(c)
}

export {generateRandomProof, generateSecretProof, checkSecondDeviceParameters, computeFingerprint, computeBytesToBeSigned, put, putWithLength,
kdfCounterMode, generateComKey, getBallotAsNormalizedBytestring, NumbersInRangeFromSeed, checkSignature, checkZKP, decryptBallot}