import { ProjectivePoint } from '@noble/secp256k1'
import { type SecretProof } from '../classes/ballot'
import * as constants from '../main/constants'
import { bufToHex, decodeBase64, hexToBuf, toUint8Array } from '../main/utils'
import { type SecondDeviceFinalMessage, type SecondDeviceInitialMsg, type SecondDeviceLoginResponse } from '../classes/communication'
import { computeFingerprint, getBallotAsNormalizedBytestring } from './signature'
import { kdfCounterMode, NumbersInRangeFromSeed, decodePoint, decodeMultiPlaintext } from './basics'

/**
 * Checks the second device parameters against the pre-configured election fingerprint
 * @param parametersJson
 * @returns
 */
async function checkSecondDeviceParameters (parametersJson: string): Promise<boolean> {
  const hashBytes = await crypto.subtle.digest('SHA-512', toUint8Array(parametersJson))
  const hash = bufToHex(new Uint8Array(hashBytes))
  console.log(hash)
  return hash === constants.EnvironmentVariables.instance.fingerprint
}

/* eslint-disable */
/**
 * @param ballotNorm The normalized ballot representation
 * @param comSeed comSeed from the SecondDeviceInitialMessage represented as hexadecimal string
 * @returns comKey as Uint8Array
 */
async function generateComKey (ballotNorm: Uint8Array, comSeed: string): Promise<Uint8Array> {
  const hashBallot = await crypto.subtle.digest('SHA-256', ballotNorm)
  const keyDerivationKey = new Uint8Array([...hexToBuf(comSeed, false), ...new Uint8Array(hashBallot)])
  return await kdfCounterMode(32, keyDerivationKey, '', '')
}
/* eslint-enable */

/**
 * This matches the Polyas implementation but is likely incorrect
 * @param ballotNorm The normalized ballot representation
 * @param comSeed comSeed from the SecondDeviceInitialMessage represented as ASCII string
 * @returns comKey as Uint8Array
 */
async function generateComKey2 (ballotNorm: Uint8Array, comSeed: string): Promise<Uint8Array> {
  const comSeedBytes = new Array<number>()
  for (let i = 0; i < comSeed.length; i++) {
    comSeedBytes.push(comSeed.charCodeAt(i))
  }
  const hashBallot = await crypto.subtle.digest('SHA-256', ballotNorm)
  const keyDerivationKey = new Uint8Array([...new Uint8Array(comSeedBytes), ...new Uint8Array(hashBallot)])
  return await Promise.resolve(await kdfCounterMode(32, keyDerivationKey, '', ''))
}

/**
 * Decrypts a message using AES in GCM with the first 12 bytes as initialization vector, the next 16 bytes as tag and
 * the final 32 bytes as ciphertext
 * @param c Decrypted message
 * @param comKey key used for encryption
 * @returns
 */
async function aesDecrypt (c: string, comKey: Uint8Array): Promise<Uint8Array> {
  const decode = decodeBase64(c)
  const iv = decode.subarray(0, 12)
  const tag = decode.subarray(12, 28)
  const data = decode.subarray(28, 60)
  const ciphertext = new Uint8Array([...data, ...tag])
  const aesKey = await crypto.subtle.importKey('raw', comKey, 'AES-GCM', false, ['decrypt'])
  const decrypt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, ciphertext)
  return new Uint8Array(decrypt)
}

/**
 * Decrypting the QR Code
 * @param c param c of QR Code
 * @param initialMessage InitialMessage From SecondDeviceLoginResponse
 * @returns the decrypted QR Code
 */
async function decrytQRCode (c: string, initialMessage: SecondDeviceInitialMsg): Promise<Uint8Array> {
  const ballotNorm = getBallotAsNormalizedBytestring(initialMessage.ballot)
  const comKey = await generateComKey2(ballotNorm, initialMessage.comSeed)
  return await aesDecrypt(c, comKey)
}

/**
 *
 * @param initialMessage Checks the ZKP of the final message sent by the election server
 * @param finalMessage
 * @param proof
 * @param randomCoinSeed
 * @returns
 */
