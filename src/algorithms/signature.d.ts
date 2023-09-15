import { type Ballot } from '../classes/ballot';
import { type SecondDeviceLoginResponse } from '../classes/communication';
/**
 * Computes the fingerprint of the ballot
 * @param response the response to the login request
 * @return The fingerprint of the ballot
 */
declare function computeFingerprint(response: SecondDeviceLoginResponse): Promise<string>;
/**
 * Computes the normalized representation of the ballot
 * @param ballot
 * @returns
 */
declare function getBallotAsNormalizedBytestring(ballot: Ballot): Uint8Array;
/**
 * Verifies the signature on the ballot fingerprint with the verification key of the election
 * @param response
 * @returns
 */
declare function checkSignature(response: SecondDeviceLoginResponse): Promise<boolean>;
export { computeFingerprint, checkSignature, getBallotAsNormalizedBytestring };
