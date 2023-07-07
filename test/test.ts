import { ProjectivePoint } from "@noble/secp256k1";

test("a", () => {
    let k = ProjectivePoint.fromHex("01")
})
/*
const generateSecretProof = require("../app/algorithms")

test('Testing Ballot transformation', () => {
    console.log("test")
    const expectC = BigInt("0x030e1a9be2459151057e9d731b524ca435f1c05bc0a95d3d82b30512d306172b17")
    const e = BigInt("0x108039209026641834721998202775536164454916176078442584841940316235417705823230")
    const r = BigInt("0x44267717001895006656767798790813376597351395807170189462353830054915294464906")
    expect(generateSecretProof(e, r).c).toStrictEqual(expectC)
})
*/