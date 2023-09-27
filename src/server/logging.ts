import { type Stats, promises as fs } from 'fs'
import { config } from 'dotenv'
import { generateReceipt } from '../public/receipt'

type ValidEnding = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB'
const endings = {
  B: 0,
  KB: 3,
  MB: 6,
  GB: 9,
  TB: 12,
  PB: 15
}

function getBytes (): number {
  const byteString = process.env.CAPACITY as string
  const groups = byteString.match(/([0-9]+)([A-Z]*)/)
  if (groups === null || groups.length < 3) {
    return 0
  }
  const ending = groups[2] as ValidEnding
  return Math.pow(10, endings[ending]) * (groups[1] as any as number)
}

async function logIfNotFull (info: string[]): Promise<void> {
  config()
  const basePath = 'logs/'
  const path = basePath + process.env.VITE_HASH
  const files: string[] = await fs.readdir(path)
    .then((content) => { return content })
    .catch(async () => {
      await fs.mkdir(path)
      return []
    })
  const asyncCalls: Array<Promise<Stats>> = new Array<Promise<Stats>>()
  files.forEach(function (file) {
    asyncCalls.push(fs.stat(path + '/' + file))
  })
  const allStats = await Promise.all(asyncCalls)
  let totalSize = 0
  allStats.forEach(function (stat) {
    totalSize = totalSize + stat.size
  })
  const newFile = info[3] + '.pdf'

  if (totalSize < getBytes() && !files.includes(newFile)) {
    const doc = generateReceipt(info)
    doc.save(path + '/' + newFile)
  } else if (files.includes(newFile)) {
    console.log('A hash collision of ballot fingerprints occured, or a voter verified the same ballot twice')
  }
}

export { logIfNotFull }
