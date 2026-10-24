#!/usr/bin/env node
/**
 * Run on localhost against the production preview after npm run build.
 * Needs chromium on PATH or CHROME_PATH set to its binary.
 * Each page/form factor is measured 3x, and medians are written to JSON.
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const base = process.env.LH_BASE_URL || 'http://127.0.0.1:4173'
const out = 'artifacts/lighthouse'
const pages = [{ name:'home', path:'/' }, { name:'detail', path:'/nft/emerald-ape-042' }]
const factors = ['mobile','desktop']
mkdirSync(out,{recursive:true})
const metric = (x) => x === null || x === undefined ? null : x
const median = (a) => { const v=a.filter(Number.isFinite).sort((x,y)=>x-y); return v.length ? v[Math.floor(v.length/2)] : null }
const reports = []
for (const page of pages) for(const factor of factors) {
  const samples=[]
  for(let i=1;i<=3;i++){
    const pathname=join(out,`${page.name}-${factor}-${i}`)
    const args=[
      '--yes','lighthouse@12.8.2',new URL(page.path,base).href,
      '--only-categories=performance,accessibility,best-practices,seo',
      '--output=html','--output=json',`--output-path=${pathname}`,
      '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage',
      '--quiet',
      ...(factor==='desktop'?['--preset=desktop']:[])
    ]
    const run=spawnSync('npx',args,{stdio:'inherit',shell:process.platform==='win32'})
    if(run.status!==0){console.error('Lighthouse failed:',page.name,factor,i);process.exitCode=1;continue}
    const raw=JSON.parse(readFileSync(pathname+'.report.json','utf8'))
    const cats=raw.categories
    samples.push({
      performance:metric(cats.performance.score*100),
      accessibility:metric(cats.accessibility.score*100),
      bestPractices:metric(cats['best-practices'].score*100),
      seo:metric(cats.seo.score*100),
      lcp:metric(raw.audits['largest-contentful-paint']?.numericValue),
      cls:metric(raw.audits['cumulative-layout-shift']?.numericValue),
      tbt:metric(raw.audits['total-blocking-time']?.numericValue),
    })
  }
  const keys=['performance','accessibility','bestPractices','seo','lcp','cls','tbt']
  const medians=Object.fromEntries(keys.map(k=>[k,median(samples.map(x=>x[k]))]))
  reports.push({page:page.name,factor,medians,samples})
}
writeFileSync(join(out,'summary.json'),JSON.stringify({base,date:new Date().toISOString(),node:process.version,reports},null,2))
console.table(reports.map(x=>({page:x.page,device:x.factor,...x.medians})))
if(reports.some(x=>x.samples.length!==3))process.exitCode=1
