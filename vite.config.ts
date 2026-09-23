import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Workers does not supply CF_PAGES_URL. Use the confirmed stable site address
  // for production builds; explicit SITE_URL still supports a future domain change.
  const address =
    env.SITE_URL ||
    env.CF_PAGES_URL ||
    (mode === 'production' ? 'https://3-am-philosophy.maryprtavian.workers.dev/' : undefined)
  let siteUrl: string | undefined
  if (address) {
    const parsed = new URL(address)
    if (
      parsed.protocol !== 'https:' ||
      parsed.username ||
      parsed.password ||
      parsed.pathname !== '/' ||
      parsed.search ||
      parsed.hash
    ) {
      throw new Error(
        'SITE_URL must be an HTTPS site origin, without credentials, a path, query, or fragment.',
      )
    }
    siteUrl = parsed.href
  }

  return {
    plugins: [
      react(),
      {
        name: 'site-metadata',
        transformIndexHtml() {
          if (!siteUrl) return []
          const image = new URL('social-card.png', siteUrl).href
          return [
            { tag: 'link', attrs: { rel: 'canonical', href: siteUrl } },
            { tag: 'meta', attrs: { property: 'og:url', content: siteUrl } },
            { tag: 'meta', attrs: { property: 'og:image', content: image } },
            { tag: 'meta', attrs: { name: 'twitter:image', content: image } },
          ]
        },
      },
    ],
  }
})
