import { describe, expect, it } from 'vitest'
import { validateContent } from '../engine/validate-content'
import { content } from './library'
import { THEMES } from './types'
import type { ContentNode, NodeId } from './types'

const byId = new Map<NodeId, ContentNode>(content.nodes.map((node) => [node.id, node]))

interface Route {
  readonly questions: readonly NodeId[]
  readonly pause: NodeId
}

// Test-only enumeration: inspect every answer sequence, including branches that rejoin.
function routesFrom(id: NodeId, ancestors: ReadonlySet<NodeId> = new Set()): Route[] {
  if (ancestors.has(id)) throw new Error(`Cycle encountered while reviewing "${id}".`)
  const node = byId.get(id)
  if (!node) throw new Error(`Missing node "${id}" while reviewing a route.`)
  if (node.kind === 'pause') return [{ questions: [], pause: id }]

  const visited = new Set([...ancestors, id])
  return node.choices.flatMap((choice) =>
    routesFrom(choice.next, visited).map((route) => ({
      questions: [id, ...route.questions],
      pause: route.pause,
    })),
  )
}

describe('playable content library', () => {
  it('validates all collection files together, including global ID uniqueness', () => {
    const result = validateContent(content)
    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
  })

  it.each(content.entryPoints)('gives every %s route a complete sequence and a pause', (entry) => {
    // The deliberately shorter starter copy route remains a change of pace.
    const minimum = entry === 'perfect-copy' ? 3 : 4
    const maximum = entry === 'perfect-copy' ? 4 : 8
    const routes = routesFrom(entry)
    expect(routes.length).toBeGreaterThan(0)
    for (const route of routes) {
      const label = route.questions.join(' -> ')
      expect(route.questions.length, label).toBeGreaterThanOrEqual(minimum)
      expect(route.questions.length, label).toBeLessThanOrEqual(maximum)
      expect(byId.get(route.pause)?.kind, label).toBe('pause')
    }
  })

  it.each(content.entryPoints)('opens distinct follow-up questions from %s', (entry) => {
    const node = byId.get(entry)
    if (node?.kind !== 'question') throw new Error(`Entry "${entry}" must be a question.`)
    const [first, second] = node.choices
    expect(first.next).not.toBe(second.next)
    expect(byId.get(first.next)?.kind).toBe('question')
    expect(byId.get(second.next)?.kind).toBe('question')
  })

  it('only sends both answers to the same destination when the sequence is ending', () => {
    for (const node of byId.values()) {
      if (node.kind !== 'question') continue
      const [first, second] = node.choices
      if (first.next === second.next) {
        expect(byId.get(first.next)?.kind, `Both answers from "${node.id}"`).toBe('pause')
      }
    }
  })

  it('covers all five themes within the agreed v1 question budget', () => {
    const questions = content.nodes.filter((node) => node.kind === 'question')
    expect(questions.length).toBeGreaterThanOrEqual(40)
    expect(questions.length).toBeLessThanOrEqual(60)
    expect(new Set(questions.map((node) => node.theme))).toEqual(new Set(THEMES))
    const openingThemes = content.entryPoints.map((id) => {
      const node = byId.get(id)
      return node?.kind === 'question' ? node.theme : undefined
    })
    expect(new Set(openingThemes)).toEqual(new Set(THEMES))
  })

  it('does not repeat the same question under different IDs', () => {
    const questions = content.nodes.filter((node) => node.kind === 'question')
    const texts = questions.map((node) => node.text.trim().toLowerCase())
    expect(new Set(texts).size).toBe(texts.length)
  })
})
