import { describe, expect, it } from 'vitest'
import { exampleContent } from '../content/example'
import type { ContentGraph, ContentNode, PauseNode, QuestionNode } from '../content/types'
import { THEMES } from '../content/types'
import { validateContent } from './validate-content'
import type { ValidationCode } from './validate-content'

function question(id = 'start', first = 'pause', second = 'pause'): QuestionNode {
  return {
    kind: 'question',
    id,
    theme: 'meaning',
    text: 'Can something matter if it is forgotten?',
    choices: [
      { label: 'It mattered in the moment.', next: first },
      { label: 'Something needs to remain.', next: second },
    ],
  }
}

const pause: PauseNode = { kind: 'pause', id: 'pause', text: 'You can leave this one open.' }

function graph(...nodes: ContentNode[]): ContentGraph {
  return { entryPoints: ['start'], nodes: nodes.length ? nodes : [question(), pause] }
}

function withQuestion(fields: Record<string, unknown>) {
  return { ...graph(), nodes: [{ ...question(), ...fields }, pause] }
}

function expectIssue(input: unknown, code: ValidationCode, path: string) {
  const result = validateContent(input)
  expect(result.valid).toBe(false)
  const issue = result.issues.find(
    (candidate) => candidate.code === code && candidate.path === path,
  )
  expect(issue, `Expected ${code} at ${path}`).toBeDefined()
  expect(issue?.message).toMatch(/\S/)
  return result
}

describe('valid content', () => {
  it('accepts the authored example with distinct first branches and a shared pause', () => {
    expect(validateContent(exampleContent)).toEqual({
      valid: true,
      graph: exampleContent,
      issues: [],
    })
  })

  it('accepts converging question branches without mistaking them for a cycle', () => {
    const content = graph(
      question('start', 'left', 'right'),
      question('left', 'shared', 'pause'),
      question('right', 'shared', 'pause'),
      question('shared'),
      pause,
    )
    expect(validateContent(content).valid).toBe(true)
  })

  it('checks reachability from all entry points and permits their branches to rejoin', () => {
    const content = {
      entryPoints: ['start', 'another-start'],
      nodes: [question(), question('another-start'), pause],
    }
    expect(validateContent(content).valid).toBe(true)
  })

  it.each(THEMES)('accepts the %s theme', (theme) => {
    expect(validateContent(withQuestion({ theme })).valid).toBe(true)
  })

  it('preserves Unicode text and does not mutate or reuse the source objects', () => {
    const content = withQuestion({ text: 'Ի՞նչն է մեզ դարձնում մարդ։ 🌙' })
    const original = structuredClone(content)
    const result = validateContent(content)
    expect(content).toEqual(original)
    expect(result.valid).toBe(true)
    if (!result.valid) throw new Error('Expected a valid graph')
    expect(result.graph).toEqual(content)
    expect(result.graph.nodes).not.toBe(content.nodes)
    expect(result.graph.nodes[0]).not.toBe(content.nodes[0])
  })
})

describe('content shape and wording', () => {
  it.each([null, undefined, 42, 'graph', []])('rejects a non-object graph: %j', (input) => {
    expectIssue(input, 'invalid-shape', '$')
  })

  it.each([undefined, null, {}, []])('rejects missing or empty nodes: %j', (nodes) => {
    expectIssue({ ...graph(), nodes }, 'invalid-shape', 'nodes')
  })

  it.each([undefined, null, 'start', []])('rejects missing or empty entries: %j', (entryPoints) => {
    expectIssue({ ...graph(), entryPoints }, 'invalid-entry-point', 'entryPoints')
  })

  it('rejects non-object nodes', () => {
    expectIssue({ ...graph(), nodes: [null, pause] }, 'invalid-shape', 'nodes[0]')
  })

  it('rejects holes in a nodes array rather than silently changing diagnostic indexes', () => {
    const nodes = [question(), pause]
    Reflect.deleteProperty(nodes, '0')
    expectIssue({ ...graph(), nodes }, 'invalid-shape', 'nodes[0]')
  })

  it('rejects holes in an entry-point array', () => {
    const entryPoints = ['start', 'start']
    Reflect.deleteProperty(entryPoints, '1')
    expectIssue({ ...graph(), entryPoints }, 'invalid-id', 'entryPoints[1]')
  })

  it.each(['', ' Start', 'Start', 'start_here', 'start--here', '1-start'])(
    'rejects an unstable ID: %j',
    (id) => {
      expectIssue(withQuestion({ id }), 'invalid-id', 'nodes[0].id')
    },
  )

  it('rejects a missing node ID', () => {
    expectIssue(withQuestion({ id: undefined }), 'invalid-id', 'nodes[0].id')
  })

  it('rejects unknown node kinds and themes', () => {
    expectIssue(withQuestion({ kind: 'ending' }), 'invalid-shape', 'nodes[0].kind')
    expectIssue(withQuestion({ theme: 'destiny' }), 'invalid-theme', 'nodes[0].theme')
  })

  it.each(['', ' \n\t '])('rejects blank question and pause text: %j', (text) => {
    expectIssue(withQuestion({ text }), 'blank-text', 'nodes[0].text')
    expectIssue(graph(question(), { ...pause, text }), 'blank-text', 'nodes[1].text')
  })

  it.each([undefined, 12, null])('rejects non-string question text: %j', (text) => {
    expectIssue(withQuestion({ text }), 'invalid-shape', 'nodes[0].text')
  })

  it.each([undefined, null, {}, [], [1], [1, 2, 3]])(
    'requires exactly two choices: %j',
    (choices) => {
      expectIssue(withQuestion({ choices }), 'invalid-choice-count', 'nodes[0].choices')
    },
  )

  it('validates choice objects, labels, and destination IDs', () => {
    const second = question().choices[1]
    expectIssue(withQuestion({ choices: [null, second] }), 'invalid-shape', 'nodes[0].choices[0]')
    expectIssue(
      withQuestion({ choices: [{ next: 'pause' }, second] }),
      'invalid-shape',
      'nodes[0].choices[0].label',
    )
    expectIssue(
      withQuestion({ choices: [{ label: ' ', next: 'pause' }, second] }),
      'blank-text',
      'nodes[0].choices[0].label',
    )
    expectIssue(
      withQuestion({ choices: [{ label: 'Yes', next: '' }, second] }),
      'invalid-id',
      'nodes[0].choices[0].next',
    )
  })

  it('rejects indistinguishable answer labels regardless of case and outer whitespace', () => {
    const choices = [
      { label: 'Yes', next: 'pause' },
      { label: ' yes ', next: 'pause' },
    ]
    expectIssue(withQuestion({ choices }), 'duplicate-choice-label', 'nodes[0].choices')
  })

  it('does not allow a pause to hide outgoing choices', () => {
    const content = { ...graph(), nodes: [question(), { ...pause, choices: [] }] }
    expectIssue(content, 'invalid-shape', 'nodes[1].choices')
  })

  it('reports multiple field errors together and defers misleading graph errors', () => {
    const result = validateContent(withQuestion({ id: '', text: ' ', theme: 'unknown' }))
    expect(result.issues.map(({ code }) => code)).toEqual([
      'invalid-id',
      'blank-text',
      'invalid-theme',
    ])
  })
})

