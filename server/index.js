const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
const http = require("http");
const server = http.createServer(app);
require("dotenv").config();

const io = socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

global.onlineUsers = new Map();
// const onlineUsers = new Map();
io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("calluser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("calluser", { signal: signalData, from, name });
  });
  socket.on("answercall", (data) => {
    io.to(data.to).emit("callaccepted", data.signal);
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("callended");
  });

  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      // socket.to(sendUserSocket).emit("msg-recieve", data.msg);
      io.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
  const users = {};
  if (!users[socket.id]) {
    users[socket.id] = socket.id;
  }

  io.sockets.emit("allUsers", users);
});

server.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
