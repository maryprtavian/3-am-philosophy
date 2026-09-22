# Implementation roadmap

The 3 A.M. Philosophy Button

Status: Steps 01–05 are complete. Step 06 is next. Research and the exploratory UI concept are complete.

This roadmap implements the decisions in [Design and technical direction](./design-and-technical-direction.md). Work through the steps in order. Each step should leave a working, reviewable result. Keep code changes focused, and add relevant tests alongside behavior rather than postponing all testing until the end.

## Fixed v1 scope

- One opening button, followed by one question and two equally prominent answers.
- Handwritten, connected branches across identity, time, reality, meaning, and connection.
- Approximately 40–60 questions, with thoughtful pauses and another rabbit hole available afterward.
- Responsive desktop and mobile UI, system-based light/dark appearance, keyboard and screen-reader support.
- Go back, leave the current thought, and browser Back/Forward behavior.
- Browser-local, temporary session state. Refresh begins a fresh visit.
- No accounts, scores, answer uploads, analytics, database, or generated-question service in v1.

## 01 — Establish the project foundation

Completed on 23 September 2026. See [implementation progress](./implementation-progress.md) for the
changes, environment notes, and verification results.

**Work**

- Inspect the current repository state and preserve the existing research documents.
- Scaffold React + TypeScript with Vite and npm in the project root.
- Choose compatible stable package releases and a supported Node LTS version at implementation time; document the version and commit the dependency lockfile.
- Configure strict TypeScript, ESLint, Prettier, and a sensible `.gitignore`.
- Establish a small source structure separating content, traversal logic, UI, and styles.
- Add development, build, preview, type-check, lint, and format-check commands.
- Write a short README with installation and local-run instructions.

**Done when:** a clean installation starts locally, the production build opens correctly, and the initial quality checks pass.

## 02 — Define the content contract

Completed on 23 September 2026. See [implementation progress](./implementation-progress.md) and the
[content authoring guide](./content-authoring.md).

**Work**

- Define types for stable question IDs, question text, two answer choices, destinations, entry points, themes, and pause nodes.
- Treat pauses separately from questions, so every actual question always has exactly two choices.
- Represent content as an explicit directed graph. Branches may rejoin; authored sequences should be acyclic in v1.
- Define editorial rules: short questions, balanced answer wording, a meaningful relationship between answer and destination, and no right/wrong or personality judgments.
- Implement content validation for duplicate IDs, missing destinations, blank text, invalid choice counts, invalid entry points, unreachable nodes, unintended cycles, and missing stopping places.
- Add Vitest and tests proving the validator catches malformed content.

**Done when:** a small valid graph passes and deliberately broken examples fail with actionable messages.

## 03 — Write the first complete rabbit hole

Completed on 23 September 2026. See [implementation progress](./implementation-progress.md) and the
[starter content review](./starter-content-review.md).

**Work**

- Develop the immortality example into a coherent opening sequence with roughly 4–8 questions along a path.
- Write both sides of each choice, including a natural pause and the invitation to explore again.
- Include a longer question and longer answer labels to exercise layout constraints.
- Add a small second entry path to exercise selection of another rabbit hole.
- Read through every possible path in this starter collection and run the content validator.

**Done when:** the starter content can support a complete visit, and each answer leads to a question that follows from the chosen position.

## 04 — Implement the branching engine

Completed on 23 September 2026. See [implementation progress](./implementation-progress.md) and the
[session engine guide](./session-engine.md).

**Work**

- Build pure transition functions and a small reducer for starting, answering, backtracking, leaving, and entering another rabbit hole.
- Randomize entry-point selection while following explicit links after an answer. Make entry selection controllable in tests.
- Prefer unvisited entry points during the current visit; handle exhaustion honestly without suggesting there is unlimited unseen content.
- Keep current position, session trail, and visited entries separate from question content.
- Clear abandoned forward history when someone goes back and chooses a different answer.
- Add behavioral tests for both answer paths, backtracking, restart, pause nodes, entry selection, and invalid actions.

**Done when:** the complete interaction works through tested logic without depending on rendered components.

## 05 — Build the first playable interface

Completed on 23 September 2026. See [implementation progress](./implementation-progress.md) and the
[first playable version notes](./first-playable.md).

**Work**

- Implement the welcome screen, question view, and pause view using the real engine and content.
- Keep exactly one interactive control on the welcome screen.
- Render two equal-emphasis answer buttons and quiet secondary navigation during a question.
- Add semantic headings, native buttons, visible focus, and a deliberate strategy for announcing new questions from the start.
- Render content as text rather than raw HTML.
- Add an initial Playwright smoke test covering entry, an answer, a pause, and another rabbit hole.

**Done when:** someone can complete a real visit in the browser without using developer controls.

**Milestone: first playable version.**

## 06 — Implement responsive layout and visual design

**Work**

- Establish CSS tokens for color, typography, spacing, control sizes, and motion, using CSS Modules for components.
- Implement the charcoal/ivory/amber appearance and the warm-paper variant following system preference.
- Use Georgia for questions and system sans-serif fonts for controls.
- Center a restrained reading region on desktop; stack answers on mobile and whenever longer labels need the space.
- Support widths down to 320 CSS pixels, short screens, landscape orientation, safe areas, and dynamic mobile browser chrome.
- Allow natural scrolling and text reflow; avoid locked heights and clipped content.
- Provide answer targets at least 52 pixels high and secondary targets at least 44 × 44 pixels.

**Done when:** welcome, question, and pause states work at 320, 375/390, 768, and 1440 pixels, including the longest starter content and both appearances.

## 07 — Finish navigation and interaction details

**Work**

