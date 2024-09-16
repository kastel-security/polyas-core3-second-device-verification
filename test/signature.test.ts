import { checkSignature, computeFingerprint, getBallotAsNormalizedBytestring } from "../src/client/algorithms/signature"
import { SecondDeviceLoginResponse } from "../src/client/classes/communication"
import { bufToHex } from "../src/client/main/utils"
import data from "../src/client/mock/data.json"

import crypto from "crypto"

Object.defineProperty(globalThis, 'crypto', {
    value: {
      getRandomValues: arr => crypto.randomBytes(arr.length),
      subtle: crypto.subtle
    }
  });

test("test ballot fingerprint", async () => {
    const response = SecondDeviceLoginResponse.fromJson(data.loginResponse.value)
    const expectedNormalizedBallot = "000000010000002103bf956c38e14a6f81ed3621e165fb8c6000c28738f0e279fa28d2254d6b799eb10000002102e19fbd88d9e1ad760653dde8e7f00fcc0d45e2b38ccc0cb2301f2239d4fcac3f000000010000002100b0cb75473491d930dfffdf51f65753db9e6d1252720f50532bd6a4ddb5073c700000002100c7d607e9d00ebb3849a3632d1e64bdc726ea3ba0ce564a0de2c578f1d5db83b4000000200953edeaf6598b16e39aab05f7a751a5d68c0190ef6c10b64b602b6a97c1a6480000002100f4386a1cefe2f2ef00aef6b4cc107ec5ec13984f65e1c941fdf49882986f0c08"
    const expectedFingerprint = "91dd5f592932c7c681f20310c801e7ea935f116527b65ce6524f14c6ad2f9dac"
    expect(bufToHex(getBallotAsNormalizedBytestring(response.initialMessageDecoded.ballot))).toBe(expectedNormalizedBallot)
    expect(await computeFingerprint(response)).toBe(expectedFingerprint)
})

test("test checkSignature", async () => {
    const response = SecondDeviceLoginResponse.fromJson(data.loginResponse.value)
    const valid = await checkSignature(response)
    expect(valid).toBe(true)
})