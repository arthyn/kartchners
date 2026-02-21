#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const ROOT = process.cwd()
const CONTENT_DIR = path.join(ROOT, 'site')
const CACHE_DIR = path.join(ROOT, 'images', 'remote-cache')
const CACHE_META_DIR = path.join(ROOT, '.cache')
const MANIFEST_PATH = path.join(CACHE_META_DIR, 'remote-images-manifest.json')
const MAP_PATH = path.join(ROOT, 'site', 'globals', 'remote-image-map.json')

const CONTENT_FILE_EXTENSIONS = new Set(['.md', '.njk', '.html', '.json', '.yml', '.yaml'])
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.bmp', '.tiff'])

const URL_REGEX = /https?:\/\/[^\s"'`<>\])}]+/g
const CLOUDINARY_RELATIVE_REGEX = /\/v\d+\/[A-Za-z0-9%_./-]+\.(?:jpg|jpeg|png|gif|webp|svg|avif|bmp|tiff)/gi
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/hmillerdev/image/upload'

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue
      files.push(...walk(full))
    } else if (CONTENT_FILE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(full)
    }
  }
  return files
}

function stripTrailingPunctuation(url) {
  return url.replace(/[.,;!?]+$/g, '')
}

function extractUrlsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const absoluteMatches = (content.match(URL_REGEX) || []).map(stripTrailingPunctuation)

  const relativeMatches = content.match(CLOUDINARY_RELATIVE_REGEX) || []
  const cloudinaryExpanded = relativeMatches.map((p) => `${CLOUDINARY_BASE_URL}${p}`)

  return [...absoluteMatches, ...cloudinaryExpanded]
}

function isLikelyImageUrl(url) {
  try {
    if (url.includes('{{') || url.includes('}}')) return false

    const parsed = new URL(url)
    const pathname = parsed.pathname.toLowerCase()
    const ext = path.extname(pathname)

    if (IMAGE_EXTENSIONS.has(ext)) return true

    // Cloudinary-style URLs should include an asset segment (commonly /v1234/...)
    if (pathname.includes('/image/upload/')) {
      if (pathname.match(/\/image\/upload\/v\d+\//)) return true
      if (ext) return true
      return false
    }

    return false
  } catch (_) {
    return false
  }
}

function loadJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (_) {
    return fallback
  }
}

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function extensionFromContentType(contentType) {
  const ct = (contentType || '').split(';')[0].trim().toLowerCase()
  const map = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/avif': '.avif',
    'image/bmp': '.bmp',
    'image/tiff': '.tiff'
  }
  return map[ct] || ''
}

function extensionFromUrl(url) {
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase()
    return IMAGE_EXTENSIONS.has(ext) ? ext : ''
  } catch (_) {
    return ''
  }
}

function normalizedRecord(url, record = {}) {
  return {
    url,
    localPath: record.localPath || null,
    etag: record.etag || null,
    lastModified: record.lastModified || null,
    contentLength: record.contentLength || null,
    contentType: record.contentType || null,
    ...(record.lastError ? { lastError: record.lastError } : {})
  }
}

async function fetchImage(url, previous) {
  const headers = {}
  if (previous && previous.etag) headers['If-None-Match'] = previous.etag
  if (previous && previous.lastModified) headers['If-Modified-Since'] = previous.lastModified

  const response = await fetch(url, {
    method: 'GET',
    headers,
    redirect: 'follow'
  })

  if (response.status === 304) {
    return { status: 'not-modified' }
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.toLowerCase().startsWith('image/')) {
    throw new Error(`Not an image (content-type: ${contentType || 'unknown'})`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return {
    status: 'downloaded',
    buffer,
    contentType,
    etag: response.headers.get('etag') || null,
    lastModified: response.headers.get('last-modified') || null,
    contentLength: response.headers.get('content-length') || String(buffer.length)
  }
}

async function main() {
  ensureDir(CACHE_DIR)
  ensureDir(CACHE_META_DIR)
  ensureDir(path.dirname(MAP_PATH))

  const manifest = loadJson(MANIFEST_PATH, { version: 1, images: {} })
  const previousImages = manifest.images || {}

  const contentFiles = walk(CONTENT_DIR)
  const urls = new Set()

  for (const file of contentFiles) {
    for (const url of extractUrlsFromFile(file)) {
      if (isLikelyImageUrl(url)) urls.add(url)
    }
  }

  const sortedUrls = Array.from(urls).sort()
  const nextImages = {}
  const rewriteMap = {}

  let downloaded = 0
  let reused = 0
  let failed = 0

  for (const url of sortedUrls) {
    const previous = previousImages[url]
    const urlHash = sha256(url).slice(0, 20)

    try {
      let localPath = previous && previous.localPath ? previous.localPath : null
      let absLocalPath = localPath ? path.join(ROOT, localPath.replace(/^\//, '')) : null

      const localExists = absLocalPath ? fs.existsSync(absLocalPath) : false
      const shouldTryConditionalFetch = !localExists || previous?.etag || previous?.lastModified

      if (shouldTryConditionalFetch) {
        const result = await fetchImage(url, previous)

        if (result.status === 'not-modified' && localExists) {
          reused += 1
          nextImages[url] = normalizedRecord(url, previous)
        } else if (result.status === 'downloaded') {
          const ext = extensionFromContentType(result.contentType) || extensionFromUrl(url) || '.img'
          const fileName = `${urlHash}${ext}`
          localPath = `/images/remote-cache/${fileName}`
          absLocalPath = path.join(ROOT, localPath.replace(/^\//, ''))

          fs.writeFileSync(absLocalPath, result.buffer)

          downloaded += 1
          nextImages[url] = normalizedRecord(url, {
            localPath,
            etag: result.etag,
            lastModified: result.lastModified,
            contentLength: result.contentLength,
            contentType: result.contentType
          })
        }
      } else {
        reused += 1
        nextImages[url] = normalizedRecord(url, previous)
      }

      if (nextImages[url] && nextImages[url].localPath) {
        rewriteMap[url] = nextImages[url].localPath
      }
    } catch (error) {
      failed += 1
      if (previous && previous.localPath && fs.existsSync(path.join(ROOT, previous.localPath.replace(/^\//, '')))) {
        nextImages[url] = normalizedRecord(url, {
          ...previous,
          lastError: String(error.message || error)
        })
        rewriteMap[url] = previous.localPath
      } else {
        console.warn(`[remote-images] Failed to fetch ${url}: ${error.message || error}`)
      }
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify({ version: 1, images: nextImages }, null, 2) + '\n')
  fs.writeFileSync(MAP_PATH, JSON.stringify(rewriteMap, null, 2) + '\n')

  console.log(`[remote-images] scanned=${sortedUrls.length} downloaded=${downloaded} reused=${reused} failed=${failed}`)
}

main().catch((error) => {
  console.error('[remote-images] fatal:', error)
  process.exit(1)
})
