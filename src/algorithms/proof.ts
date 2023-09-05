import { ProjectivePoint } from "@noble/secp256k1"
import { SecretProof } from "../classes/ballot"
import * as constants from "../main/constants"
import { bufToBn } from "../main/utils"

/**
 * 
 * @param limit Generates evenly distributed random number in a given range
 * @returns 
 */
function getRandomInRange(limit: bigint) {
    let random: bigint = limit
    while(random >= limit) {
        random = bufToBn(crypto.getRandomValues(new Uint8Array(Math.ceil(limit.toString(16).length / 2))))
    }
    return random
}

interface ProofGenerator {
    generateProof(): SecretProof
}

class ProofGeneratorImpl implements ProofGenerator {
    public generateProof(): SecretProof {
        const q: bigint = BigInt("0x" + constants.q)
        const e: bigint = getRandomInRange(q)
        const r: bigint = getRandomInRange(q)
        const proofGen = new ProofGeneratorMock(e, r)
        return proofGen.generateProof()
    }
}

class ProofGeneratorMock implements ProofGenerator {
    public constructor(
        private readonly e: bigint,
        private readonly r: bigint
    ) {}
    public generateProof(): SecretProof {
        const kPoint = ProjectivePoint.fromHex(constants.k)
        const gPoint = ProjectivePoint.fromHex(constants.g)
        const krPoint = kPoint.multiply(this.r)
        const gePoint = gPoint.multiply(this.e)
        const cPoint = krPoint.add(gePoint)
        return new SecretProof(this.e, this.r, BigInt('0x' + cPoint.toHex()))
    }
}

export {ProofGenerator, ProofGeneratorImpl, ProofGeneratorMock}