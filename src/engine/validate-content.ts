import { THEMES } from '../content/types'
import type { Choice, ContentGraph, ContentNode, NodeId, Theme } from '../content/types'

export type ValidationCode =
  | 'invalid-shape'
  | 'invalid-id'
  | 'blank-text'
  | 'invalid-theme'
  | 'invalid-choice-count'
  | 'duplicate-choice-label'
  | 'duplicate-id'
  | 'invalid-entry-point'
  | 'duplicate-entry-point'
  | 'missing-destination'
  | 'unreachable-node'
  | 'cycle'
  | 'missing-pause'
  | 'no-pause-path'

export interface ValidationIssue {
  readonly code: ValidationCode
  readonly path: string
  readonly message: string
}

export type ValidationResult =
  | { readonly valid: true; readonly graph: ContentGraph; readonly issues: readonly [] }
  | { readonly valid: false; readonly issues: readonly ValidationIssue[] }

type ReportIssue = (code: ValidationCode, path: string, message: string) => void

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readId(value: unknown, path: string, report: ReportIssue): NodeId | undefined {
  if (typeof value !== 'string' || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value)) {
    report('invalid-id', path, 'Use a stable lowercase kebab-case ID, such as "fleeting-moments".')
    return undefined
  }
  return value
}

function readText(value: unknown, path: string, report: ReportIssue): string | undefined {
  if (typeof value !== 'string') {
    report('invalid-shape', path, 'Expected plain text.')
    return undefined
  }
  if (value.trim().length === 0) {
    report('blank-text', path, 'Text must not be empty or whitespace only.')
    return undefined
  }
  return value
}

function isTheme(value: unknown): value is Theme {
  return THEMES.some((theme) => theme === value)
}

function readChoice(value: unknown, path: string, report: ReportIssue): Choice | undefined {
  if (!isRecord(value)) {
    report('invalid-shape', path, 'Expected an answer with a label and next-node ID.')
    return undefined
  }
  const label = readText(value.label, `${path}.label`, report)
  const next = readId(value.next, `${path}.next`, report)
  return label !== undefined && next !== undefined ? { label, next } : undefined
}

function readChoices(
  value: unknown,
  path: string,
  report: ReportIssue,
): readonly [Choice, Choice] | undefined {
  if (!Array.isArray(value) || value.length !== 2) {
    report('invalid-choice-count', path, 'Every question must have exactly two answers.')
    return undefined
  }
  const first = readChoice(value[0], `${path}[0]`, report)
  const second = readChoice(value[1], `${path}[1]`, report)
  if (!first || !second) return undefined
  if (first.label.trim().toLowerCase() === second.label.trim().toLowerCase()) {
    report('duplicate-choice-label', path, 'Give the two answers distinct labels.')
    return undefined
  }
  return [first, second]
}

function readNode(value: unknown, path: string, report: ReportIssue): ContentNode | undefined {
  if (!isRecord(value)) {
    report('invalid-shape', path, 'Expected a question or pause object.')
    return undefined
  }
  const id = readId(value.id, `${path}.id`, report)
  const text = readText(value.text, `${path}.text`, report)
  if (value.kind === 'pause') {
    if ('choices' in value) {
      report(
        'invalid-shape',
        `${path}.choices`,
        'A pause ends a branch and must not define choices.',
      )
      return undefined
    }
    return id !== undefined && text !== undefined ? { kind: 'pause', id, text } : undefined
  }
  if (value.kind !== 'question') {
    report('invalid-shape', `${path}.kind`, 'Expected "question" or "pause".')
    return undefined
  }
  const theme = value.theme
  if (!isTheme(theme)) {
    report('invalid-theme', `${path}.theme`, `Choose one of: ${THEMES.join(', ')}.`)
  }
  const choices = readChoices(value.choices, `${path}.choices`, report)
  if (id === undefined || text === undefined || !isTheme(theme) || !choices) return undefined
  return { kind: 'question', id, text, theme, choices }
}

/**
 * Validates local authored data without mutating it. Shape and reference errors are
 * reported before graph analysis, so invalid links do not create misleading graph errors.
 */
