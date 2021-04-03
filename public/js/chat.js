var socket = io("http://meow.ftp.sh");
const chatForm = document.getElementById("sendForm");

window.onload = () => {
    let nickname = new URL(window.location.href).searchParams.get("nickname");
    nickname =
        nickname === null
            ? `NexusUser${Math.floor(Math.random() * 10000)}`
            : nickname;
    socket.emit("join", { nickname: nickname });
};

const appendMessage = (message, type) => {
    const messageEl = document.createElement("li");
    messageEl.className = `${type}`;
    messageEl.appendChild(
        document.createTextNode(`[${moment().format("HH:mm")}] ${message}`)
    );
    messageList.appendChild(messageEl);
};

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    socket.emit("chat message", { message: chatForm["sendField"].value });
    chatForm["sendField"].value = "";
    return false;
});

socket.on("new message", (data) => appendMessage(data.message, data.type));

// Shut down cleanly upon server shutdown message
socket.on("shutdown", (data) => {
    window.location = `/?alert=${data.message}`;
});

socket.on("connect_failed", function () {
    window.location =
        "/?alert=" +
        "Sorry, a problem occured while connecting to server.<br>Please try again later.";
});

socket.on("reconnect_failed", function () {
    window.location =
        "/?alert=" +
        "Lost connection with the server.<br>Please try connecting again later.";
});
