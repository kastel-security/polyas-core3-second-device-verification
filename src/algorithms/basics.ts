import { ProjectivePoint } from "@noble/secp256k1"
import * as constants from "../constants"
import { bufToBn, bufToNumber, hexToBuf, toUint8Array} from "../utils";
import * as crypto from "crypto"

/**
 * 
 * @param point Decodes a Point into a plaintext
 * @returns 
 */
function decodePoint(point: ProjectivePoint): Uint8Array {
    const a: bigint = (point.x - BigInt(1)) / BigInt(constants.decodingK)
    return toUint8Array(a, constants.plaintextBlockSize)
}

/**
 * Decodes the byte representation of a multi-plaintext into a message
 * @param multiPlaintext 
 * @returns 
 */
function decodeMultiPlaintext(multiPlaintext: Uint8Array) {
    const k = bufToNumber(multiPlaintext.subarray(0, 2))
    const zeroBytes = multiPlaintext.subarray(multiPlaintext.length - k, multiPlaintext.length)
    for (let t = 0; t < k; t++) {
        if (zeroBytes[t] != 0) {
            throw Error("Invalid multiplaintext")
        }
    }
    return multiPlaintext.subarray(2, multiPlaintext.length - k)

}

/**
 * Generates Pseude-Random Numbers from a seed
 * Implements Algorithm 3 from polyas-verifiable 1.3.0
 */
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

/**
 * Key derivation function of polyas-verifiable 1.3.0 (Algorithm 1)
 * @param length required length in bytes
 * @param seed 
 * @param label 
 * @param context 
 * @returns 
 */
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

export {decodePoint, NumbersInRangeFromSeed, kdfCounterMode, decodeMultiPlaintext }