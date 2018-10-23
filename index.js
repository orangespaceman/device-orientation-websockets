var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || process.env['app_port'] || 7006;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/device/index.html');
});

app.get('/host', (req, res) => {
  res.sendFile(__dirname + '/client/host/index.html');
});

app.use(express.static(__dirname + '/client/'));

var host = io.of('/host');
var client = io.of('/device');

client.on('connection', socket => {
  socket.on('name', name => {
    host.emit('add', {
      id: socket.id,
      name
    });
  });
  socket.on('orientation', orientation => {
    host.emit('orientation', {
      id: socket.id,
      orientation
    });
  });
  socket.on('disconnect', () => {
    host.emit('remove', {
      id: socket.id
    });
  })
});

http.listen(port);
