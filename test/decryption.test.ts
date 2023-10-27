import data from "../src/mock/data.json"
import {SecondDeviceFinalMessage, SecondDeviceLoginResponse} from "../src/classes/communication"
import { aesDecrypt, checkSecondDeviceParameters, checkZKP, decryptBallot, decrytQRCode, generateComKey2 } from "../src/algorithms/decryption"
import { getBallotAsNormalizedBytestring } from "../src/algorithms/signature"
import { bufToHex, hexToBuf } from "../src/main/utils"
import crypto from "crypto"
import { EnvironmentVariables } from "../src/main/constants"
import { ProofGeneratorMock } from "../src/algorithms/proof"
const loginResponse = SecondDeviceLoginResponse.fromJson(data.loginResponse.value)
const randomCoinSeed = "1e89b5f95deae82f6f823b52709117405f057783eda018d72cbd83141d394fbd"

Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: arr => crypto.randomBytes(arr.length),
    subtle: crypto.subtle
  }
});

EnvironmentVariables.init("test").fingerprint = "b7e8e76c369d6a9ca268e40cde8347ac443040d6c4a1df3035744ace05b94e00849abf083ae5baa8fee462a723823054858387ec35462a49f93c2ea40b2fc876"

test("test checkSecondDevicePublicParameter", async () => {
    const valid = await checkSecondDeviceParameters(loginResponse.initialMessageDecoded.secondDeviceParameter)
    expect(valid).toBe(true)
})

test("test generateComKey", async () => {
    const result = "dd96a88777267c645ff14648c9e03f6c9f56652a07fa3bf72e8a5f63f4288307"
    const comSeed = loginResponse.initialMessageDecoded.comSeed
    const ballotNorm = getBallotAsNormalizedBytestring(loginResponse.initialMessageDecoded.ballot)
    const calc = await generateComKey2(ballotNorm, comSeed)
    expect(bufToHex(calc)).toBe(result)
})

test("test aesDecrypt", async () => {
    const c = data.c
    const comKey = "dd96a88777267c645ff14648c9e03f6c9f56652a07fa3bf72e8a5f63f4288307"
    const result = await aesDecrypt(c, hexToBuf(comKey))
    const randomCoinSeed = "1e89b5f95deae82f6f823b52709117405f057783eda018d72cbd83141d394fbd"
    expect(bufToHex(result)).toBe(randomCoinSeed)
})

test("test decrytQRCode", async () => {
    const decrypted = await decrytQRCode(data.c, loginResponse.initialMessageDecoded)
    expect(bufToHex(decrypted)).toBe(randomCoinSeed)
})

test("test checkZKP", async () => {
    const init = loginResponse.initialMessageDecoded
    const final = SecondDeviceFinalMessage.fromJson(data.finalMessage.value)
    const e = "108039209026641834721998202775536164454916176078442584841940316235417705823230"
    const r = "44267717001895006656767798790813376597351395807170189462353830054915294464906"
    const proof = (new ProofGeneratorMock(BigInt(e), BigInt(r))).generateProof()
    const randomCoinSeedArray = hexToBuf(randomCoinSeed)
    const valid = await  checkZKP(init, final, proof, randomCoinSeedArray)
    expect(valid).toBe(true)
})

test("test decryptBallot", async () => {
    const initialMsg = loginResponse.initialMessageDecoded
    const randomCoinSeedArray = hexToBuf(randomCoinSeed)
    const result = new Uint8Array([0,0,0,1])
    expect(await decryptBallot(initialMsg, randomCoinSeedArray)).toStrictEqual(result)
})