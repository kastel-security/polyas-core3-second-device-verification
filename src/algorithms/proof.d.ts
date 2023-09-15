import { SecretProof } from '../classes/ballot';
interface ProofGenerator {
    generateProof: () => SecretProof;
}
declare class ProofGeneratorImpl implements ProofGenerator {
    generateProof(): SecretProof;
}
declare class ProofGeneratorMock implements ProofGenerator {
    private readonly e;
    private readonly r;
    constructor(e: bigint, r: bigint);
    generateProof(): SecretProof;
}
export { type ProofGenerator, ProofGeneratorImpl, ProofGeneratorMock };
