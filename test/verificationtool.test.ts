import data from "../src/mock/data.json"
import axios from "axios"
//import * as proof from "../src/algorithms/proof"
import * as decrypt from "../src/algorithms/decryption"
import * as sign from "../src/algorithms/signature"
import { hexToBuf } from "../src/main/utils"
import {Comm, ResponseBean, ResponseBeanError, ResponseBeanOk} from "../src/main/communication"
import {Verificationtool} from "../src/main/verifictiontool"
import { ElectionData, SecondDeviceFinalMessage, SecondDeviceLoginResponse } from "../src/classes/communication"
import { ErrorType } from "../src/main/error"
import { EnvironmentVariables } from "../src/main/constants"
import crypto from "crypto"

EnvironmentVariables.init("test").fingerprint = "b7e8e76c369d6a9ca268e40cde8347ac443040d6c4a1df3035744ace05b94e00849abf083ae5baa8fee462a723823054858387ec35462a49f93c2ea40b2fc876"
EnvironmentVariables.instance.comm = new Comm()
const mockedAxios = jest.spyOn(axios, 'request')
//const mockedProof = jest.spyOn(proof, 'generateRandomProof')
const mockedDecrypt = jest.spyOn(decrypt, 'decrytQRCode')
const randomCoinSeed = "1e89b5f95deae82f6f823b52709117405f057783eda018d72cbd83141d394fbd"
const e = BigInt("108039209026641834721998202775536164454916176078442584841940316235417705823230")
const r = BigInt("44267717001895006656767798790813376597351395807170189462353830054915294464906")
//const secProof = proof.generateSecretProof(e, r)

Object.defineProperty(globalThis, 'crypto', {
    value: {
      getRandomValues: arr => crypto.randomBytes(arr.length),
      subtle: crypto.subtle
    }
  });

async function validAxios(request: any) {
    if(request.url == "/electionData") {
        if (request.data != undefined) {
            return Promise.reject("Invalid request value")
        }
        return Promise.resolve(
            {
                status: "OK",
                data: data.electionData
            })
    } else if (request.url == "/login") {
        if (JSON.stringify(request.data) != JSON.stringify(data.loginRequest)) {
            return Promise.reject("Invalid request value")
        }
        return Promise.resolve(
            {
                status: "OK",
                data: {
                    status: "OK",
                    value: data.loginResponse
                }
            })
    } else if (request.url == "/challenge") {
        if (JSON.stringify(request.data) != JSON.stringify(data.challenge)) {
            return Promise.reject("Invalid request value")
        }
        return Promise.resolve(
            {
                status: "OK",
                data: {
                    status: "OK",
                    value: data.finalMessage
                }
            })
    }
    else {
        console.log(request)
        return Promise.reject("Invalid url")
    }
}


beforeEach(() => {
    mockedAxios.mockImplementation(validAxios)
    //mockedProof.mockReturnValue(secProof)
    mockedDecrypt.mockResolvedValue(hexToBuf(randomCoinSeed))
})

test("test verificationtool valid", async () => {
    const verificationtool = new Verificationtool()
    const electionData = await verificationtool.loadElectionData()
    expect(electionData.status).toBe("OK")
    expect((electionData as ResponseBeanOk<ElectionData>).value).toStrictEqual(ElectionData.fromJson(data.electionData))

    const login = await verificationtool.login(data.vid, data.nonce, data.password, data.c)
    expect(login.status).toBe("OK")
    expect((login as ResponseBeanOk<SecondDeviceLoginResponse>).value).toStrictEqual(SecondDeviceLoginResponse.fromJson(data.loginResponse))

    const finalMessage = await verificationtool.finalMessage()
    expect(finalMessage.status).toBe("OK")
    expect((finalMessage as ResponseBeanOk<SecondDeviceFinalMessage>).value).toStrictEqual(SecondDeviceFinalMessage.fromJson(data.finalMessage))

    const decodedBallot = await verificationtool.decodeBallot()
    expect(decodedBallot.status).toBe("OK")
    expect((decodedBallot as ResponseBeanOk<Uint8Array>).value).toStrictEqual(new Uint8Array([0, 0, 0, 1]))
})

test("test verificationtool fullLogin valid", async () => {
    const verificationtool = new Verificationtool()
    const decodedBallot = await verificationtool.fullLogin(data.vid, data.nonce, data.password, data.c)
    expect(decodedBallot.status).toBe("OK")
    expect((decodedBallot as ResponseBeanOk<Uint8Array>).value).toStrictEqual(new Uint8Array([0, 0, 0, 1]))
})

test("test invalid format", async () => {
    const invalidResponse = {
        status: "OK",
        data: {
            status: "OK",
            value: {a:1}
        }
    }
    const invalidResponseData = {
        status: "OK",
        data: {a:1}
    }
    const verificationtool = new Verificationtool()
    mockedAxios.mockResolvedValueOnce(invalidResponseData)
    const electionData = await verificationtool.loadElectionData()
    expect(electionData.status).toBe("ERROR")
    expect((electionData as ResponseBeanError).errorType).toBe(ErrorType.FORMAT)

    mockedAxios.mockResolvedValueOnce(invalidResponse)
    const login = await verificationtool.login(data.vid, data.nonce, data.password, data.c)
    expect(login.status).toBe("ERROR")
    expect((login as ResponseBeanError).errorType).toBe(ErrorType.FORMAT)

    await verificationtool.login(data.vid, data.nonce, data.password, data.c)
    mockedAxios.mockResolvedValueOnce(invalidResponse)
    const final = await verificationtool.finalMessage()
    expect(final.status).toBe("ERROR")
    expect((final as ResponseBeanError).errorType).toBe(ErrorType.FORMAT)
})

