import { readFile, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const files = []
for (const path of await readdir('dist', { recursive: true })) {
  const fullPath = join('dist', path)
  if ((await stat(fullPath)).isFile()) {
    const data = await readFile(fullPath)
    files.push({ path, bytes: data.length, gzipBytes: gzipSync(data).length })
  }
}

const compressedSize = (extension) =>
  files
    .filter((file) => file.path.endsWith(extension))
    .reduce((sum, file) => sum + file.gzipBytes, 0)
const javascript = compressedSize('.js')
console.log(
  JSON.stringify(
    {
      files: files.length,
      totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
      javascriptGzipBytes: javascript,
      cssGzipBytes: compressedSize('.css'),
      javascriptBudgetBytes: 150_000,
    },
    null,
    2,
  ),
)
if (javascript > 150_000) throw new Error('JavaScript exceeds the 150 KB gzip budget.')
if (files.length > 1000 || files.some((file) => file.bytes > 25 * 1024 * 1024)) {
  throw new Error('Build exceeds Cloudflare Pages dashboard upload limits.')
}
