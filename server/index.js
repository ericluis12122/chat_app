const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const {addUser, removeUser, getUser, getUsersInRoom} = require('./users');

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();
const server = http.createServer(app);
app.use(cors());

const io = socketio(server, {
    cors: {
      origin: "*", // Permitir todas las conexiones (cambiar según tus necesidades)
      methods: ["GET", "POST"], // Métodos permitidos
      allowedHeaders: ["Content-Type"], // Encabezados permitidos
      credentials: true, // Permitir envío de cookies o credenciales
    },
  });

io.on("connection", (socket) => {
    socket.on("join", ({ name, room }, callback) => {
      const { error, newUser } = addUser({ id: socket.id, name, room });

      if(error) return callback({ error });

      socket.emit("message", { user: "admin", text: `${newUser.name}, welcome to the room ${newUser.room}` });
      socket.broadcast.to(newUser.room).emit("message", { user: "admin", text: `${newUser.name}, has joined!` });

      socket.join(newUser.room);

      io.to(newUser.room).emit("roomData", { room: newUser.room, users: getUsersInRoom({ room: newUser.room }) });

      callback();
    });

    socket.on("sendMessage", (message, callback) => {
      console.log(socket.id);
        const user = getUser({ id: socket.id });

        io.to(user.room).emit("message", { user: user.name, text: message });
        io.to(user.room).emit("roomData", { room: user.room, users: getUsersInRoom({ room: user.room }) });

        callback();
    });

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        if(user) {
            io.to(user.room).emit("message", { user: "admin", text: `${user.name} has left.` });
        }
    });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));