describe('references', () => {
  it('identifies both locations of a duplicate node ID', () => {
    const result = expectIssue(graph(question(), pause, question()), 'duplicate-id', 'nodes[2].id')
    expect(result.issues[0]?.message).toBe('ID "start" is already used at nodes[0].id.')
  })

  it('rejects duplicate starting questions', () => {
    expectIssue(
      { ...graph(), entryPoints: ['start', 'start'] },
      'duplicate-entry-point',
      'entryPoints[1]',
    )
  })

  it.each(['missing', 'pause'])('rejects an entry that is not a question: %s', (id) => {
    expectIssue({ ...graph(), entryPoints: [id] }, 'invalid-entry-point', 'entryPoints[0]')
  })

  it('reports the exact broken answer link before analyzing the graph', () => {
    const result = expectIssue(
      graph(question('start', 'missing'), pause),
      'missing-destination',
      'nodes[0].choices[0].next',
    )
    expect(result.issues.every(({ code }) => code === 'missing-destination')).toBe(true)
    expect(result.issues[0]?.message).toBe('"missing" does not identify an existing node.')
  })
})

describe('graph integrity', () => {
  it('reports unreachable questions and pauses', () => {
    const content = graph(question(), pause, question('orphan'), { ...pause, id: 'unused-pause' })
    expectIssue(content, 'unreachable-node', 'nodes[2].id')
    expectIssue(content, 'unreachable-node', 'nodes[3].id')
  })

  it('rejects a self-loop even when the other answer leads to a pause', () => {
    const result = expectIssue(
      graph(question('start', 'start'), pause),
      'cycle',
      'nodes[0].choices[0].next',
    )
    expect(result.issues[0]?.message).toContain('start -> start')
  })

  it('reports the path around a multi-question cycle with an exit', () => {
    const content = graph(question('start', 'later'), question('later', 'start'), pause)
    const result = expectIssue(content, 'cycle', 'nodes[1].choices[0].next')
    expect(result.issues[0]?.message).toContain('start -> later -> start')
    expect(result.issues.some(({ code }) => code === 'no-pause-path')).toBe(false)
  })

  it('does not let a successful branch hide a different trapped branch', () => {
    const content = graph(question('start', 'trap'), question('trap', 'trap', 'trap'), pause)
    expectIssue(content, 'no-pause-path', 'nodes[1].id')
    const result = validateContent(content)
    expect(result.issues).not.toContainEqual(
      expect.objectContaining({ code: 'no-pause-path', path: 'nodes[0].id' }),
    )
  })

  it('rejects cycles even in unreachable content', () => {
    const content = graph(question(), pause, question('orphan', 'orphan', 'orphan'))
    expectIssue(content, 'unreachable-node', 'nodes[2].id')
    expectIssue(content, 'cycle', 'nodes[2].choices[0].next')
    expectIssue(content, 'no-pause-path', 'nodes[2].id')
  })

  it('reports a missing stopping place and questions that cannot finish', () => {
    const content = graph(question('start', 'start', 'start'))
    expectIssue(content, 'missing-pause', 'nodes')
    expectIssue(content, 'no-pause-path', 'nodes[0].id')
  })
})
