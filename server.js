const Dalai = require("../index")
const dalai = new Dalai();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/index.js', (req, res) => {
    res.sendFile(__dirname + '/index.js');
});
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on("query", async (query) =>
    {
        await dalai.request(query, (str) => {
              socket.emit("answer", str)
          })
    })
});

server.listen(3000, () => {
    console.log('listening on http://localhost:3000/');
});