// Zero-dependency static server for the built SPA.
// Serves ./dist, falls back to index.html for client-side routes.
import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST = join(__dirname, 'dist')
const PORT = process.env.PORT || 3000

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.map': 'application/json; charset=utf-8',
}

async function sendFile(res, filePath, status = 200) {
  const data = await readFile(filePath)
  const ext = extname(filePath)
  const isHashed = /\.[0-9a-f]{8,}\./.test(filePath)
  res.writeHead(status, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': isHashed ? 'public, max-age=31536000, immutable' : 'no-cache',
  })
  res.end(data)
}

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    // Prevent path traversal, then resolve within DIST
    const safe = normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
    let filePath = join(DIST, safe)

    if (urlPath === '/' || urlPath.endsWith('/')) {
      filePath = join(DIST, 'index.html')
    }

    try {
      const s = await stat(filePath)
      if (s.isDirectory()) filePath = join(filePath, 'index.html')
      await sendFile(res, filePath)
      return
    } catch {
      // Not a real file → SPA fallback to index.html
      await sendFile(res, join(DIST, 'index.html'), 200)
      return
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
    console.error(err)
  }
})

server.listen(PORT, () => {
  console.log(`UZBalance running on http://0.0.0.0:${PORT}`)
})
