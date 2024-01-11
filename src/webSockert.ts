import chokidar from 'chokidar'
import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http'

type Message = {
  type: "update",
  data: Record<string, string>
}

export class CreateWebSocketServer {

  wss: WebSocketServer
  
  constructor(server: Server) {
    this.wss = new WebSocket.Server({ noServer: true })
    server.on('upgrade', (req, socket, head) => {
      if (req.headers['sec-websocket-protocol'] === 'vite-hmr') {
        this.wss.handleUpgrade(req, socket, head, (ws) => {
          this.wss.emit('connection', ws, req);
        });
      }
    })

    this.wss.on("connection", socket => {
      socket.send(JSON.stringify({ type: 'connected' }))
    })

    this.wss.on('error', err => {
      console.log(err)
    })
  }

  sendMessage(info: Message) {
    this.wss.clients.forEach(client => {
      client.send(JSON.stringify(info))
    })
  }

  close() {
    this.wss.close()
  }
}

export const watchSourceChange = (rootPath: string) => {
  return chokidar.watch(rootPath, {
      ignored: ['**/node_modules/**', '**/.cache/**'],
      ignoreInitial: true,
      ignorePermissionErrors: true,
      disableGlobbing: true,
  })
}
