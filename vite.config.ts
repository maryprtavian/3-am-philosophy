import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // The dashboard supplies CF_PAGES_URL for Git builds. Direct Upload builds can
  // set SITE_URL after the first deployment assigns an address.
  const address = env.SITE_URL || env.CF_PAGES_URL
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
