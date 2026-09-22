# Content contract and authoring guide

Step 2 defines how a collection is written and checked. The small collection in
`src/content/example.ts` demonstrates the contract and is kept separate from the playable data.
Step 3 adds the authored library in `src/content/library.ts`, combining the immortality and perfect
copy collections from `src/content/collections/`.

## Structure

The types live in `src/content/types.ts`. Author collections with `as const satisfies ContentGraph`
to get immediate TypeScript feedback without losing their literal IDs.

A graph contains `entryPoints` and `nodes`. Nodes are stored in an array rather than an object keyed
by ID, so a duplicated ID cannot silently overwrite an earlier question.

| Field              | Rule                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `entryPoints`      | A non-empty list of distinct IDs that refer to questions                                   |
| `nodes`            | A non-empty array of questions and pauses                                                  |
| `id`               | Globally unique within the collection; stable lowercase kebab-case, starting with a letter |
| Question `kind`    | The literal `question`                                                                     |
| Question `theme`   | `identity`, `time`, `reality`, `meaning`, or `connection`                                  |
| Question `text`    | Non-blank plain text                                                                       |
| Question `choices` | Exactly two answers, in display order                                                      |
| Answer `label`     | Non-blank plain text; the two labels must differ after trimming and ignoring case          |
| Answer `next`      | The ID of an existing question or pause                                                    |
| Pause `kind`       | The literal `pause`                                                                        |
| Pause `text`       | Non-blank plain text that gives the visitor a stopping place                               |
| Pause `choices`    | Not allowed; navigation to another rabbit hole is a UI/session action                      |

For example, `immortality-meaning` is a valid ID; `Immortality`, `question_1`, and IDs containing spaces
are not. IDs are strings in TypeScript; their format and existence are checked by the validator.
Keep an ID stable while editing wording, and update every incoming link if an ID must change.

```ts
import type { ContentGraph } from './types'

export const collection = {
  entryPoints: ['forgotten-moment'],
  nodes: [
    {
      kind: 'question',
      id: 'forgotten-moment',
      theme: 'meaning',
      text: 'If you forgot a beautiful evening, would it still have been worth living?',
      choices: [
        { label: 'It mattered while it happened.', next: 'leave-it-open' },
        { label: 'Something needs to remain.', next: 'leave-it-open' },
      ],
    },
    {
      kind: 'pause',
      id: 'leave-it-open',
      text: 'You can leave this one open.',
    },
  ],
} as const satisfies ContentGraph
```

This minimal example ends after one question. The playable collection should develop its questions
into longer sequences; not every choice should immediately lead to a pause.

## Connections

- Both answers should lead to deliberately chosen destinations, not unrelated random questions.
- Branches may rejoin a shared question or pause. Rejoining a completed branch is not a cycle.
- Multiple starting questions are allowed. Every node must be reachable from at least one of them.
- Authored v1 graphs are acyclic: an answer must never link back into an earlier part of its path.
  This rule also rejects a loop that has an optional exit.
- Include at least one pause. Every question must have a path to a pause; an unrelated pause
  elsewhere in the graph does not make a trapped branch valid.
- Two answers may lead to the same pause at the end of a sequence. Shared follow-up questions must
  make sense from every incoming answer.

## Writing rules

1. Ask one clear, strange question at a time. Prefer a short sentence that reads comfortably on a
   phone; keep answer labels short enough to compare easily.
2. Make both answers plausible positions. Match their tone and specificity, and avoid presenting
   either as more intelligent, moral, or correct.
3. Treat the two answers as two directions to explore, not an exhaustive classification of belief.
4. Read each question together with its incoming answer. The next question should develop or
   challenge that position in a way the reader can follow.
5. Avoid personality labels, diagnoses, scores, and claims that the app has discovered a truth about
   the person answering.
6. End with room for reflection. A pause should not declare a correct philosophical conclusion.
7. Store plain text only. The UI will render it as text rather than interpret markup.

Wording quality and the meaning of a connection require editorial review. Validation checks the
structure; it cannot establish that a question is thoughtful or an answer is balanced.

## Validate a collection

`validateContent` in `src/engine/validate-content.ts` accepts an unknown value and returns a
discriminated result. It does not modify the input or coerce invalid values.

```ts
const result = validateContent(collection)

if (result.valid) {
  // result.graph is a checked ContentGraph, reconstructed from the declared fields.
} else {
  // Each issue provides a stable code, a field path, and an explanation.
  // Example: nodes[0].choices[1].next — "missing-question" does not identify an existing node.
}
```

The validator proceeds in three phases:

1. Check field shapes, IDs, text, themes, and the two-answer contract.
2. Check duplicate IDs, entry points, and answer destinations.
3. Check reachability, cycles, and paths to pauses.

Fix errors in earlier phases before expecting graph diagnostics. This prevents a broken destination
from producing a cascade of misleading reachability errors. All errors found within a phase are
returned together.

Run `npm test` for the validator and library tests or `npm run test:watch` while editing. `npm run check` also
runs the tests before building. On the initial Windows setup, use the bundled npm workaround in the
README if the global launcher fails.

`src/content/library.test.ts` validates the complete `content` export, checks route lengths, and
checks that choices branch before reaching a pause. Add future collections to `src/content/library.ts`
so they are included in that check. Adding an unrelated export alone does not register it for
validation. The validator tests separately retain the minimal `exampleContent` fixture.

See [starter content review](./starter-content-review.md) for the first library's route inventory,
editorial decisions, and long-content case for later layout checks.
