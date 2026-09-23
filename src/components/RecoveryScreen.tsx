import { useEffect, useRef } from 'react'

export default function RecoveryScreen() {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus(), [])

  return (
    <main className="recovery-panel" aria-labelledby="recovery-title">
      <p>3 A.M. Philosophy</p>
      <h1 id="recovery-title" ref={heading} tabIndex={-1}>
        A small interruption.
      </h1>
      <p>We couldn’t open this thought. Check your connection and try again.</p>
      <p>Reloading starts a fresh visit.</p>
      <a href="">Reload and begin again</a>
    </main>
  )
}
