# Full library review

Step 09, 23 September 2026.

The v1 library contains **51 questions, six openings, and eight pauses**. Four new collections add
32 questions to the 19-question starter set. Every new route takes four questions before a pause.
The original immortality paths remain four or five questions; the copy route remains the deliberate
three-question change of pace retained in the Step 08 review.

## Inventory

| Collection / opening ID | Opening theme | Questions | Pauses | Questions per route | Complete answer sequences |
| ----------------------- | ------------- | --------- | ------ | ------------------- | ------------------------- |
| `immortality`           | Time          | 14        | 3      | 4–5                 | 18                        |
| `perfect-copy`          | Identity      | 5         | 1      | 3                   | 8                         |
| `perfect-dream`         | Reality       | 8         | 1      | 4                   | 16                        |
| `borrowed-hour`         | Time          | 8         | 1      | 4                   | 16                        |
| `unheard-song`          | Meaning       | 8         | 1      | 4                   | 16                        |
| `wordless-world`        | Connection    | 8         | 1      | 4                   | 16                        |
| Total                   | Five themes   | 51        | 8      | 3–5                 | 90                        |

There are **90 complete answer sequences across 46 distinct question paths**. Final answers that
share a pause remain separate sequences. The [route inventory](./library-route-inventory.md)
records all of them, grouped by question path. This is a snapshot for editorial review; the tests
enumerate the current graph on every run.

| Question theme | Count |
| -------------- | ----- |
| Identity       | 9     |
| Time           | 11    |
| Reality        | 8     |
| Meaning        | 9     |
| Connection     | 14    |

Themes describe each question's main concern, not separate silos. The copy opening is now tagged
identity to reflect its question about personhood; its wording and branches are unchanged. All
five themes now have at least one opening.

## Editorial direction

- **Perfect dream:** choosing comfort or waking leads into surprise, evidence, other people,
  goodbyes, and how much uncertainty one can accept. The questions describe hypothetical worlds;
  the app does not claim to establish what is real for the reader.
- **Borrowed hour:** the impossible time loan becomes a question about attention, waiting,
  urgency, and who chooses how time is spent. This adds a different emphasis from immortality's
  endings, memory, and repetition.
- **Unheard song:** beauty without a listener leads into intention, authorship, making things,
  differing interpretations, and meaning that is hard to explain.
- **Words and silence** (`wordless-world`): tone, literal language, borrowed feelings, and invented
  words lead into understanding and whether communication needs a recipient.

Reviewed all question/answer pairs and incoming links. The two positions invite exploration;
they do not diagnose a belief, award correctness, or deliver a verdict at the pause. Questions
remain plain text, with no request to send answers anywhere. Only the opening is randomized.

The art route's shared final question concerns a painting that changes when understood. That lets
it follow perspectives about both creating and interpreting art, without suddenly requiring the
reader to have become the artist. The second answer to the sole-listener question explicitly
expresses doubt about beauty, so both labels answer the question before the branch develops it.

No exact duplicate question text was found. Related subjects are retained where they explore a
different issue: copying a person's identity differs from communicating a feeling; forgetting a
life differs from deciding whether a dream experience counts. The original long memory question
and answer pair remain the maximum-length case in the library, at 154 and 66 characters.

## Shared-question review

The five existing shared questions retain the reasoning recorded in the
[starter review](./starter-content-review.md). The twelve new shared questions were checked from
every incoming answer, including the paths in which the question challenges the chosen position.

| Shared question         | Incoming positions and connection                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dream-storm`           | Contentment without surprise; lack of control as evidence of waking. Both can examine whether an imperfect experience feels more convincing than a perfect one.          |
| `dream-goodbye`         | Independence, risk, or shared experience makes a world feel real. A goodbye tests whether that sense of reality carries into a relationship.                             |
| `dream-evidence`        | Surprise, pain, or agreement fails to prove reality. The next issue is how long to keep looking for certainty.                                                           |
| `clockless-room`        | Watching purchased time disappear; wanting to skip waits. Removing the clock challenges how much the measurement contributes to the feeling of lost time.                |
| `unhurried-day`         | Wanting to notice more; preferring a personal pace; valuing an accidental conversation while resenting the delay. Each can distinguish more time from less hurry.        |
| `hour-ownership`        | Attention becoming a chore; needing a shared rhythm; finding purpose in an unplanned delay. Each raises whether time needs to be under one's control to feel one's own.  |
| `private-purpose`       | Intention matters; one listener can be enough. The question asks whether the act of making can matter apart from its result.                                             |
| `unfinished-work`       | The maker belongs to the work; making can be enough; one's interpretation is worth retaining. A changing painting tests where completion lies when meaning keeps moving. |
| `meaning-without-words` | Meeting art independently of its maker; wanting a result worth keeping; considering someone else's hearing. Each can ask how much explanation a sense of value needs.    |
| `useful-silence`        | Missing the room for hints; willingness to share a feeling directly. Both lead to communication without literal words.                                                   |
| `being-known`           | A translation can carry intention; explicit expression matters; naming a feeling creates a starting point. Each leads to perfect understanding versus ongoing attempts.  |
| `unanswered-message`    | Personal expression matters; silence can communicate; a shared word may hide different feelings. A letter without a reader tests the role of reception.                  |

Each new pause fits both possible final questions and both final answers. It invites reflection
without resolving the dilemma. The Step 08 interface derives the actual final question from the
active trail, so shared pauses do not need to duplicate or guess its text.

## Verification

- The content validator accepts the combined graph: IDs and answer labels are valid, destinations
  resolve, every node is reachable, every route ends, and no cycle is present.
- Content tests automatically include every registered opening, check route length and distinct
  branches, reject duplicate question text, and enforce the agreed v1 question budget and themes.
- Engine tests traverse all 90 answer sequences, verify each authored edge, and exercise Back,
  Forward, and another opening from every ending. These are logic tests, not participant feedback.
- The browser journey now completes all six collections before expecting revisit wording. A
  separate history check confirms a newly tried opening remains tried after going back to a pause.
- Eight new layout scenarios visit **every new question and pause at 320 pixels**, in both themes.
  Three paths per collection cover all its nodes; a coverage assertion detects missing nodes if
  its branching changes. Existing tests still cover the longest library content, desktop, tablet,
  phone, landscape, short screens, and enlarged text.
- Representative complete paths from every entry run in desktop/light and mobile/dark Chromium.
  New first-answer routes were also read in the in-app phone preview, including their retained
  final questions and the final revisit state. Visual review includes new narrow-screen captures.

The combined quality gate passes **117 unit tests and 56 browser tests**, TypeScript, ESLint,
formatting, and the production build. Production assets are **76.77 kB gzip** of JavaScript and
**1.79 kB gzip** of CSS. No dependencies, runtime services, or application controls were added.

This is an authored-content review with automated and in-app verification. External participant
feedback remains pending. Step 10 covers the wider browser and accessibility audit, including
Firefox/WebKit, axe checks, and manual assistive-technology and device checks where available.
