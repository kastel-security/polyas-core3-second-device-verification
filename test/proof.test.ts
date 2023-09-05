import {ProofGeneratorImpl, ProofGeneratorMock} from "../src/algorithms/proof"
import data from "../src/mock/data.json"
import crypto from "crypto"

Object.defineProperty(globalThis, 'crypto', {
    value: {
      getRandomValues: arr => crypto.randomBytes(arr.length),
      subtle: crypto.subtle
    }
  });


test("test generateRandomProof terminates", () => {
  const proofGen = new ProofGeneratorImpl()
  const randomProof = proofGen.generateProof()
})

test("test generateSecretProof", () => {
  const e = BigInt("108039209026641834721998202775536164454916176078442584841940316235417705823230")
  const r = BigInt("44267717001895006656767798790813376597351395807170189462353830054915294464906")
  const c = BigInt("0x030e1a9be2459151057e9d731b524ca435f1c05bc0a95d3d82b30512d306172b17")
  const proofGen = new ProofGeneratorMock(e, r)
  const proof = proofGen.generateProof()
  expect(proof.c).toBe(c)
})

