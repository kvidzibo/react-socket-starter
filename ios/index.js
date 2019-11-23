module.exports = client => {
  client.on('get:date', ack => ack(new Date().toISOString().replace('T', ' ').substr(0, 23)))
}
