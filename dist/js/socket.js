"use strict";
// major changes imminent
const msgerForm = document.querySelector(".msger-inputarea");
const msgerInput = document.querySelector(".msger-input");
const msgerChat = document.querySelector(".msger-chat");
const BOT_IMG = "https://image.flaticon.com/icons/svg/327/327779.svg";
const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
const BOT_NAME = "BOT";
let USER_NAME = "You";
const urlParams = new URLSearchParams(window.location.search);
const shortUrl = urlParams.get("shortUrl");
const chatCode = shortUrl ? shortUrl.slice(-6) : null;
if (chatCode) {
    const socket = new WebSocket(`ws://localhost:8090?chat=${chatCode}`);
    console.log(`[INFO] connecting to WebSocket server (Chat Room: ${chatCode})...`);
    socket.onopen = () => {
        console.log(`[INFO] connected to WebSocket server (Chat Room: ${chatCode})`);
    };
    socket.onerror = (error) => {
        console.error("[ERROR] WebSocket:", error);
    };
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "name") {
            USER_NAME = data.name;
            console.log(`[INFO] logged in: ${USER_NAME}`);
        }
        else if (data.type === "message") {
            appendMessage(data.name, data.img, data.side, data.text);
        }
    };
    msgerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const msgText = msgerInput.value;
        if (!msgText)
            return;
        socket.send(JSON.stringify({
            type: "message",
            name: USER_NAME,
            img: PERSON_IMG,
            side: "right",
            text: msgText,
        }));
        msgerInput.value = "";
    });
}
else {
    console.error("[ERROR] invalid chat session");
}
function appendMessage(name, img, side, text) {
    const msgHTML = `
        <div class="msg ${side}-msg">
            <div class="msg-img" style="background-image: url(${img})"></div>
            <div class="msg-bubble">
                <div class="msg-info">
                    <div class="msg-info-name">${name}</div>
                    <div class="msg-info-time">${formatDate(new Date())}</div>
                </div>
                <div class="msg-text">${text}</div>
            </div>
        </div>
    `;
    msgerChat.insertAdjacentHTML("beforeend", msgHTML);
    msgerChat.scrollTop = msgerChat.scrollHeight;
}
function formatDate(date) {
    const h = "0" + new Date().getHours();
    const m = "0" + new Date().getMinutes();
    return `${h.slice(-2)}:${m.slice(-2)}`;
}