test("test backend error", async () => {
    const invalidResponse = {
        status: "OK",
        data: {
            status: "ERROR",
            value: {a:1}
        }
    }
    const verificationtool = new Verificationtool()

    mockedAxios.mockResolvedValueOnce(invalidResponse)
    const login = await verificationtool.login(data.vid, data.nonce, data.password, data.c)
    expect(login.status).toBe("ERROR")
    expect((login as ResponseBeanError).errorType).toBe(ErrorType.EXTERN)

    await verificationtool.login(data.vid, data.nonce, data.password, data.c)
    mockedAxios.mockResolvedValueOnce(invalidResponse)
    const final = await verificationtool.finalMessage()
    expect(final.status).toBe("ERROR")
    expect((final as ResponseBeanError).errorType).toBe(ErrorType.EXTERN)
})

test("invalid sdpp", async () => {
    const mockedSDPP = jest.spyOn(decrypt, "checkSecondDeviceParameters")
    mockedSDPP.mockResolvedValueOnce(false)
    const verificationtool = new Verificationtool()
    const login = await verificationtool.login(data.vid, data.nonce, data.password, data.c)
    expect(login.status).toBe("ERROR")
    expect((login as ResponseBeanError).errorType).toBe(ErrorType.SDPP)
    expect((login as ResponseBeanError).message).not.toBeDefined()
})

test("test signature error", async () => {
    const mockedSignature = jest.spyOn(sign, "checkSignature")
    mockedSignature.mockRejectedValueOnce(new Error("test"))
    const verificationtool = new Verificationtool()
    const login = await verificationtool.login(data.vid, data.nonce, data.password, data.c)
    expect(login.status).toBe("ERROR")
    expect((login as ResponseBeanError).errorType).toBe(ErrorType.BALLOT_ACK_FAIL)
    expect((login as ResponseBeanError).message).toBe("test")
})

test("test signature fail", async () => {
    const mockedSignature = jest.spyOn(sign, "checkSignature")
    mockedSignature.mockResolvedValueOnce(false)
    const verificationtool = new Verificationtool()
    const login = await verificationtool.login(data.vid, data.nonce, data.password, data.c)
    expect(login.status).toBe("ERROR")
    expect((login as ResponseBeanError).errorType).toBe(ErrorType.BALLOT_ACK)
    expect((login as ResponseBeanError).message).not.toBeDefined()
})

test("test qrDecrypt error", async () => {
    const mockedDecrypt = jest.spyOn(decrypt, "decrytQRCode")
    mockedDecrypt.mockRejectedValueOnce(new Error("test"))
    const verificationtool = new Verificationtool()
    const login = await verificationtool.login(data.vid, data.nonce, data.password, data.c)
    expect(login.status).toBe("ERROR")
    expect((login as ResponseBeanError).errorType).toBe(ErrorType.DECRYPT)
    expect((login as ResponseBeanError).message).toBe("test")
})

test("test checkZKP fail", async() => {
    const mockedZKP = jest.spyOn(decrypt, "checkZKP")
    mockedZKP.mockResolvedValueOnce(false)
    const verificationtool = new Verificationtool()
    await verificationtool.login(data.vid, data.nonce, data.password, data.c)
    const final = await verificationtool.finalMessage()
    expect(final.status).toBe("ERROR")
    expect((final as ResponseBeanError).errorType).toBe(ErrorType.ZKP_INV)
    expect((final as ResponseBeanError).message).not.toBeDefined()
})

test("test invalid order", async() => {
    const verificationtool = new Verificationtool()
    const final = await verificationtool.finalMessage()
    expect(final.status).toBe("ERROR")
    expect((final as ResponseBeanError).errorType).toBe(ErrorType.INVALID_OPERATION)
    expect((final as ResponseBeanError).message).not.toBeDefined()

    const decode = await verificationtool.decodeBallot()
    expect(decode.status).toBe("ERROR")
    expect((decode as ResponseBeanError).errorType).toBe(ErrorType.INVALID_OPERATION)
    expect((decode as ResponseBeanError).message).not.toBeDefined()
})

test("test error in fullLogin in login", async () => {
    const mockedSDPP = jest.spyOn(decrypt, "checkSecondDeviceParameters")
    mockedSDPP.mockResolvedValueOnce(false)
    const verificationtool = new Verificationtool()
    const login = await verificationtool.fullLogin(data.vid, data.nonce, data.password, data.c)
    expect(login.status).toBe("ERROR")
    expect((login as ResponseBeanError).errorType).toBe(ErrorType.SDPP)
    expect((login as ResponseBeanError).message).not.toBeDefined()
})

test("test error in fullLogin in finalMessage", async () => {
    const mockedZKP = jest.spyOn(decrypt, "checkZKP")
    mockedZKP.mockResolvedValueOnce(false)
    const verificationtool = new Verificationtool()
    const final = await verificationtool.fullLogin(data.vid, data.nonce, data.password, data.c)
    expect(final.status).toBe("ERROR")
    expect((final as ResponseBeanError).errorType).toBe(ErrorType.ZKP_INV)
    expect((final as ResponseBeanError).message).not.toBeDefined()
})

test("test connection error in fullLogin", async() => {
    mockedAxios.mockRejectedValueOnce("No comment")
    const verificationtool = new Verificationtool()
    const loginFail = await verificationtool.fullLogin(data.vid, data.nonce, data.password, data.c)
    expect(loginFail.status).toBe(ResponseBean.errorStatus)
    expect((loginFail as ResponseBeanError).errorType).toBe(ErrorType.CONNECTION)
})