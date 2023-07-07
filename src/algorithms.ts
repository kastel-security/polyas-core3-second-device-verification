const secp = require("@noble/secp256k1")
const crypto = require("crypto-js")
const Secretproof = require("./classes/ballot")
const constants = require("./constants")

function generateRandomProof(): SecretProof {
    const e: bigint = BigInt(0) //make random
    const r: bigint = BigInt(0) //make random
    return generateSecretProof(e, r)
}

function generateSecretProof(e: bigint, r: bigint): SecretProof {
    const kPoint = secp.ProjectivePoint.fromHex("0x" + constants.k)
    const gPoint = secp.ProjectivePoint.fromHex("0x" + constants.g)
    const krPoint = kPoint.multiply(e)
    const gePoint = gPoint.multiply(e)
    const cPoint = krPoint.add(gePoint)
    return new SecretProof(e, r, BigInt(cPoint.toHex()))
}


export {generateRandomProof, generateSecretProof}