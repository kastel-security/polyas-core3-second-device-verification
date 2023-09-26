// functions for transforming Uint8Array to bigint taken from
// https://coolaj86.com/articles/convert-js-bigints-to-typedarrays/

function bufToHex (buf: Uint8Array): string {
  const hex: string[] = []
  const u8 = Uint8Array.from(buf)

  u8.forEach(function (i) {
    let h = i.toString(16)
    if (h.length % 2 === 1) { h = '0' + h }
    hex.push(h)
  })

  return hex.join('')
}

function numberToBuf (input: number): Uint8Array {
  if (input === 0) {
    return new Uint8Array(0)
  }
  const length = Math.ceil((Math.log2(input) + 1) / 8)
  const buf = new Uint8Array(length)
  let shift = 1
  for (let t = 0; t < length; t++) {
    buf[t] = input % (shift * 256) / shift
    shift = shift * 256
  }
  return buf
}

function bufToNumber (input: Uint8Array): number {
  let output = 0
  for (let t = 0; t < input.length; t++) {
    output = output + input[t] * Math.pow(256, input.length - t - 1)
  }
  return output
}

function hexToBuf (hex: string, addLeadingZero?: boolean): Uint8Array {
  if (hex.length % 2 === 1) { hex = '0' + hex }

  const len = hex.length / 2
  let u8 = new Uint8Array(len)

  let i = 0
  let j = 0
  while (i < len) {
    u8[i] = parseInt(hex.slice(j, j + 2), 16)
    i += 1
    j += 2
  }
  if (u8[0] >= 128 && addLeadingZero === true) {
    u8 = new Uint8Array([0, ...u8])
  }
  return u8
}

function bufToBn (buf: Uint8Array): bigint {
  return BigInt('0x0' + bufToHex(buf))
}

/**
 * Transforms different data types to an Uint8Array
 * @param input The data to be transfored
 * @param length
 * @returns
 */
function toUint8Array (input: string | Uint8Array | number | bigint, length?: number): Uint8Array {
  let bytesOfInput: Uint8Array
  if (input instanceof Uint8Array) {
    bytesOfInput = input
  } else if (typeof input === 'string') {
    const utf8Encode = new TextEncoder()
    bytesOfInput = utf8Encode.encode(input)
  } else if (typeof input === 'number') {
    bytesOfInput = numberToBuf(input)
  } else {
    bytesOfInput = hexToBuf(input.toString(16), true)
  }
  if (length === undefined) {
    return bytesOfInput
  } else if (length < bytesOfInput.length) {
    return bytesOfInput.subarray(0, length)
  } else {
    return new Uint8Array([...new Uint8Array(length - bytesOfInput.length), ...bytesOfInput])
  }
}

function decodeBase64 (enc: string): Uint8Array {
  const dec = atob(enc.replaceAll('-', '+').replaceAll('_', '/'))
  const bytes = new Array<number>()
  for (let i = 0; i < dec.length; i++) {
    bytes.push(dec.charCodeAt(i))
  }
  return new Uint8Array(bytes)
}

export { hexToBuf, bufToBn, toUint8Array, bufToHex, bufToNumber, decodeBase64 }
