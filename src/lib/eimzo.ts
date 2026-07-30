// E-IMZO (ERI) client — talks to the E-IMZO desktop app running on the USER's
// machine over a localhost WebSocket (CAPIWS protocol). The private key (.pfx)
// never leaves the user's computer: E-IMZO signs locally and returns only the
// PKCS#7 result. Nothing here touches our server.
//
// This is why it works with zero backend and zero secrets on our side.

const ENDPOINTS = [
  'wss://127.0.0.1:64443/service/cryptapi',
  'ws://127.0.0.1:64646/service/cryptapi',
]

type Pending = {
  resolve: (data: any) => void
  reject: (err: Error) => void
}

export class EimzoError extends Error {}

class EimzoClient {
  private ws: WebSocket | null = null
  private queue: Pending[] = []
  private connecting: Promise<WebSocket> | null = null

  /** True once a live socket exists. */
  get connected() {
    return this.ws?.readyState === WebSocket.OPEN
  }

  private open(url: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      let settled = false
      let ws: WebSocket
      try {
        ws = new WebSocket(url)
      } catch (e) {
        reject(e as Error)
        return
      }
      const timer = window.setTimeout(() => {
        if (!settled) {
          settled = true
          try {
            ws.close()
          } catch {
            /* ignore */
          }
          reject(new EimzoError('timeout'))
        }
      }, 4000)

      ws.onopen = () => {
        if (settled) return
        settled = true
        window.clearTimeout(timer)
        resolve(ws)
      }
      ws.onerror = () => {
        if (settled) return
        settled = true
        window.clearTimeout(timer)
        reject(new EimzoError('connect-failed'))
      }
      ws.onclose = () => {
        // Fail any in-flight calls.
        this.ws = null
        const err = new EimzoError('socket-closed')
        this.queue.splice(0).forEach((p) => p.reject(err))
      }
      ws.onmessage = (ev) => {
        const pending = this.queue.shift()
        if (!pending) return
        try {
          pending.resolve(JSON.parse(ev.data))
        } catch {
          pending.reject(new EimzoError('bad-response'))
        }
      }
    })
  }

  async connect(): Promise<void> {
    if (this.connected) return
    if (this.connecting) {
      await this.connecting
      return
    }
    this.connecting = (async () => {
      let lastErr: Error | null = null
      for (const url of ENDPOINTS) {
        try {
          this.ws = await this.open(url)
          return this.ws
        } catch (e) {
          lastErr = e as Error
        }
      }
      throw lastErr ?? new EimzoError('connect-failed')
    })()
    try {
      await this.connecting
    } finally {
      this.connecting = null
    }
  }

  /** Low-level CAPIWS call. Responses are matched FIFO (E-IMZO replies in order). */
  call(plugin: string, name: string, args: unknown[] = []): Promise<any> {
    if (!this.connected) return Promise.reject(new EimzoError('not-connected'))
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject })
      this.ws!.send(JSON.stringify({ plugin, name, arguments: args }))
    })
  }

  disconnect() {
    try {
      this.ws?.close()
    } catch {
      /* ignore */
    }
    this.ws = null
  }
}

export const eimzo = new EimzoClient()

// ── Certificate model ────────────────────────────────────────────────────────
export type Certificate = {
  disk: string
  path: string
  name: string
  alias: string
  /** Parsed from the alias string */
  cn: string
  tin: string
  pinfl: string
  org: string
  serialNumber: string
  validFrom: string
  validTo: string
  expired: boolean
}

/** The alias is a comma-separated key=value list, e.g. "cn=...,tin=...,t=...". */
function parseAlias(alias: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const pair of alias.split(',')) {
    const i = pair.indexOf('=')
    if (i === -1) continue
    out[pair.slice(0, i).trim().toLowerCase()] = pair.slice(i + 1).trim()
  }
  return out
}

function toCertificate(raw: any): Certificate {
  const a = parseAlias(raw.alias || '')
  const validTo = a.validto || a.validTo || ''
  const expired = validTo ? new Date(validTo.replace(/\./g, '-')) < new Date() : false
  return {
    disk: raw.disk,
    path: raw.path,
    name: raw.name,
    alias: raw.alias || '',
    cn: a.cn || a.o || a.name || raw.name || '',
    tin: a.tin || a.inn || '',
    pinfl: a.pinfl || a.jshshir || '',
    org: a.o || a.organization || '',
    serialNumber: a.serialnumber || a.serialNumber || '',
    validFrom: a.validfrom || '',
    validTo,
    expired,
  }
}

/** List certificates E-IMZO can see on disk + tokens. */
export async function listCertificates(): Promise<Certificate[]> {
  await eimzo.connect()
  const res = await eimzo.call('pfx', 'list_all_certificates')
  if (!res?.success) throw new EimzoError(res?.reason || 'list-failed')
  const certs = (res.certificates || []) as any[]
  return certs.map(toCertificate)
}

/**
 * Sign a UTF-8 string with the chosen certificate.
 * E-IMZO shows its own native password dialog when loading the key —
 * the password is entered there, never in our page.
 */
export async function signText(cert: Certificate, text: string): Promise<string> {
  await eimzo.connect()

  const loaded = await eimzo.call('pfx', 'load_key', [cert.disk, cert.path, cert.name, cert.alias])
  if (!loaded?.success) throw new EimzoError(loaded?.reason || 'load-key-failed')
  const keyId: string = loaded.keyId

  // Base64-encode the UTF-8 payload (btoa needs Latin1, so encode UTF-8 first).
  const dataB64 = btoa(String.fromCharCode(...new TextEncoder().encode(text)))

  // detached "no" → the document is embedded in the PKCS#7 (attached signature)
  const signed = await eimzo.call('pkcs7', 'create_pkcs7', [dataB64, keyId, 'no'])
  if (!signed?.success) throw new EimzoError(signed?.reason || 'sign-failed')
  return signed.pkcs7_64 as string
}
