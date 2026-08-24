// Interactive-login capture harness for the official Skilljar practice exam.
// Opens a visible browser, captures EVERY text/js/json network response and
// periodic DOM snapshots of all frames, and keeps running until a STOP sentinel
// file appears (or a hard deadline). On finish it writes an authenticated
// storageState so later sittings can be driven without logging in again.
//
// Nothing here is committed app code — it's a one-off extraction tool.
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const DIR = '/tmp/exam-capture'
const RDIR = path.join(DIR, 'responses')
const DDIR = path.join(DIR, 'dom')
const STOP = path.join(DIR, 'STOP')
const PROFILE = '/tmp/pw-exam-profile'
const DEADLINE_MS = 60 * 60 * 1000 // 60 min safety cap
const START_URL =
  process.env.EXAM_URL ||
  'https://anthropic.skilljar.com/anthropic-certification-practice-exam/425721/scorm/9tk8iybcpyl9'

fs.mkdirSync(RDIR, { recursive: true })
fs.mkdirSync(DDIR, { recursive: true })
const idx = fs.createWriteStream(path.join(DIR, 'responses.jsonl'), { flags: 'a' })
const log = (m) => {
  const s = `[${new Date().toISOString()}] ${m}\n`
  fs.appendFileSync(path.join(DIR, 'run.log'), s)
  process.stdout.write(s)
}

let n = 0
const seen = new Set()
const sanitize = (u) => u.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 140)

function wire(page) {
  page.on('response', async (resp) => {
    try {
      const url = resp.url()
      const ct = resp.headers()['content-type'] || ''
      const textish =
        /javascript|json|text|html|xml|application\/octet-stream/.test(ct) ||
        /\.(js|mjs|json|html?|xml|txt)(\?|#|$)/i.test(url)
      if (!textish) return
      if (url.startsWith('data:') || url.startsWith('blob:')) return
      let body
      try {
        body = await resp.body()
      } catch {
        return
      }
      if (!body || body.length === 0 || body.length > 12_000_000) return
      const key = url + ':' + body.length
      if (seen.has(key)) return
      seen.add(key)
      const fn = `${String(++n).padStart(4, '0')}_${sanitize(url)}`
      fs.writeFileSync(path.join(RDIR, fn), body)
      idx.write(
        JSON.stringify({ n, url, status: resp.status(), ct, file: fn, len: body.length }) + '\n',
      )
      if (/json|javascript/.test(ct) || /\.(js|mjs|json)(\?|#|$)/i.test(url)) {
        log(`captured ${ct.split(';')[0]} ${body.length}b  ${url.slice(0, 130)}`)
      }
    } catch {
      /* ignore */
    }
  })
}

const lastLen = new Map()
async function snapshot(ctx, tag) {
  for (let pi = 0; pi < ctx.pages().length; pi++) {
    const p = ctx.pages()[pi]
    const frames = p.frames()
    for (let fi = 0; fi < frames.length; fi++) {
      try {
        const html = await frames[fi].content()
        const file = path.join(DDIR, `p${pi}_f${fi}.html`) // latest per frame (overwrite)
        fs.writeFileSync(file, html)
        const k = `${pi}.${fi}`
        if (tag === 'final' || Math.abs((lastLen.get(k) || 0) - html.length) > 400) {
          lastLen.set(k, html.length)
          fs.writeFileSync(path.join(DDIR, `hist_${Date.now()}_p${pi}_f${fi}.html`), html)
        }
      } catch {
        /* frame navigating / detached */
      }
    }
  }
}

let ctx
try {
  ctx = await chromium.launchPersistentContext(PROFILE, {
    headless: false,
    channel: 'chrome',
    viewport: null,
    args: ['--start-maximized'],
  })
  log('launched with channel=chrome')
} catch (e) {
  log('chrome channel failed (' + e.message + '), falling back to bundled chromium')
  ctx = await chromium.launchPersistentContext(PROFILE, {
    headless: false,
    viewport: null,
    args: ['--start-maximized'],
  })
}

ctx.on('page', (p) => wire(p))
for (const p of ctx.pages()) wire(p)
const page = ctx.pages()[0] || (await ctx.newPage())
await page.goto(START_URL, { waitUntil: 'domcontentloaded' }).catch((e) => log('goto: ' + e.message))
log('BROWSER OPEN. Log in, open the exam, click Start. Drop ' + STOP + ' when ready.')

const deadline = Date.now() + DEADLINE_MS
while (!fs.existsSync(STOP) && Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 6000))
  await snapshot(ctx, 'tick')
}
log(fs.existsSync(STOP) ? 'STOP detected — finalizing' : 'deadline reached — finalizing')
await snapshot(ctx, 'final')
try {
  await ctx.storageState({ path: path.join(DIR, 'storageState.json') })
  log('saved storageState.json')
} catch (e) {
  log('storageState failed: ' + e.message)
}
log(`DONE — ${n} responses captured`)
await ctx.close().catch(() => {})
process.exit(0)
