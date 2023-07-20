import { ProjectivePoint } from "@noble/secp256k1"
import { SecretProof } from "../classes/ballot"
import * as constants from "../constants"
import randomBytes from 'randombytes';
import { bufToBn } from "../utils"

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

export {generateSecretProof, generateRandomProof}