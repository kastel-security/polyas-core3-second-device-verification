import { type ProofGenerator } from '../algorithms/proof';
import { type Communication } from './communication';
declare const k = "0373744f99d31509eb5f8caaabc0cc3fab70e571a5db4d762020723b9cd6ada260";
declare const g = "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798";
declare const q = "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141";
declare const decodingK = 80;
declare const pointLength = 66;
declare const plaintextBlockSize = 31;
type Modes = 'mock' | 'dev' | 'deploy' | 'test';
declare class EnvironmentVariables {
    mode: Modes;
    backendUrl: string;
    fingerprint: string;
    proofGen: ProofGenerator;
    comm: Communication;
    static instance: EnvironmentVariables;
    static init(mode: Modes): EnvironmentVariables;
}
export { k, g, q, pointLength, plaintextBlockSize, decodingK, EnvironmentVariables };
