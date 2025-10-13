import data from "../src/mock/testinstanz.json"
import { SecondDeviceLoginResponse } from "../src/classes/communication"
import { checkSignature } from "../src/algorithms/signature"

import crypto from "crypto"
import { decryptQRCode } from "../src/algorithms/decryption";

Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: arr => crypto.randomBytes(arr.length),
    subtle: crypto.subtle
  }
});

test("Testing failing signature from polyas test server", async () => {
    const loginResponse = SecondDeviceLoginResponse.fromJson(data.loginResponse) 
    const result = await checkSignature(loginResponse)
    expect(result).toBe(true)
})

test("Testing decryptQRCode from polyas test server", async () => {
    const loginResponse = SecondDeviceLoginResponse.fromJson(data.loginResponse) 
    const decrypted = await decryptQRCode(data.c, loginResponse.initialMessageDecoded)
})
