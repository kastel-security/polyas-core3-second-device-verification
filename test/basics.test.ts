import {NumbersInRangeFromSeed, kdfCounterMode} from "../src/algorithms/basics"
import { bufToBn, hexToBuf, toUint8Array } from "../src/main/utils"
import crypto from "crypto"

Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: arr => crypto.randomBytes(arr.length),
    subtle: crypto.subtle
  }
});

test("testing numbers in range from seed", async () => {
    const seed = "xyz"
    const a1 = BigInt("1732501504205220402900929820446308723705652945081825598593993913145942097001127020633138020218038968109094917857329663184563374015879596834703721749398989648")
    const a4 = BigInt("1423259849467217711185874799515607842842602785767879766623736284680209832704638390900412597196948750015976271793930713744890547611655064835165883323889981463")
    const numbersInRange = new NumbersInRangeFromSeed(seed, a1 + BigInt(1))
    expect(await numbersInRange.getNextNumber()).toBe(a1)
    expect(await numbersInRange.getNextNumber()).toBe(a4)
})

test("testing kdfCounterMode", async () => {
    const seed = "kdk"
    const label = "label"
    const context = "context"
    const byteLength = 65
    const kdf = await kdfCounterMode(byteLength, toUint8Array(seed), label, context)
    expect(bufToBn(kdf)).toBe(BigInt("0x3288922A966533C793ED532045FFFC3CE6BA77F27E8F60C9A3D82221D86F51DDA00736DBA3F8AE1D94B17562E838D57FB85400D147C6E9585ED4D859E46120B275"))
})