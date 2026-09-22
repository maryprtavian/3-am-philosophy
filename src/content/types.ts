export const THEMES = ['identity', 'time', 'reality', 'meaning', 'connection'] as const

export type Theme = (typeof THEMES)[number]

/** Stable lowercase kebab-case identifier, checked by validateContent. */
export type NodeId = string

export interface Choice {
  readonly label: string
  readonly next: NodeId
}

export interface QuestionNode {
  readonly kind: 'question'
  readonly id: NodeId
  readonly theme: Theme
  readonly text: string
  readonly choices: readonly [Choice, Choice]
}

export interface PauseNode {
  readonly kind: 'pause'
  readonly id: NodeId
  readonly text: string
  readonly choices?: never
}

export type ContentNode = QuestionNode | PauseNode

export interface ContentGraph {
  readonly entryPoints: readonly NodeId[]
  /** An array preserves duplicate IDs so the validator can report them. */
  readonly nodes: readonly ContentNode[]
}
