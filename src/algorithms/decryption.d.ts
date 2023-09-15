import { type SecretProof } from '../classes/ballot';
import { type SecondDeviceFinalMessage, type SecondDeviceInitialMsg, type SecondDeviceLoginResponse } from '../classes/communication';
/**
 * Checks the second device parameters against the pre-configured election fingerprint
 * @param parametersJson
 * @returns
 */
declare function checkSecondDeviceParameters(parametersJson: string): Promise<boolean>;
/**
 * This matches the Polyas implementation but is likely incorrect
 * @param ballotNorm The normalized ballot representation
 * @param comSeed comSeed from the SecondDeviceInitialMessage represented as ASCII string
 * @returns comKey as Uint8Array
 */
declare function generateComKey2(ballotNorm: Uint8Array, comSeed: string): Promise<Uint8Array>;
/**
 * Decrypts a message using AES in GCM with the first 12 bytes as initialization vector, the next 16 bytes as tag and
 * the final 32 bytes as ciphertext
 * @param c Decrypted message
 * @param comKey key used for encryption
 * @returns
 */
declare function aesDecrypt(c: string, comKey: Uint8Array): Promise<Uint8Array>;
/**
 * Decrypting the QR Code
 * @param c param c of QR Code
 * @param initialMessage InitialMessage From SecondDeviceLoginResponse
 * @returns the decrypted QR Code
 */
declare function decrytQRCode(c: string, initialMessage: SecondDeviceInitialMsg): Promise<Uint8Array>;
/**
 *
 * @param initialMessage Checks the ZKP of the final message sent by the election server
 * @param finalMessage
 * @param proof
 * @param randomCoinSeed
 * @returns
 */
declare function checkZKP(initialMessage: SecondDeviceInitialMsg, finalMessage: SecondDeviceFinalMessage, proof: SecretProof, randomCoinSeed: Uint8Array): Promise<boolean>;
/**
 * Decrypts the ballot
 * @param initialMessage
 * @param randomCoinSeed
 * @returns
 */
declare function decryptBallot(initialMessage: SecondDeviceInitialMsg, randomCoinSeed: Uint8Array): Promise<Uint8Array>;
/**
 * Generates the receipt
 * @param loginResponse
 * @returns
 */
declare function generateReceiptText(loginResponse: SecondDeviceLoginResponse): Promise<string[]>;
export { checkSecondDeviceParameters, generateComKey2, checkZKP, decryptBallot, generateReceiptText, aesDecrypt, decrytQRCode };
