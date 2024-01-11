#!/usr/bin/env node

import express from 'express'
import { readFileSync } from "fs"
import { createServer } from "http";
import { getExt, getSrc } from './utils'
import { transformJs, transformSvg, transformCss, Js } from './transform'
import { CreateWebSocketServer, watchSourceChange } from './webSockert'

const app = express()
const port = 3000


process.on("uncaughtException", err => {
  console.log('err: ', err);
})

app.get("/", (req, res) => {
  const entry = `${process.cwd()}/index.html`
  let entryHtml = readFileSync(entry, 'utf-8')
  registerRootRoute(entryHtml)
  entryHtml = entryHtml.replace(/<head>(.|[\n\r])*<\/head>/, (...args) => {
    return args[0].replace("</head>", `<script type="module" src="/@vite/client"></script></head>`)
  })
  res.send(entryHtml);
})

app.get("/@vite/client", (req, res) => {
  const code = readFileSync(`${__dirname}/vite-client.js`, "utf-8")
  res.set('Content-Type', 'application/javascript')
  res.send(code)
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

const server = createServer(app)

server.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})

const registerRootRoute = (html: string) => {
  const src = getSrc(html)
  if (!src) return
  app.get(`/${src}/*`, async (req, res) => {
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
}


const wss = new CreateWebSocketServer(server)

// watchSourceChange()