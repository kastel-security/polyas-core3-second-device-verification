import { type ProjectivePoint } from '@noble/secp256k1';
/**
 *
 * @param point Decodes a Point into a plaintext
 * @returns
 */
declare function decodePoint(point: ProjectivePoint): Uint8Array;
/**
 * Decodes the byte representation of a multi-plaintext into a message
 * @param multiPlaintext
 * @returns
 */
declare function decodeMultiPlaintext(multiPlaintext: Uint8Array): Uint8Array;
/**
 * Generates Pseude-Random Numbers from a seed
 * Implements Algorithm 3 from polyas-verifiable 1.3.0
 */
declare class NumbersInRangeFromSeed {
    private i;
    private readonly seed;
    private readonly range;
    constructor(seed: string | Uint8Array, range: bigint);
    getNextNumber(): Promise<bigint>;
}
/**
 * Key derivation function of polyas-verifiable 1.3.0 (Algorithm 1)
 * @param length required length in bytes
 * @param seed
 * @param label
 * @param context
 * @returns
 */
declare function kdfCounterMode(length: number, seed: Uint8Array, label: string, context: string): Promise<Uint8Array>;
export { decodePoint, NumbersInRangeFromSeed, kdfCounterMode, decodeMultiPlaintext };
