var config = require("./config.json");
var PORT = process.env.PORT || config.serverPort || 3000;
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var fs = require("fs");
const TelegramBot = require('node-telegram-bot-api');

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

// Telegram
const bot = new TelegramBot(config.tgToken, {polling: true});

bot.onText(/\/ban (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message
    if (msg.chat.id !== 83440360) {
        bot.sendMessage(msg.chat.id, "You're not authorized to use this bot.");
        return
    }
  
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"
    let sock = "";

    for (const [key, value] of Object.entries(nicknames)) {
        if (value["nick"] === resp) {
            sock = key
        }
    }      

    if (sock !== "") {
        bannedIps.push(nicknames[sock]["ip"])
        delete nicknames[sock];
        io.to(sock).emit('shutdown', {'message': 'You have been banned from the server.'});
        bot.sendMessage(chatId, `Banned ${resp} successfully`);
    }
});

bot.on('text', (msg) => {
    if (msg.chat.id !== 83440360) {
        bot.sendMessage(msg.chat.id, "You're not authorized to use this bot.");
        return
    }
    
    broadcastMessage(msg.text, nicknames["manual"]["nick"], "user");
});

// Socket.io
const nicknames = { blank: {nick: "", ip: "0.0.0.0"}, server: {nick: "Server", ip: "0.0.0.0"}, manual: {nick: "Manual", ip: "0.0.0.0"} };
const bannedIps = []

io.on("connection", (socket) => {
    // AFK detection
    socket.AFK = setTimeout(() => {
        socket.emit("shutdown", {
            message: `You've been disconnected due to inactivity.`,
        });
        if (socket.id in nicknames) {
            broadcastMessage(
                `${nicknames[socket.id]["nick"]} has quit (inactivity timeout)`
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
        } else {
            for (const [key, value] of Object.entries(nicknames)) {
                if (value["nick"] === truncNickname) {
                    socket.emit("shutdown", {
                        message: `Sorry, ${truncNickname} is taken. Please try a different username.`,
                    });
                    return
                }
            }
            
            if (bannedIps.includes(socket.handshake.address)) {
                socket.emit("shutdown", {
                    message: `You are banned from the server.`,
                });
                return
            }

            nicknames[socket.id] = {"nick": truncNickname, "ip": socket.handshake.address};
            socket.join("all"); // There are no rooms, this is nothing but an ~illusion~
            broadcastMessage(`${nicknames[socket.id]["nick"]} has joined`);
            if (Object.keys(nicknames).length === 4) {
                privateServiceMessage(socket, `Say hi! There is one other user here.`)
            } else {
                privateServiceMessage(socket, `Say hi! There are ${Object.keys(nicknames).length - 3} other users here.`)
            }
        }
    });

    socket.on("disconnect", () => {
        if (socket.id in nicknames) {
            broadcastMessage(
                `${nicknames[socket.id]["nick"]} has quit (connection lost)`
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
            broadcastMessage(data.message, nicknames[socket.id]["nick"], "user");
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
    if (nickname !== "Manual") {
        bot.sendMessage(83440360, `${nickname}: ${msg}`);
    }
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
