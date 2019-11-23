import io from 'socket.io-client'

const socket = io()

if (process.env.NODE_ENV === 'development') {
  socket.on('reconnect', () => { window.location.reload() })
  socket.on('RELOAD', () => { window.location.reload() })
}

export default socket
