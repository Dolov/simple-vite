#!/usr/bin/env node

import express from 'express'
import { readFileSync } from "fs"
import { getExt } from './utils'
import { transformJs, transformSvg, transformCss, Js } from './transform'

const app = express()
const port = 3000

process.on("uncaughtException", err => {
  console.log('err: ', err);
})

app.get("/", (req, res) => {
  const entry = `${process.cwd()}/index.html`
  const entryHtml = readFileSync(entry, 'utf-8');
  res.send(entryHtml);
})

app.get("/src/*", async (req, res) => {
  const type = getExt(req.path)
  const filePath = `${process.cwd()}${req.path}`
  const code = readFileSync(filePath, 'utf-8')
  if (["js", "ts", "jsx", "tsx"].includes(type)) {
    const jsx = await transformJs(code, type as Js)
    res.set('Content-Type', 'application/javascript')
    res.send(jsx)
    return
  }

  if (type === "svg") {
    if ("import" in req.query) {
      const svg = transformSvg(req.path)
      res.set('Content-Type', "application/javascript")
      res.send(svg)
      return
    }
    
    res.set('Content-Type', "image/svg+xml")
    res.send(code)
    return
  }

  if (type === "css") {
    const css = transformCss(code)
    res.set('Content-Type', "application/javascript")
    res.send(css)
    return
  }
})

app.get("/node_modules/*", async (req, res) => {
  const type = getExt(req.path)
  const filePath = `${process.cwd()}${req.path}`
  const code = readFileSync(filePath, 'utf-8')
  if (["js"].includes(type)) {
    res.set('Content-Type', 'application/javascript')
    res.send(code)
  }
})

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})
