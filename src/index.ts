import { MantarayNode as MantarayNodeV0_2 } from './node-v0_2'
import { MantarayNode as MantarayNodeV1 } from './node-v1'
import { Bytes, MarshalVersion } from './types'
import { gen32Bytes } from './utils'

/** On the returned Mantaray node you can set either its entry or add fork to it */
export function initManifestNode<Version extends MarshalVersion>(options?: {
  obfuscationKey?: Bytes<32>
  version?: Version
}): MantarayNode<Version> {
  const obfuscationKey: Bytes<32> = options?.obfuscationKey || gen32Bytes()
  const version: MarshalVersion = options?.version ? options!.version : '1.0'

  if (version === '0.2') {
    const manifestNode0_2 = new MantarayNodeV0_2()
    manifestNode0_2.setObfuscationKey = obfuscationKey

    return manifestNode0_2 as MantarayNode<Version>
  }

  if (version === '1.0') {
    const manifestNode1_0 = new MantarayNodeV1()
    manifestNode1_0.obfuscationKey = obfuscationKey

    return manifestNode1_0 as MantarayNode<Version>
  }

  throw new Error('Not implemented')
}

export type MantarayNode<Version extends MarshalVersion | undefined = undefined> = Version extends '0.2'
  ? MantarayNodeV0_2
  : Version extends '1.0'
  ? MantarayNodeV1
  : Version extends undefined
  ? MantarayNodeV0_2 | MantarayNodeV1
  : never

export * as MantarayV0_2 from './node-v0_2'
export * from './types'
export * as Utils from './utils'
export * as MantarayV1 from './node-v1'
