import axios from 'axios'
import { type SecretProof } from '../classes/ballot'
import { ElectionData, SecondDeviceFinalMessage, SecondDeviceLoginResponse } from '../classes/communication'
import { ErrorType } from './error'
import data from '../mock/data.json'

type ResponseStatus = 'OK' | 'ERROR'
abstract class ResponseBean<T> { // eslint-disable-line 
  public static readonly errorStatus = 'ERROR'
  public static readonly okStatus = 'OK'
  public readonly status
  public constructor (status: ResponseStatus) {
    this.status = status
  }
}

class ResponseBeanError extends ResponseBean<any> {
  public constructor (public readonly errorType: ErrorType, public readonly message?: string) {
    super(ResponseBean.errorStatus)
  }
}

class ResponseBeanOk<T> extends ResponseBean<T> {
  public constructor (public readonly value: T) {
    super(ResponseBean.okStatus)
  }
}

interface Communication {
  electionData: () => Promise<ResponseBean<ElectionData>>
  login: (voterId: string, nonce: string, password: string, challenge: string) => Promise<ResponseBean<SecondDeviceLoginResponse>>
  challenge: (token: string, proof: SecretProof) => Promise<ResponseBean<SecondDeviceFinalMessage>>
  logReceipt: (info: string[]) => Promise<void>
}

class Comm implements Communication {
  protected readonly baseHeader: any
  private static readonly responseOk: ResponseStatus = 'OK'
  public constructor () {
    this.baseHeader = {
      'Content-Type': 'text/plain'
    }
  }

  private async resolveFail (errorType: ErrorType, msg?: string): Promise<ResponseBeanError> {
    return await Promise.resolve(new ResponseBeanError(errorType, msg))
  }

  public async electionData (): Promise<ResponseBean<ElectionData>> {
    return await axios.request({
      url: '/electionData',
      method: 'get',
      headers: this.baseHeader
    })
      .then(async (response) => {
        try {
          const electionData = ElectionData.fromJson(response.data)
          console.log(electionData)
          return await Promise.resolve(new ResponseBeanOk<ElectionData>(electionData))
        } catch (error: any) {
          return await this.resolveFail(ErrorType.FORMAT, error.message)
        }
      }).catch(async (error: any) => {
        return await Promise.resolve(this.resolveFail(ErrorType.CONNECTION, error))
      })
  }

  public async login (voterId: string, nonce: string, password: string, challenge: string): Promise<ResponseBean<SecondDeviceLoginResponse>> {
    if (challenge.length % 2 !== 0) {
      challenge = '0' + challenge
    }
    return await axios.request({
      url: '/login',
      method: 'post',
      data: {
        voterId,
        nonce,
        password,
        challengeCommitment: challenge
      },
      headers: this.baseHeader
    })
      .then(async (response) => {
        if (response.data.status !== Comm.responseOk) {
          return await this.resolveFail(ErrorType.EXTERN, response.data.error)
        }
        try {
          const secondDeviceLoginResponse = SecondDeviceLoginResponse.fromJson(response.data.value)
          return await Promise.resolve(new ResponseBeanOk(secondDeviceLoginResponse))
        } catch (error: any) {
          return await this.resolveFail(ErrorType.FORMAT, error.message)
        }
      })
      .catch(async (error: any) => {
        return await Promise.resolve(this.resolveFail(ErrorType.CONNECTION, error.message))
      })
  }

  public async challenge (token: string, proof: SecretProof): Promise<ResponseBean<SecondDeviceFinalMessage>> {
    const header = this.baseHeader
    header.AuthToken = token
    return await axios.request({
      url: '/challenge',
      method: 'post',
      headers: header,
      data: {
        challenge: proof.e.toString(10),
        challengeRandomCoin: proof.r.toString(10)
      }
    })
      .then(async (response) => {
        if (response.data.status !== Comm.responseOk) {
          return await this.resolveFail(ErrorType.EXTERN, response.data.error)
        }
        try {
          const finalMessage = SecondDeviceFinalMessage.fromJson(response.data.value)
          return await Promise.resolve(new ResponseBeanOk(finalMessage))
        } catch (error: any) {
          return await this.resolveFail(ErrorType.FORMAT, error.message)
        }
      })
      .catch(async (error: any) => {
        return await Promise.resolve(this.resolveFail(ErrorType.CONNECTION, error.message))
      })
  }

  public async logReceipt (info: string[]): Promise<void> {
    const header = {
      'Content-Type': 'application/json'
    }
    await axios.request({
      url: '/log',
      method: 'post',
      headers: header,
      data: {
        info: info
      }
    })
  }
}

class CommMock implements Communication {
  public async electionData (): Promise<ResponseBean<ElectionData>> {
    const electionData = ElectionData.fromJson(data.electionData)
    return await Promise.resolve(new ResponseBeanOk<ElectionData>(electionData))
  }

  public async login (voterId: string, nonce: string, c: string, challenge: string): Promise<ResponseBean<SecondDeviceLoginResponse>> {
    const loginResponse = SecondDeviceLoginResponse.fromJson(data.loginResponse)
    return await Promise.resolve(new ResponseBeanOk<SecondDeviceLoginResponse>(loginResponse))
  }

  public async challenge (token: string, proof: SecretProof): Promise<ResponseBeanOk<SecondDeviceFinalMessage>> {
    const finalMessage = SecondDeviceFinalMessage.fromJson(data.finalMessage)
    return await Promise.resolve(new ResponseBeanOk<SecondDeviceFinalMessage>(finalMessage))
  }

  public async logReceipt (info: string[]): Promise<void> {
  }
}

export { type Communication, Comm, CommMock, ResponseBean, ResponseBeanError, ResponseBeanOk }
