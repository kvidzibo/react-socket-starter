const express = require('express')
const path = require('path')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const ios = require('./ios')
app.use('/bulma', express.static(path.join(__dirname, 'node_modules', 'bulma', 'css')))
app.use(express.static(path.join(__dirname, 'dist')))

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'static', 'index.html'))
})

io.on('connection', function (socket) {
  ios(socket)
})

http.listen(3000, function () {
  process.on('message', msg => {
    if (msg === 'client:reload') {
      io.emit('RELOAD')
    } else {
      console.log('CHILD got message:', msg)
    }
  })
  process.send('app:ready')
})
