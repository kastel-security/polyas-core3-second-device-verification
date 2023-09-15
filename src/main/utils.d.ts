declare function bufToHex(buf: Uint8Array): string;
declare function bufToNumber(input: Uint8Array): number;
declare function hexToBuf(hex: string, addLeadingZero?: boolean): Uint8Array;
declare function bufToBn(buf: Uint8Array): bigint;
/**
 * Transforms different data types to an Uint8Array
 * @param input The data to be transfored
 * @param length
 * @returns
 */
declare function toUint8Array(input: string | Uint8Array | number | bigint, length?: number): Uint8Array;
declare function decodeBase64(enc: string): Uint8Array;
export { hexToBuf, bufToBn, toUint8Array, bufToHex, bufToNumber, decodeBase64 };
