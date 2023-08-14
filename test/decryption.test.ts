import data from "./data.json"
import {SecondDeviceFinalMessage, SecondDeviceLoginResponse} from "../src/classes/communication"
import { aesDecrypt, checkSecondDeviceParameters, checkZKP, decryptBallot, decrytQRCode, generateComKey } from "../src/algorithms/decryption"
import { getBallotAsNormalizedBytestring } from "../src/algorithms/signature"
import { bufToBn, bufToHex, hexToBuf } from "../src/utils"
import { generateSecretProof} from "../src/algorithms/proof"

const loginResponse = SecondDeviceLoginResponse.fromJson(data.loginResponse)
const randomCoinSeed = "1e89b5f95deae82f6f823b52709117405f057783eda018d72cbd83141d394fbd"

test("test checkSecondDevicePublicParameter", () => {
    const valid = checkSecondDeviceParameters(loginResponse.initialMessageDecoded.secondDeviceParameter)
    expect(valid).toBe(true)
})

test.skip("test generateComKey", () => {
    const result = "dd96a88777267c645ff14648c9e03f6c9f56652a07fa3bf72e8a5f63f4288307"
    const comSeed = loginResponse.initialMessageDecoded.comSeed
    const ballotNorm = getBallotAsNormalizedBytestring(loginResponse.initialMessageDecoded.ballot)
    const calc = generateComKey(ballotNorm, comSeed)
    expect(bufToHex(calc)).toBe(result)
})

test("test aesDecrypt", async () => {
    const c = data.c
    const comKey = "dd96a88777267c645ff14648c9e03f6c9f56652a07fa3bf72e8a5f63f4288307"
    const result = await aesDecrypt(c, hexToBuf(comKey))
    const randomCoinSeed = "1e89b5f95deae82f6f823b52709117405f057783eda018d72cbd83141d394fbd"
    expect(bufToHex(result)).toBe(randomCoinSeed)
})

test.skip("test decrytQRCode", async () => {
    const decrypted = await decrytQRCode(data.c, loginResponse.initialMessageDecoded)
    expect(decrypted).toBe(randomCoinSeed)
})

test("test checkZKP", () => {
    const init = loginResponse.initialMessageDecoded
    const final = SecondDeviceFinalMessage.fromJson(data.finalMessage)
    const e = "108039209026641834721998202775536164454916176078442584841940316235417705823230"
    const r = "44267717001895006656767798790813376597351395807170189462353830054915294464906"
    const proof = generateSecretProof(BigInt(e), BigInt(r))
    const randomCoinSeedArray = hexToBuf(randomCoinSeed)
    const valid = checkZKP(init, final, proof, randomCoinSeedArray)
    expect(valid).toBe(true)
})

test("test decryptBallot", () => {
    const initialMsg = loginResponse.initialMessageDecoded
    const randomCoinSeedArray = hexToBuf(randomCoinSeed)
    const result = new Uint8Array([0,0,0,1])
    expect(decryptBallot(initialMsg, randomCoinSeedArray)).toStrictEqual(result)
})