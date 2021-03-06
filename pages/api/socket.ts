import type { NextApiRequest, NextApiResponse } from 'next'
import { Server } from 'socket.io'

type Data = {
  name: string
}

export default function SocketHandler(
  req: NextApiRequest,
  res: any
) {
  if (res?.socket?.server?.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
      console.log('connection');
      socket.on('input-change', msg => {
        socket.broadcast.emit('update-input', msg)
      })

      socket.on('refresh', () => {
        socket.broadcast.emit('refresh', true)
      })
    })
  }
  res.end()
}