- Integrate the browser History API with the same state transitions used by the UI.
- Verify browser Back/Forward, the in-app back control, leaving a thought, and changing an earlier answer.
- Keep answer data out of URLs. Define how stale history entries behave after a refresh so a fresh visit does not restore an inconsistent session.
- Preserve ordinary browser navigation at the session boundary; do not trap visitors inside the app.
- Add brief transitions and respect reduced-motion preferences.
- Prevent rapid clicks or repeated key activation during a transition from accidentally advancing several questions.
- Confirm focus remains useful after every transition and each question is announced once.

**Done when:** mouse, touch, keyboard, and browser navigation produce consistent outcomes, including rapid input and refresh.

**Milestone: one polished rabbit hole on phone and desktop.**

## 08 — Review the experience before expanding it

**Work**

- Walk through the first version without explaining how it works.
- Arrange a short tryout with a few people when available; provide the user with a preview and concise observation prompts rather than contacting anyone automatically.
- Observe whether people understand the opening button, consider both choices, recognize the connection between questions, and find back/leave controls.
- Review mobile reading comfort, question pacing, and whether the writing feels curious rather than judgmental.
- Record findings and fix the clearest usability or writing problems before expanding the content.
- If external feedback is unavailable, record that limitation and continue independent implementation work.

**Done when:** the initial review is recorded and any identified problems that would affect the rest of the content are addressed.

## 09 — Expand and review the question library

**Work**

- Grow the collection toward 40–60 questions across the five agreed themes.
- Add multiple entry points and controlled branch convergence to keep authoring manageable.
- Create deliberate pauses, generally after about 4–8 questions along a path.
- Review wording and each answer-to-question connection, including shared questions that have multiple incoming paths.
- Remove repetitive questions, misleading binary choices, and accidental philosophical conclusions.
- Run graph validation over the entire collection and walk representative complete paths from every entry point.

**Done when:** the full collection is coherent, all nodes are reachable, every destination resolves, and every entry can reach a natural stopping place.

## 10 — Complete accessibility and browser verification

**Work**

- Add axe-core scans to meaningful Playwright states rather than scanning only the welcome page.
- Exercise the main journeys in Chromium, Firefox, and WebKit.
- Manually check keyboard operation, visible focus, screen-reader announcements, contrast, zoom, reflow, and reduced motion.
- Check both appearances, long content, narrow and short screens, and answer target dimensions.
- Smoke-test real iOS Safari and Android Chrome when devices are available; record which devices were actually tested.
- Fix identified defects and keep regression tests for significant behavior failures.

**Done when:** automated checks pass and manual findings are resolved or explicitly recorded. Emulation must not be reported as real-device testing.

## 11 — Prepare the production build

**Work**

- Inspect the optimized build on a throttled mobile connection and measure its asset sizes.
- Aim for roughly 150 KB or less of compressed initial JavaScript; investigate unnecessary dependencies if it exceeds the target.
- Verify answering questions requires no additional network requests.
- Add a useful error fallback and no-JavaScript message.
- Add the final page title, description, favicon, and social preview assets/metadata. Set URL-dependent metadata once the deployment address is known.
- Check production asset paths and refresh behavior.

**Done when:** the built site loads reliably, remains responsive during use, has correct metadata, and meets the agreed performance target or has a documented reason to revise it.

## 12 — Complete repository and release automation

**Work**

- Ensure all appropriate checks are runnable locally through documented npm scripts; add these scripts as their tools are introduced in earlier steps.
- Configure GitHub Actions when the remote repository is available.
- Run lockfile-based installation, type checks, lint, format checks, content/logic tests, browser tests, and the production build in CI.
- Document how to add questions, validate links, run tests, and create a release.
- Keep a concise record of implementation decisions that materially affect future changes.

**Done when:** a clean checkout can reproduce the build and CI catches broken content or behavior before a release.

## 13 — Deploy and verify the preview

**Work**

- Connect the repository to Cloudflare Pages using the intended account when available.
- Configure the build command and generated output directory, HTTPS, and appropriate static asset caching.
- Deploy a preview from the release candidate.
- Run the essential journeys against the hosted build, including refresh, Back/Forward, both appearances, mobile layout, and asset loading.
- Confirm metadata references the correct address and the deployment can be traced to a commit.
- Establish how to restore the previous successful deployment.

**Done when:** there is a working hosted preview and the hosted checks pass.

## 14 — Launch v1

**Work**

- Resolve remaining release-blocking issues and record any non-blocking limitations.
- Publish the intended production deployment after the release candidate is ready for review.
- Configure a custom domain only if one is wanted and available; the hosting address is sufficient for v1.
- Repeat a short smoke check against the actual production URL.
- Record the release commit, production URL, and rollback procedure.

**Done when:** the production app is publicly reachable over HTTPS and its essential journeys work on the deployed version.

**Milestone: v1 live.**

## 15 — Handoff and maintain

**Work**

- Provide the live URL, local development instructions, test results, content-authoring guidance, and any remaining limitations.
- Keep a short backlog based on observed problems and user feedback.
- Add future question collections through the same validation and review process.
- Update dependencies deliberately and run the established checks for each update.
- Consider features such as sharing, saved paths, sound, or generated questions only through a later scope decision.

**Done when:** another developer can run, modify, test, and release the app using the repository documentation.

## Execution notes

- Research and Steps 01–05 are complete. Step 06 is the next implementation step.
- Keep code, content, and related tests together in reviewable changes. Use milestone reviews after steps 05, 07, 13, and 14.
- Content editing can progress alongside independent UI work once the content contract is stable; the overall acceptance sequence remains the same.
- External inputs may be needed for feedback participants, physical test devices, repository access, hosting access, and an optional custom domain. Record unavailable inputs honestly and continue work that does not depend on them.
- Do not claim release checks, user research, or physical-device testing have been completed until they have actually been performed.
