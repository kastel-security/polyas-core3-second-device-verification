import { type ProofGenerator, ProofGeneratorImpl, ProofGeneratorMock } from '../algorithms/proof'
import dataTest from '../mock/data.json'
import dataUI from '../mock/extended.json'
import { Comm, CommMock, type Communication } from './communication'
const k = '0373744f99d31509eb5f8caaabc0cc3fab70e571a5db4d762020723b9cd6ada260'
const g = '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
const q = 'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141'
const decodingK = 80
const pointLength = 66
const plaintextBlockSize = 31
type Modes = 'mock' | 'dev' | 'deploy' | 'test'
class EnvironmentVariables {
  public mode: Modes
  public electionUrl: string
  public backendUrl: string
  public fingerprint: string
  public proofGen: ProofGenerator
  public comm: Communication
  public static instance: EnvironmentVariables
  public static init (mode: Modes): EnvironmentVariables {
    this.instance = new EnvironmentVariables()
    this.instance.mode = mode
    console.log('mode', mode)
    if (mode === 'mock') {
      console.log('mocked')
      this.instance.proofGen = new ProofGeneratorMock(BigInt(dataUI.challenge.challenge), BigInt(dataUI.challenge.challengeRandomCoin))
      this.instance.comm = new CommMock(dataUI)
    }
    if (mode === 'test') {
      this.instance.proofGen = new ProofGeneratorMock(BigInt(dataTest.challenge.challenge), BigInt(dataTest.challenge.challengeRandomCoin))
      this.instance.comm = new CommMock(dataTest)
    } else if (mode === 'dev') {
      this.instance.proofGen = new ProofGeneratorImpl()
      this.instance.comm = new Comm()
    } else if (mode === 'deploy') {
      this.instance.proofGen = new ProofGeneratorImpl()
      this.instance.comm = new Comm()
    }
    return this.instance
  }
}
export { k, g, q, pointLength, plaintextBlockSize, decodingK, EnvironmentVariables }