async function checkZKP (initialMessage: SecondDeviceInitialMsg, finalMessage: SecondDeviceFinalMessage, proof: SecretProof, randomCoinSeed: Uint8Array): Promise<boolean> {
  const cipherLength = initialMessage.ballot.encryptedChoice.ciphertexts.length
  if (!(initialMessage.factorA.length === cipherLength && initialMessage.factorB.length === cipherLength &&
         initialMessage.factorX.length === cipherLength && initialMessage.factorY.length === cipherLength && finalMessage.z.length === cipherLength)) {
    return false
  }
  const gElem = ProjectivePoint.fromHex(constants.g)
  const hElem = ProjectivePoint.fromHex(initialMessage.secondDeviceParameterDecoded.publicKey)
  const q = BigInt('0x' + constants.q)
  for (let t = 0; t < cipherLength; t++) {
    const x = initialMessage.factorX[t].toString(16)
    const y = initialMessage.factorY[t].toString(16)
    const xElem = ProjectivePoint.fromHex(x.padStart(constants.pointLength, '0'))
    const yElem = ProjectivePoint.fromHex(y.padStart(constants.pointLength, '0'))
    const aCalc = gElem.mul(finalMessage.z[t] % q, true).add(xElem.mul(proof.e, true).negate())
    const bCalc = hElem.mul(finalMessage.z[t] % q, true).add(yElem.mul(proof.e, true).negate())
    if (aCalc.toHex() !== initialMessage.factorA[t].toString(16).padStart(constants.pointLength, '0') ||
            bCalc.toHex() !== initialMessage.factorB[t].toString(16).padStart(constants.pointLength, '0')) {
      return false
    }
  }
  const numbersInRange = new NumbersInRangeFromSeed(toUint8Array(randomCoinSeed), q)
  for (let t = 0; t < cipherLength; t++) {
    // const uElem = new ProjectivePoint(initialMessage.ballot.encryptedChoice.ciphertexts[t].x, initialMessage.ballot.encryptedChoice.ciphertexts[t].y, BigInt(1))
    const uElem = ProjectivePoint.fromHex(initialMessage.ballot.encryptedChoice.ciphertexts[t].x.toString(16).padStart(constants.pointLength, '0'))
    const x = initialMessage.factorX[t].toString(16)
    const xElem = ProjectivePoint.fromHex(x.padStart(constants.pointLength, '0'))
    const r = await numbersInRange.getNextNumber()
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
async function decryptBallot (initialMessage: SecondDeviceInitialMsg, randomCoinSeed: Uint8Array): Promise<Uint8Array> {
  const cipherLength = initialMessage.ballot.encryptedChoice.ciphertexts.length
  const q = BigInt('0x' + constants.q)
  const numbersInRange = new NumbersInRangeFromSeed(randomCoinSeed, q)
  const hElem = ProjectivePoint.fromHex(initialMessage.secondDeviceParameterDecoded.publicKey)
  let c: Uint8Array = new Uint8Array(0)
  for (let t = 0; t < cipherLength; t++) {
    const y = initialMessage.factorY[t].toString(16)
    const yElem = ProjectivePoint.fromHex(y.padStart(constants.pointLength, '0'))
    const u = initialMessage.ballot.encryptedChoice.ciphertexts[t].y.toString(16)
    const uElem = ProjectivePoint.fromHex(u.padStart(constants.pointLength, '0'))
    const r = await numbersInRange.getNextNumber()
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
async function generateReceiptText (loginResponse: SecondDeviceLoginResponse): Promise<string[]> {
  const electionId: string = loginResponse.electionId
  const voterId: string = loginResponse.ballotVoterId
  const fingerprint: string = await computeFingerprint(loginResponse)
  const shortenedFingerprint: string = fingerprint.substring(0, 10)
  const signature: string = loginResponse.initialMessageDecoded.signatureHex
  return new Array<string>(electionId, voterId, shortenedFingerprint, fingerprint, signature)
}

export { checkSecondDeviceParameters, generateComKey2, checkZKP, decryptBallot, generateReceiptText, aesDecrypt, decrytQRCode }
