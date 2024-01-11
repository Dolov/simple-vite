
console.log('[vite] is connecting....');


const wss = new WebSocket(`ws://${location.host}`, 'vite-hmr')

wss.addEventListener("message", e => {
  const data = JSON.parse(e.data)
  if (data.type === "update") {
    location.reload()
  }
})

