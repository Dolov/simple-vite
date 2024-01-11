
console.log('[vite] is connecting....');


const wss = new WebSocket(`ws://${location.host}`, 'vite-hmr')

wss.addEventListener("message", e => {
  console.log(e.data)
})

