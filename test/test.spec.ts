import { Bee, Utils } from '@ethersphere/bee-js'
import FS from 'fs'
import { join } from 'path'
import { MantarayNode } from '../src'
import type { Reference } from '../src/types'

const batchId = 'e583912358f3d0842db20bc79799df53d5a6db843560d1a1148bc422b42cd59b'
const bee = new Bee('http://127.0.0.1:1633')

const uploadData = async (data: Uint8Array): Promise<string> => (await bee.uploadData(batchId, data)).reference
const saveFunction = async (data: Uint8Array): Promise<Reference> => Utils.hexToBytes(await uploadData(data))

const utf8ToBytes = (value: string): Uint8Array =>  new TextEncoder().encode(value)

it('should generate the same content hash as Bee', async () => {
  const beeUploadResult = await bee.uploadFilesFromDirectory(batchId, join(__dirname, 'testpage'), {
    pin: true,
    indexDocument: 'index.html',
  })
  console.log(`beeUploadResult.reference: ${beeUploadResult.reference}`)
  expect(beeUploadResult.reference).toEqual('3852fad95bc4c59b4ed5f767705658b41444d5aaec7241e958f92e6ed95d2e1b')

  const testPage = join(__dirname, 'testpage')
  const indexHtmlBytes = FS.readFileSync(join(testPage, 'index.html'))
  const imageBytes = FS.readFileSync(join(testPage, 'img', 'icon.png'))

  const iNode = new MantarayNode()
  iNode.addFork(utf8ToBytes('index.html'), await saveFunction(indexHtmlBytes), {
    'Content-Type': 'text/html; charset=utf-8',
    Filename: 'index.html',
  })
  iNode.addFork(utf8ToBytes('img/icon.png'), await saveFunction(imageBytes), {
    'Content-Type': 'image/png',
    Filename: 'icon.png',
  })
  iNode.addFork(utf8ToBytes('/'), new Uint8Array(32) as Reference, {
    'website-index-document': 'index.html',
  })
  const iNodeRef = await iNode.save(saveFunction)
  console.log('iNodeRef:', Utils.bytesToHex(iNodeRef))

  expect(iNodeRef).toEqual(Utils.hexToBytes(beeUploadResult.reference)) // FAILS
})
