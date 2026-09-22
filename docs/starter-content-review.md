# Starter content review

Reviewed on 23 September 2026 during Step 03. This records an editorial review of authored data, not
a user tryout or browser interaction test.

## Library

`src/content/library.ts` combines two collections into the single `content` export. The minimal
`exampleContent` remains a separate contract example and is not included in the library.

| Entry          | Questions in collection | Pauses | Questions per visit | Complete answer sequences |
| -------------- | ----------------------- | ------ | ------------------- | ------------------------- |
| `immortality`  | 14                      | 3      | 4–5                 | 18                        |
| `perfect-copy` | 5                       | 1      | 3                   | 8                         |
| Total          | 19                      | 4      | —                   | 26                        |

A sequence records every selected answer, including the final answer leading to a pause. Two
sequences can visit the same questions and pause while choosing different final answers.

## Editorial decisions

- Keep the original immortality question and its two starting positions. The skeptical position
  explores endings and experience; the optimistic position explores memory and continuity.
- Follow each answer with a question that develops or challenges it without claiming that the
  reader has contradicted themselves.
- Rejoin branches only at questions that make sense from both incoming positions. End with a pause
  rather than a philosophical verdict.
- Keep the copy collection shorter so a later session can offer a distinct second entry.
- Invite the reader to stay with the thought or explore another rabbit hole in each pause. The
  actual restart control will be implemented with the UI.
- Refine `shared-promise` to distinguish remembering one of the original person's promises from
  agreeing to it independently.
- Refine the second `forgotten-kindness` answer to express what might be lost without a memory,
  rather than only a wish for recognition.

## Route review

All 26 full question/answer sequences were enumerated and read, including both final answers. A
means the first answer and B the second. Rows group routes with the same intermediate questions;
the final alternatives were reviewed individually.

| Entry        | Answer sequences reviewed | Focus of the continuation                                                                                         |
| ------------ | ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Immortality  | AAAAA, AAAAB              | Endings make moments precious → notice the ordinary → many Tuesdays → awareness of repetition                     |
| Immortality  | AAAB                      | Endings make moments precious → notice the ordinary → prefer one extraordinary night                              |
| Immortality  | AABAA, AABAB              | An ending overwhelms the evening → control over an immortal life → awareness of repetition                        |
| Immortality  | AABB                      | An ending overwhelms the evening → endless time remains troubling even with a choice                              |
| Immortality  | ABAA, ABAB                | Personal experience is enough → a perfect unwitnessed day → kindness whose effect outlasts memory                 |
| Immortality  | ABBA, ABBB                | Sharing matters → another person's different recollection of the same day                                         |
| Immortality  | BAAA, BAAB                | Willingness to become someone new → identifying with remembered life → obligations to a forgotten self            |
| Immortality  | BABA, BABB                | Willingness to become someone new → identifying with the life actually lived → changing values by losing a memory |
| Immortality  | BBAA, BBAB                | Fear of losing the self → keeping happy memories → whether relief is worth changing what matters                  |
| Immortality  | BBBA, BBBB                | Fear of losing the self → keeping explanatory memories → obligations when continuity is interrupted               |
| Perfect copy | AAA, AAB                  | Another self → one private memory creates difference → competing claims to a name                                 |
| Perfect copy | ABA, ABB                  | Another self → difference takes more than a memory → whether remembered promises carry obligations                |
| Perfect copy | BAA, BAB                  | Someone new → inherited friendships → whether obligations are inherited too                                       |
| Perfect copy | BBA, BBB                  | Someone new → friendships must be rebuilt → whether a name must also be claimed anew                              |

## Shared-question checks

| Shared question    | Incoming positions                                                                        | Why it can follow either position                                                             |
| ------------------ | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `worth-repeating`  | Prefer many ordinary Tuesdays; immortality feels different with control over its duration | Both lead to experiencing familiarity over time                                               |
| `stranger-promise` | Identify with remembered life; protect memories that explain the self                     | Both expose the boundary between memory, identity, and responsibility when memories disappear |
| `memory-price`     | Identify with the life actually lived; protect the happiest memories                      | Both can be challenged by asking whether changing memory also changes what matters            |
| `shared-name`      | A small difference creates a new person; a copy must build its own friendships            | Both raise the question of separate people making claims to a shared past                     |
| `shared-promise`   | A small difference does not end continuity; relationships belong to both selves           | Both invite the question of whether obligations continue or need fresh agreement              |

## Long-content case for later layout work

`keeping-memories` deliberately contains the longest question and answer labels in the starter
library: the question is 154 characters and the longest answer is 66 characters. Exercise it when
building the question view and responsive layout. The copy is reviewed here; its rendering has
not yet been verified because the question UI belongs to later steps.

## Automated checks

`src/content/library.test.ts` imports the combined `content` export and:

- Runs the Step 02 validator over the full collection, including global ID uniqueness.
- Enumerates all routes with guards against missing nodes and cycles.
- Checks that immortality routes contain 4–8 questions and copy routes contain 2–4. The current
  observed lengths are 4–5 and 3 respectively.
- Checks that both opening answers lead to distinct follow-up questions.
- Checks that two answers share an immediate destination only when it is a pause.

All 65 tests passed: 59 validator tests and six library tests. TypeScript, ESLint, Prettier, and the
production build also passed. These tests protect structure and pacing; editorial quality still
needs feedback when the first playable interface exists.
