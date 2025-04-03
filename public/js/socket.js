const { info, succ, err, warn } = require('../controllers/LoggerStyles.js');

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("overlay");
  const startChatBtn = document.getElementById("startChatBtn");
  const wss = typeof wssProp !== "undefined" ? wssProp : null;
  const sockdis = document.getElementById("sockdis");

  // init wss
  if (wss) {
    initializeChat();
  }

  // start chat event handler
  startChatBtn.addEventListener("click", async () => {
    try {
      let shortCode = new URLSearchParams(window.location.search)
        .get("shortUrl")
        ?.slice(-6);

      if (!shortCode) {
        const pathParts = window.location.pathname.split("/");
        shortCode = pathParts[pathParts.length - 1];
      }

      if (!shortCode) {
        console.error(`${err} Invalid short code`);
        return;
      }

      const response = await fetch("/update-wss", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shortCode }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      overlay.style.display = "none";
      initializeChat();
    } catch (error) {
      console.error(`${err} Failed to start chat:`, error);
    }
  });

  // XSS helper func to escape html for security
  function theEscapist(unsafe) {
    if (!unsafe) return "";
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      const popup = document.createElement("div");
      popup.textContent = "Copied!";
      popup.style.cssText =
        "position:fixed;top:20px;right:20px;background:#4CAF50;color:white;padding:8px 16px;border-radius:4px;z-index:1000";
      document.body.appendChild(popup);
      setTimeout(() => popup.remove(), 2000);
    } catch (err) {
      console.error(`${err} Copy failed:`, err);
      alert("Failed to copy text: " + err);
    }
  }

  function initializeChat() {
    const msgerForm = document.querySelector(".msger-inputarea");
    const msgerInput = document.querySelector(".msger-input");
    const msgerChat = document.querySelector(".msger-chat");

    sockdis.innerHTML = "CONNECTED";
    sockdis.classList.remove("text-danger");
    sockdis.classList.add("text-success");

    const BOT_IMG = "";
    const PERSON_IMG = "";
    const BOT_NAME = "BOT";
    let USER_NAME = "You";

    const urlParams = new URLSearchParams(window.location.search);
    let shortUrl = urlParams.get("shortUrl");
    let chatCode;

    if (shortUrl) {
      chatCode = shortUrl.slice(-6);
    } else {
      const pathParts = window.location.pathname.split("/");
      chatCode = pathParts[pathParts.length - 1];
    }

    if (!chatCode) {
      console.error(`${err} Invalid chat session`);
      return;
    }

    // init wss
    const socket = new WebSocket(`ws://localhost:8090?chat=${chatCode}`);
    let isConnected = false;

    console.log(
      `${info} Connecting to WebSocket server (Chat Room: ${chatCode})...`
    );

    socket.onopen = () => {
      isConnected = true;
      console.log(
        `${info} Connected to WebSocket server (Chat Room: ${chatCode})`
      );

      socket.send(
        JSON.stringify({
          type: "getHistory",
          chatCode: chatCode,
        })
      );
    };

    socket.onerror = (error) => {
      console.error(`${err} WebSocket:`, error);
      sockdis.innerHTML = "CONNECTION ERROR";
      sockdis.classList.remove("text-success");
      sockdis.classList.add("text-danger");
    };

    socket.onclose = () => {
      isConnected = false;
      console.log(`${err} WebSocket connection closed`);
      sockdis.innerHTML = "DISCONNECTED";
      sockdis.classList.remove("text-success");
      sockdis.classList.add("text-danger");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "name") {
          USER_NAME = theEscapist(data.name);
          console.log(`${info} Logged in: ${USER_NAME}`);
        } else if (data.type === "message") {
          appendMessage(
            theEscapist(data.name),
            data.img,
            data.side,
            theEscapist(data.text)
          );
        } else if (data.type === "history") {
          // Handle message history
          if (data.messages && Array.isArray(data.messages)) {
            data.messages.forEach((msg) => {
              appendMessage(
                theEscapist(msg.name),
                msg.img,
                msg.side,
                theEscapist(msg.text)
              );
            });
          }
        }
      } catch (error) {
        console.error(`${err} Failed to process message:`, error);
      }
    };

    // send message event handler
    msgerForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const msgText = msgerInput.value.trim();
      if (!msgText || !isConnected) return;

      try {
        socket.send(
          JSON.stringify({
            type: "message",
            name: USER_NAME,
            img: PERSON_IMG,
            side: "right",
            text: msgText,
            chatCode: chatCode,
          })
        );
        msgerInput.value = "";
      } catch (error) {
        console.error(`${err} Failed to send message:`, error);
      }
    });

    const copycon = `
            <button class="copy-con" title="Copy message">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g opacity="0.7">
                    <path d="M3 10C3 8.11438 3 7.17157 3.58579 6.58579C4.17157 6 5.11438 6 7 6H13C14.8856 6 15.8284 6 16.4142 6.58579C17 7.17157 17 8.11438 17 10V18C17 19.8856 17 20.8284 16.4142 21.4142C15.8284 22 14.8856 22 13 22H7C5.11438 22 4.17157 22 3.58579 21.4142C3 20.8284 3 19.8856 3 18V10Z" fill="white"/>
                    <path opacity="0.5" d="M7.00439 5.00172C7.31535 5 7.64667 5 8.00007 5H12.0001C14.8285 5 16.2427 5 17.1214 5.87868C18.0001 6.75736 18.0001 8.17157 18.0001 11V17C18.0001 17.3534 18.0001 17.6847 17.9984 17.9957C19.2392 17.9778 19.9425 17.886 20.4143 17.4142C21.0001 16.8284 21.0001 15.8856 21.0001 14V6C21.0001 4.11438 21.0001 3.17157 20.4143 2.58579C19.8285 2 18.8857 2 17.0001 2H11.0001C9.11446 2 8.17165 2 7.58586 2.58579C7.1141 3.05755 7.02227 3.76086 7.00439 5.00172Z" fill="white"/>
                  </g>
                </svg>
            </button>
        `;

    // append message to chat
    function appendMessage(name, img, side, text) {
      const msgId = `msg-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 5)}`;
      const msgHTML = `
                <div class="msg ${side}-msg" id="${msgId}">
                    <div class="msg-bubble">
                        <div class="msg-info">
                            <div class="msg-info-name">${name}</div> 
                            ${copycon}
                            <div class="msg-info-time">${formatDate(
                              new Date()
                            )}</div>
                        </div>
                        <div class="msg-text">${text}</div>
                    </div>
                </div>
            `;

      msgerChat.insertAdjacentHTML("beforeend", msgHTML);
      msgerChat.scrollTop = msgerChat.scrollHeight;

      const msgElement = document.getElementById(msgId);
      const copyBtn = msgElement.querySelector(".copy-con");
      copyBtn.addEventListener("click", () => {
        const msgText = msgElement.querySelector(".msg-text").textContent;
        copyToClipboard(msgText);
      });
    }

    function formatDate(date) {
      const h = String(date.getHours()).padStart(2, "0");
      const m = String(date.getMinutes()).padStart(2, "0");
      return `${h}:${m}`;
    }
  }
});
