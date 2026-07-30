// Minimal multipart/form-data parser — no dependencies, works on a Buffer body.
// Handles the standard shape produced by browser FormData uploads.

export function parseMultipart(buffer, contentType) {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || '')
  if (!m) throw new Error('Missing multipart boundary')
  const boundary = Buffer.from('--' + (m[1] || m[2]).trim())

  const parts = []
  let start = buffer.indexOf(boundary)
  if (start === -1) return parts

  while (true) {
    const next = buffer.indexOf(boundary, start + boundary.length)
    if (next === -1) break

    let chunk = buffer.subarray(start + boundary.length, next)
    if (chunk.subarray(0, 2).toString('latin1') === '\r\n') chunk = chunk.subarray(2)
    if (chunk.subarray(-2).toString('latin1') === '\r\n') chunk = chunk.subarray(0, -2)

    const headerEnd = chunk.indexOf('\r\n\r\n')
    if (headerEnd !== -1) {
      const headerStr = chunk.subarray(0, headerEnd).toString('utf8')
      const data = chunk.subarray(headerEnd + 4)

      const headers = {}
      for (const line of headerStr.split('\r\n')) {
        const i = line.indexOf(':')
        if (i !== -1) headers[line.slice(0, i).toLowerCase().trim()] = line.slice(i + 1).trim()
      }

      const disposition = headers['content-disposition'] || ''
      const nameMatch = /name="([^"]*)"/.exec(disposition)
      const filenameMatch = /filename="([^"]*)"/.exec(disposition)

      parts.push({
        name: nameMatch?.[1],
        filename: filenameMatch?.[1],
        contentType: headers['content-type'],
        data,
      })
    }

    start = next
  }

  return parts
}