export function validateContent(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = []
  const report: ReportIssue = (code, path, message) => {
    issues.push({ code, path, message })
  }
  if (!isRecord(input)) {
    report('invalid-shape', '$', 'Expected a content graph with nodes and entryPoints arrays.')
    return { valid: false, issues }
  }

  const nodes: ContentNode[] = []
  const entryPoints: NodeId[] = []
  if (!Array.isArray(input.nodes) || input.nodes.length === 0) {
    report('invalid-shape', 'nodes', 'Provide a non-empty array of questions and pauses.')
  } else {
    const rawNodes: readonly unknown[] = input.nodes
    for (const [index, value] of rawNodes.entries()) {
      const node = readNode(value, `nodes[${index}]`, report)
      if (node) nodes.push(node)
    }
  }
  if (!Array.isArray(input.entryPoints) || input.entryPoints.length === 0) {
    report('invalid-entry-point', 'entryPoints', 'Provide at least one starting question ID.')
  } else {
    const rawEntryPoints: readonly unknown[] = input.entryPoints
    for (const [index, value] of rawEntryPoints.entries()) {
      const id = readId(value, `entryPoints[${index}]`, report)
      if (id !== undefined) entryPoints.push(id)
    }
  }
  if (issues.length > 0) return { valid: false, issues }

  const byId = new Map<NodeId, { node: ContentNode; index: number }>()
  nodes.forEach((node, index) => {
    const previous = byId.get(node.id)
    if (previous) {
      report(
        'duplicate-id',
        `nodes[${index}].id`,
        `ID "${node.id}" is already used at nodes[${previous.index}].id.`,
      )
    } else {
      byId.set(node.id, { node, index })
    }
  })
  const entriesSeen = new Set<NodeId>()
  entryPoints.forEach((id, index) => {
    if (entriesSeen.has(id)) {
      report(
        'duplicate-entry-point',
        `entryPoints[${index}]`,
        `Starting question "${id}" is listed more than once.`,
      )
    }
    entriesSeen.add(id)
    if (byId.get(id)?.node.kind !== 'question') {
      report(
        'invalid-entry-point',
        `entryPoints[${index}]`,
        `"${id}" must identify an existing question, not a pause.`,
      )
    }
  })
  nodes.forEach((node, index) => {
    if (node.kind !== 'question') return
    node.choices.forEach((choice, choiceIndex) => {
      if (!byId.has(choice.next)) {
        report(
          'missing-destination',
          `nodes[${index}].choices[${choiceIndex}].next`,
          `"${choice.next}" does not identify an existing node.`,
        )
      }
    })
  })
  if (issues.length > 0) return { valid: false, issues }

  // Visit from every entry; a legitimate second starting point is not an orphan.
  const reachable = new Set<NodeId>()
  const pending = [...entryPoints]
  while (pending.length > 0) {
    const id = pending.pop()
    if (id === undefined || reachable.has(id)) continue
    reachable.add(id)
    const node = byId.get(id)?.node
    if (node?.kind === 'question') pending.push(...node.choices.map((choice) => choice.next))
  }
  nodes.forEach((node, index) => {
    if (!reachable.has(node.id)) {
      report(
        'unreachable-node',
        `nodes[${index}].id`,
        `"${node.id}" cannot be reached from any entry point.`,
      )
    }
  })

  // Only an edge back into the active path is a cycle. Completed shared branches are valid.
  const completed = new Set<NodeId>()
  const active = new Set<NodeId>()
  const trail: NodeId[] = []
  function visit(id: NodeId): void {
    if (completed.has(id)) return
    const item = byId.get(id)
    if (!item) return
    active.add(id)
    trail.push(id)
    if (item.node.kind === 'question') {
      item.node.choices.forEach((choice, choiceIndex) => {
        if (active.has(choice.next)) {
          const cycle = [...trail.slice(trail.indexOf(choice.next)), choice.next].join(' -> ')
          report(
            'cycle',
            `nodes[${item.index}].choices[${choiceIndex}].next`,
            `Cycle detected: ${cycle}. Link to a later question or a pause.`,
          )
        } else {
          visit(choice.next)
        }
      })
    }
    trail.pop()
    active.delete(id)
    completed.add(id)
  }
  nodes.forEach((node) => visit(node.id))

  // Work backward from pauses to detect trapped regions even if another branch can finish.
  const parents = new Map<NodeId, NodeId[]>()
  const canPause = new Set<NodeId>()
  const pauseQueue: NodeId[] = []
  nodes.forEach((node) => {
    if (node.kind === 'pause') {
      pauseQueue.push(node.id)
    } else {
      node.choices.forEach(({ next }) => {
        const incoming = parents.get(next) ?? []
        incoming.push(node.id)
        parents.set(next, incoming)
      })
    }
  })
  if (pauseQueue.length === 0) {
    report('missing-pause', 'nodes', 'Add a pause so an authored sequence has a stopping place.')
  }
  while (pauseQueue.length > 0) {
    const id = pauseQueue.pop()
    if (id === undefined || canPause.has(id)) continue
    canPause.add(id)
    pauseQueue.push(...(parents.get(id) ?? []))
  }
  nodes.forEach((node, index) => {
    if (node.kind === 'question' && !canPause.has(node.id)) {
      report('no-pause-path', `nodes[${index}].id`, `No path from "${node.id}" reaches a pause.`)
    }
  })

  return issues.length > 0
    ? { valid: false, issues }
    : { valid: true, graph: { nodes, entryPoints }, issues: [] }
}
