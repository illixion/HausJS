var PORT = process.env.PORT || 3000;
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var fs = require("fs");
var config = require("./config.json");

// HTTP server
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/chat", (req, res) => {
    res.sendFile(__dirname + "/public/chat.html");
});

http.listen(PORT, function () {
    console.log(`listening on *:${PORT}`);
});

if (config.logToFile) {
    var logfile = fs.createWriteStream(__dirname + "/haus.log", {
        flags: "a",
    });
}

// Socket.io
const nicknames = { blank: "", server: "Server" };

io.on("connection", (socket) => {
    // AFK detection
    socket.AFK = setTimeout(() => {
        socket.emit("shutdown", {
            message: `You've been disconnected due to inactivity.`,
        });
        if (socket.id in nicknames) {
            broadcastMessage(
                `${nicknames[socket.id]} has quit (inactivity timeout)`
            );
            delete nicknames[socket.id];
        }
        socket.disconnect();
    }, 60000 * config.inactivityTimeoutInMinutes);

    // Allow sending/receiving messages only after user sets their nickname
    // You can implement your own authentication here
    socket.on("join", (data) => {
        const truncNickname = data.nickname.substring(0, 32);
        if (socket.id in nicknames) {
            privateServiceMessage(socket, "You're already logged in.");
        } else if (Object.values(nicknames).includes(truncNickname)) {
            socket.emit("shutdown", {
                message: `Sorry, ${truncNickname} is taken. Please try a different username.`,
            });
        } else {
            nicknames[socket.id] = truncNickname;
            socket.join("all"); // There are no rooms, this is nothing but an ~illusion~
            broadcastMessage(`${nicknames[socket.id]} has joined`);
        }
    });

    socket.on("disconnect", () => {
        if (socket.id in nicknames) {
            broadcastMessage(
                `${nicknames[socket.id]} has quit (connection lost)`
            );
            delete nicknames[socket.id];
        }
    });

    socket.on("chat message", (data) => {
        if (!(socket.id in nicknames)) {
            privateServiceMessage(
                socket,
                "You're not allowed to send or receive messages as you haven't joined the server."
            );
        } else if (data.message.length !== 0) {
            socket.AFK.refresh();
            broadcastMessage(data.message, nicknames[socket.id], "user");
        }
    });
});

// Global message emitter with logging
const broadcastMessage = (msg, nickname = "Server", type = "service") => {
    const logEntry = `[${new Date().toISOString()}] ${
        type === "service" ? "(" + type + ") " : ""
    }${nickname}: ${msg}`;
    console.log(logEntry);
    if (config.logToFile) logfile.write(logEntry + "\n");

    io.to("all").emit("new message", {
        message: `${nickname}: ${msg}`,
        type: type,
    });
};

// Private service message emitter without logging
const privateServiceMessage = (socket, msg) => {
    socket.emit("new message", {
        message: msg,
        type: "service",
    });
};

// SIGINT/SIGTERM handler (sends a message to all clients to disconnect cleanly)
const gracefulShutdown = () => {
    io.sockets.emit("shutdown", {
        message: "Server shutting down.",
    });
    io.close();
    process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
