import { immortalityContent } from './collections/immortality.ts'
import { perfectCopyContent } from './collections/perfect-copy.ts'
import { perfectDreamContent } from './collections/perfect-dream.ts'
import { borrowedHourContent } from './collections/borrowed-hour.ts'
import { unheardSongContent } from './collections/unheard-song.ts'
import { wordlessWorldContent } from './collections/wordless-world.ts'
import type { ContentGraph } from './types.ts'

/** The authored v1 library. Validate this combined export in library.test.ts. */
export const content = {
  entryPoints: [
    ...immortalityContent.entryPoints,
    ...perfectCopyContent.entryPoints,
    ...perfectDreamContent.entryPoints,
    ...borrowedHourContent.entryPoints,
    ...unheardSongContent.entryPoints,
    ...wordlessWorldContent.entryPoints,
  ],
  nodes: [
    ...immortalityContent.nodes,
    ...perfectCopyContent.nodes,
    ...perfectDreamContent.nodes,
    ...borrowedHourContent.nodes,
    ...unheardSongContent.nodes,
    ...wordlessWorldContent.nodes,
  ],
} as const satisfies ContentGraph
