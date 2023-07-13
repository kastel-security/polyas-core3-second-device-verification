import { ProjectivePoint } from "@noble/secp256k1"
import { Ballot, Core3Ballot, SecretProof } from "./classes/ballot"
import * as constants from "./constants"
import randomBytes from 'randombytes';
import { bufToBn, hexToBuf, toUint8Array} from "./utils";
import * as crypto from "crypto"
import { SecondDeviceLoginResponse } from "./classes/communication";
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
    let publicKey: string = response.initialMessageDecoded.secondDeviceParameterDecoded.verificationKey
    let publicKeyArmored: string = "-----BEGIN PGP PUBLIC KEY BLOCK-----\r\n\r\n" + publicKey + "\r\n-----END PGP PUBLIC KEY BLOCK-----"
    let pgpKey= await(openpgp.readKey({ armoredKey: publicKeyArmored }))
    let message = await openpgp.createMessage({ text: computeFingerprint(response), format:"text" })
    const signature = await openpgp.readSignature({
        armoredSignature: response.initialMessageDecoded.signatureHex // parse detached signature
    })
    return false
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
    public constructor(seed: string, range: bigint) {
        this.i = 1
        this.seed = toUint8Array(seed)
        this.range = range
    }
    public getNextNumber(): bigint {
        const length = Math.ceil(Math.log2(Number(this.range)))
        const byteCount = Math.ceil(length / 8)
        let bytes = kdfCounterMode(byteCount, new Uint8Array([...this.seed, ...toUint8Array(this.i, 4)]), 'generator', 'Polyas')
        if (byteCount * 8 != length) {
            bytes[0] = bytes[0] % Math.pow(2, 8 + length - byteCount * 8)
        }
        const num = bufToBn(bytes)
        this.i++
        if (num < this.range) {
            return num
        } else {
            return this.getNextNumber()
        }
    }
}

export {generateRandomProof, generateSecretProof, checkSecondDeviceParameters, computeFingerprint, computeBytesToBeSigned, put, putWithLength,
kdfCounterMode, generateComKey, getBallotAsNormalizedBytestring, NumbersInRangeFromSeed}