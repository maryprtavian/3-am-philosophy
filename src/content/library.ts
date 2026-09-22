import { immortalityContent } from './collections/immortality.ts'
import { perfectCopyContent } from './collections/perfect-copy.ts'
import type { ContentGraph } from './types'

/** The authored starter library. Validate this combined export in library.test.ts. */
export const content = {
  entryPoints: [...immortalityContent.entryPoints, ...perfectCopyContent.entryPoints],
  nodes: [...immortalityContent.nodes, ...perfectCopyContent.nodes],
} as const satisfies ContentGraph
