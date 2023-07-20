import { ProjectivePoint } from "@noble/secp256k1"
import { SecretProof } from "../classes/ballot"
import * as constants from "../constants"
import { bufToBn, bufToNumber, hexToBuf, toUint8Array} from "../utils";
import * as crypto from "crypto"
import { SecondDeviceFinalMessage, SecondDeviceInitialMsg, SecondDeviceLoginResponse } from "../classes/communication";
import { computeFingerprint } from "./signature"
import {kdfCounterMode, NumbersInRangeFromSeed, decodePoint, decodeMultiPlaintext} from "./basics"

/**
 * Checks the second device parameters against the pre-configured election fingerprint
 * @param parametersJson 
 * @returns 
 */
function checkSecondDeviceParameters(parametersJson: string) {
    const hash = crypto.createHash("SHA512").update(parametersJson, 'utf-8').digest().toString('hex')
    return hash == constants.fingerprint
}

function generateComKey(ballotNorm: Uint8Array, comSeed: string) {
    const hashBallot = crypto.createHash("SHA256").update(ballotNorm).digest()
    const key_derivation_key = new Uint8Array([...hexToBuf(comSeed, false), ...hashBallot])
    return kdfCounterMode(32, key_derivation_key, '', '')
}

/**
 * 
 * @param initialMessage Checks the ZKP of the final message sent by the election server
 * @param finalMessage 
 * @param proof 
 * @param randomCoinSeed 
 * @returns 
 */
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

/**
 * Decrypts the ballot 
 * @param initialMessage 
 * @param randomCoinSeed 
 * @returns 
 */
function decryptBallot(initialMessage: SecondDeviceInitialMsg, randomCoinSeed: bigint): Uint8Array {
    const cipherLength = initialMessage.ballot.encryptedChoice.ciphertexts.length
    const q = BigInt("0x" +  constants.q)
    const numbersInRange = new NumbersInRangeFromSeed(toUint8Array(randomCoinSeed), q)
    const hElem = ProjectivePoint.fromHex(initialMessage.secondDeviceParameterDecoded.publicKey)
    let c: Uint8Array = new Uint8Array(0)
    for (let t = 0; t < cipherLength; t++) {
        const y = initialMessage.factorY[t].toString(16)
        const yElem = ProjectivePoint.fromHex(y.padStart(constants.pointLength, "0"))
        const u = initialMessage.ballot.encryptedChoice.ciphertexts[t].y.toString(16)
        const uElem = ProjectivePoint.fromHex(u.padStart(constants.pointLength, "0"))
        const r = numbersInRange.getNextNumber()
        const ci = uElem.add(yElem).add((hElem.mul(r, true)).negate())
        c = new Uint8Array([...c, ...decodePoint(ci)])
    }
    return decodeMultiPlaintext(c)
}

/**
 * Generates the receipt
 * @param loginResponse 
 * @returns 
 */
function generateReceiptText(loginResponse: SecondDeviceLoginResponse) {
    const electionId: string = loginResponse.electionId
    const voterId: string = loginResponse.ballotVoterId
    const fingerprint: string = computeFingerprint(loginResponse)
    const shortenedFingerprint: string = fingerprint.substring(0, 10)
    const signature: string = loginResponse.initialMessageDecoded.signatureHex
    let string = `Project ID: ${electionId}\nVoter Id: ${voterId}\nBallot Fingerprint: ${shortenedFingerprint}\n\n`
    string = string + `-----BEGIN FINGERPRINT-----\n${fingerprint}\n-----END FINGERPRINT-----\n-----BEGIN SIGNATURE-----\n`
    string = string + `${signature}\n-----END SIGNATURE-----`
    return string
}

export {checkSecondDeviceParameters, generateComKey, checkZKP, decryptBallot, generateReceiptText}