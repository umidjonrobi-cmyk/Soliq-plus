// Static server for the built SPA, plus a small file-upload API backed by a
// Railway persistent volume (no external storage / no Supabase dependency).
//
// Volume: attach a volume in Railway → Settings → Volumes, mount path e.g.
// "/data". Railway then sets RAILWAY_VOLUME_MOUNT_PATH automatically and
// files written there survive redeploys. Locally it falls back to ./data.
import http from 'node:http'
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises'
import { join, extname, normalize, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { parseMultipart } from './lib/multipart.js'
import { handleIntegration } from './lib/integrations-server.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST = join(__dirname, 'dist')
const PORT = process.env.PORT || 3000

const VOLUME_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || join(__dirname, 'data')
const UPLOAD_DIR = join(VOLUME_DIR, 'uploads')
const INDEX_FILE = join(VOLUME_DIR, 'index.json')
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024 // 20 MB per file

// Extensions allowed for upload. SVG/HTML are excluded — served same-origin,
// they could otherwise execute script in the browser.
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt'])
const INLINE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'])

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.map': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

await mkdir(UPLOAD_DIR, { recursive: true })

// ── metadata index (id, original name, size, type) ─────────────────────────
async function readIndex() {
  try {
    return JSON.parse(await readFile(INDEX_FILE, 'utf8'))
  } catch {
    return []
  }
}
async function appendIndex(entry) {
  const list = await readIndex()
  list.unshift(entry)
  await writeFile(INDEX_FILE, JSON.stringify(list, null, 2))
  return list
}

// ── static file serving ─────────────────────────────────────────────────────
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

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj)
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(body)
}

async function readBody(req, limit) {
  const len = Number(req.headers['content-length'] || 0)
  if (len && len > limit) {
    const err = new Error('Payload too large')
    err.status = 413
    throw err
  }
  const chunks = []
  let received = 0
  for await (const chunk of req) {
    received += chunk.length
    if (received > limit) {
      const err = new Error('Payload too large')
      err.status = 413
      throw err
    }
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

// ── /api/upload ──────────────────────────────────────────────────────────────
async function handleUpload(req, res) {
  const contentType = req.headers['content-type'] || ''
  if (!contentType.startsWith('multipart/form-data')) {
    return sendJSON(res, 400, { error: 'Expected multipart/form-data' })
  }

  let body
  try {
    body = await readBody(req, MAX_UPLOAD_BYTES)
  } catch (err) {
    return sendJSON(res, err.status || 400, { error: err.message })
  }

  const parts = parseMultipart(body, contentType)
  const filePart = parts.find((p) => p.filename)
  if (!filePart) return sendJSON(res, 400, { error: 'No file field found' })

  const ext = extname(filePart.filename).toLowerCase()
  if (!ALLOWED_EXT.has(ext)) {
    return sendJSON(res, 415, { error: `File type ${ext || '(none)'} not allowed` })
  }

  const id = randomUUID()
  const storedName = id + ext
  await writeFile(join(UPLOAD_DIR, storedName), filePart.data)

  const entry = {
    id,
    storedName,
    name: filePart.filename,
    mime: filePart.contentType || MIME[ext] || 'application/octet-stream',
    size: filePart.data.length,
    uploadedAt: new Date().toISOString(),
  }
  await appendIndex(entry)

  sendJSON(res, 201, { ok: true, ...entry, url: `/files/${storedName}` })
}

// ── /files/:storedName ───────────────────────────────────────────────────────
async function handleServeFile(res, name) {
  const safe = basename(name) // strips any path components — no traversal
  if (!safe || safe !== name) return sendJSON(res, 400, { error: 'Invalid filename' })

  const ext = extname(safe).toLowerCase()
  const filePath = join(UPLOAD_DIR, safe)

  let data
  try {
    data = await readFile(filePath)
  } catch {
    return sendJSON(res, 404, { error: 'Not found' })
  }

  const disposition = INLINE_EXT.has(ext) ? 'inline' : 'attachment'
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Disposition': disposition,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'private, max-age=3600',
  })
  res.end(data)
}

// ── router ───────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0])

    if (req.method === 'POST' && urlPath === '/api/upload') {
      return await handleUpload(req, res)
    }
    if (req.method === 'POST' && urlPath === '/api/integration') {
      let payload
      try {
        const raw = await readBody(req, 512 * 1024)
        payload = JSON.parse(raw.toString('utf8'))
      } catch {
        return sendJSON(res, 400, { ok: false, message: 'Invalid JSON' })
      }
      const result = await handleIntegration(payload)
      return sendJSON(res, result.ok ? 200 : 200, result)
    }
    if (req.method === 'GET' && urlPath === '/api/uploads') {
      return sendJSON(res, 200, await readIndex())
    }
    if (req.method === 'GET' && urlPath.startsWith('/files/')) {
      return await handleServeFile(res, urlPath.slice('/files/'.length))
    }

    // Static SPA assets
    const safe = normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
    let filePath = join(DIST, safe)
    if (urlPath === '/' || urlPath.endsWith('/')) {
      filePath = join(DIST, 'index.html')
    }

    try {
      const s = await stat(filePath)
      if (s.isDirectory()) filePath = join(filePath, 'index.html')
      await sendFile(res, filePath)
    } catch {
      // Not a real file → SPA fallback to index.html
      await sendFile(res, join(DIST, 'index.html'), 200)
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
    console.error(err)
  }
})

server.listen(PORT, () => {
  console.log(`UZBalance running on http://0.0.0.0:${PORT}`)
  console.log(`Volume dir: ${VOLUME_DIR}`)
})
