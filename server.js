var PORT = process.env.PORT || 3000;
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/chat", (req, res) => {
    res.sendFile(__dirname + "/public/chat.html");
});

io.on("connection", (socket) => {
    // default nick
    // TODO: add initial nick field
    socket.nickname = `HausUser${Math.round(Math.random() * 100000)}`;

    console.log(`${socket.nickname} connected`);
    io.sockets.emit("new message", {
        message: `${socket.nickname} has joined the chatroom`,
        nickname: "Server",
        type: "service",
        timestamp: new Date(),
    });

    // listen for nickname changes
    socket.on("nick", (data) => {
        socket.nickname = data.nickname;
        // TODO: implement nickname collision detection
    });

    socket.on("disconnect", () => {
        console.log(`${socket.nickname} disconnected`);
        io.sockets.emit("new message", {
            message: `${socket.nickname} has quit (${socket.leavemsg})`,
            nickname: "Server",
            type: "service",
            timestamp: new Date(),
        });
    });

    socket.on("chat message", (data) => {
        console.log(`${socket.nickname}: ${data.message}`);
        io.sockets.emit("new message", {
            message: `${data.message}`,
            nickname: socket.nickname,
            type: "user",
            timestamp: new Date(),
        });
    });
});

http.listen(PORT, function () {
    console.log("listening on *:3000"); //TODO: add IP template
});

const gracefulShutdown = () => {
    io.sockets.emit("shutdown", {
        message: "Server shutting down.",
    });
    io.close();
    process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
