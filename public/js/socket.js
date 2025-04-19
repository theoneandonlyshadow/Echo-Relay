document.addEventListener("DOMContentLoaded", () => {
  const WS = window.WebSocket || MozWebSocket;
  
  const overlay = document.getElementById("overlay");
  const startChatBtn = document.getElementById("startChatBtn");
  const sockdis = document.getElementById("sockdis");
  const wss = typeof wssProp !== "undefined" ? wssProp : null;

  const BOT_IMG = "";
  const PERSON_IMG = "";
  let socket = null;
  let isConnected = false;
  let chatCode = null;

  const displayedMessageIds = new Set();

  function supernaturalIsTheBestSeriesOfAllTime() {
    const chars = ["dean", "sam", "cas", "bobby", "crowley", "lucifer", "gabriel", "rowena", "jody", "charlie", "kevin", "mary", "john", "ellen", "jo", "ash", "meg", "ruby", "crowley"];
    return chars[Math.floor(Math.random() * chars.length)];
  }

  let USER_NAME = supernaturalIsTheBestSeriesOfAllTime();

  if (wss) {
    initializeChat();
  }

  if (startChatBtn) {
    startChatBtn.addEventListener("click", handleStartChat);
  } else {
    console.log("Start chat button not found");
  }

  function escapeHtml(unsafe) {
    if (!unsafe) return "";
    return unsafe.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showPopup("Copied!");
    } catch (error) {
      console.log("Copy failed:", error);
      showPopup("Failed to copy!", true);
    }
  }

  function showPopup(message, isError = false) {
    const popup = document.createElement("div");
    popup.textContent = message;
    popup.className = "popup-message";
    popup.style.backgroundColor = isError ? '#f44336' : '#4CAF50';
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 2000);
  }

  function formatDate(date) {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }

  function getChatCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const shortUrl = urlParams.get("shortUrl");
    
    if (shortUrl) {
      try {
        const shortUrlObj = new URL(shortUrl);
        const pathParts = shortUrlObj.pathname.split("/").filter(Boolean);
        if (pathParts.length > 0) {
          const lastPart = pathParts[pathParts.length - 1];
          if (lastPart && lastPart.length >= 6) {
            return lastPart;
          }
        }
      } catch (error) {
        console.log("Error parsing shortUrl:", error);
      }
    }
    
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart.length === 6) {
        return lastPart;
      }
    }
    
    const fullPath = window.location.href;
    const matches = fullPath.match(/\/([a-zA-Z0-9]{6})(?:$|[/?#])/);
    if (matches && matches.length > 1) {
      return matches[1];
    }
    
    return null;
  }

  async function handleStartChat() {
    try {
      chatCode = getChatCode();
      
      if (!chatCode || chatCode.length < 6) {
        console.log("Invalid chat code:", chatCode);
        showPopup("Invalid chat code! Please check the URL.", true);
        return;
      }

      const response = await fetch("/update-wss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortCode: chatCode }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      if (overlay) {
        overlay.style.display = "none";
      }
      initializeChat();
    } catch (error) {
      console.log("Failed to start chat:", error);
      showPopup("Failed to start chat! Please try again.", true);
    }
  }

  function initializeChat() {
    const msgerForm = document.querySelector(".msger-inputarea");
    const msgerInput = document.querySelector(".msger-input");
    const msgerChat = document.querySelector(".msger-chat");

    if (!msgerForm || !msgerInput || !msgerChat) {
      console.log("Missing required chat elements");
      return;
    }

    if (sockdis) {
      sockdis.textContent = "CONNECTING...";
      sockdis.className = "text-warning";
      var element = document.getElementById("statusshi");
        element.classList.remove("status-succ");
        element.classList.add("status-loading");
    }

    if (socket) {
      socket.close();
      displayedMessageIds.clear();
    }

    if (!chatCode) {
      chatCode = getChatCode();
      if (!chatCode) {
        console.log("No chat code found");
        if (sockdis) {
          sockdis.textContent = "ERROR: NO CHAT CODE";
          sockdis.className = "text-danger";
        }
        return;
      }
    }

    try {
      socket = new WS(`${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.hostname}:8090?chat=${chatCode}`);
      console.log(`Connecting to WebSocket (Room: ${chatCode})...`);
      
      const usersCounter = document.createElement("div");
      usersCounter.id = "users-counter";
      usersCounter.className = "users-counter";
      usersCounter.textContent = "In chat: loading";
      document.body.appendChild(usersCounter);

      socket.onopen = () => {
        isConnected = true;
        console.log(`WebSocket connected (Room: ${chatCode})`);
        if (sockdis) {
          sockdis.textContent = "CONNECTED";
          sockdis.className = "text-success";
          var element = document.getElementById("statusshi");
          element.classList.remove("status-loading");
          element.classList.add("status-succ");
        }

        socket.send(JSON.stringify({
          type: "name",
          name: USER_NAME,
          chatCode: chatCode
        }));

        socket.send(JSON.stringify({
          type: "getHistory",
          chatCode: chatCode
        }));
        
        socket.send(JSON.stringify({
          type: "getUserCount",
          chatCode: chatCode
        }));
      };

      socket.onerror = (error) => {
        console.log("WebSocket error:", error);
        const msgerparent = document.getElementById('msger');
        const statusshi = msgerparent.querySelectorAll('.status-succ');
        statusshi.forEach((status) => {
          status.style.display = 'none';
        });
        
        if (sockdis) {
          sockdis.textContent = "ERROR";
          sockdis.className = "text-danger";
          var element = document.getElementById("statusshi");
          element.classList.remove("status-succ");
          element.classList.add("status-error");
        }
      };

      socket.onclose = () => {
        isConnected = false;
        console.log("WebSocket disconnected");
        if (sockdis) {
          sockdis.textContent = "DISCONNECTED";
          sockdis.className = "text-danger";
        }
        var element = document.getElementById("statusshi");
        element.classList.remove("status-succ");
        element.classList.add("status-error");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received message:", data);
          
          switch(data.type) {
            case "name":
              USER_NAME = escapeHtml(data.name);
              console.log(`Username set: ${USER_NAME}`);
              break;
              
            case "message":
              if (data.messageId && !displayedMessageIds.has(data.messageId)) {
                appendMessage(
                  escapeHtml(data.name),
                  data.img,
                  data.side,
                  escapeHtml(data.text),
                  data.messageId
                );
              }
              break;
              
            case "history":
              if (Array.isArray(data.messages)) {
                displayedMessageIds.clear();
                msgerChat.innerHTML = '';
                
                data.messages.forEach(msg => {
                  if (msg.messageId) {
                    displayedMessageIds.add(msg.messageId);
                  }
                  appendMessage(
                    escapeHtml(msg.name),
                    msg.img,
                    msg.side,
                    escapeHtml(msg.text),
                    msg.messageId
                  );
                });
              }
              break;
               
            case "connection":
              console.log(data.message);
              appendSystemMessage(data.message);
              break;
              
            case "userCount":
              updateUserCount(data.count);
              break;
              
            default:
              console.log(`Unknown message type: ${data.type}`);
          }
        } catch (error) {
          console.log("Message processing error:", error);
        }
      };

      msgerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        sendMessage();
      });

      const sendBtn = document.querySelector(".msger-send-btn");
      if (sendBtn) {
        sendBtn.addEventListener("click", sendMessage);
      }

    } catch (error) {
      console.log("WebSocket initialization failed:", error);
      if (sockdis) {
        sockdis.textContent = "CONNECTION FAILED";
        sockdis.className = "text-danger";
      }
    }
    
    function updateUserCount(count) {
      const usersCounter = document.getElementById("users-counter");
      if (usersCounter) {
        usersCounter.textContent = `In chat: ${count}/20`;
        if (count >= 15) {
          usersCounter.className = "users-counter warning";
        } if (count >= 20) {
          usersCounter.textContent = "20/20 - FULL";
          usersCounter.className = "users-counter warning";
        } else {
          usersCounter.className = "users-counter";
        }
      }
    }

    function appendMessage(name, img, side, text, messageId = null) {
      if (messageId && displayedMessageIds.has(messageId)) {
        return;
      }
      
      if (messageId) {
        displayedMessageIds.add(messageId);
      }

      const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const msgHTML = `
        <div class="msg ${side}-msg" id="${msgId}">
          <div class="msg-bubble">
            <div class="msg-info">
              <div class="msg-info-name">
                <span>${name}</span>
                <button class="copy-con" title="Copy contents of the message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g opacity="0.7">
                    <path d="M3 10C3 8.11438 3 7.17157 3.58579 6.58579C4.17157 6 5.11438 6 7 6H13C14.8856 6 15.8284 6 16.4142 6.58579C17 7.17157 17 8.11438 17 10V18C17 19.8856 17 20.8284 16.4142 21.4142C15.8284 22 14.8856 22 13 22H7C5.11438 22 4.17157 22 3.58579 21.4142C3 20.8284 3 19.8856 3 18V10Z" fill="white"/>
                    <path opacity="0.5" d="M7.00439 5.00172C7.31535 5 7.64667 5 8.00007 5H12.0001C14.8285 5 16.2427 5 17.1214 5.87868C18.0001 6.75736 18.0001 8.17157 18.0001 11V17C18.0001 17.3534 18.0001 17.6847 17.9984 17.9957C19.2392 17.9778 19.9425 17.886 20.4143 17.4142C21.0001 16.8284 21.0001 15.8856 21.0001 14V6C21.0001 4.11438 21.0001 3.17157 20.4143 2.58579C19.8285 2 18.8857 2 17.0001 2H11.0001C9.11446 2 8.17165 2 7.58586 2.58579C7.1141 3.05755 7.02227 3.76086 7.00439 5.00172Z" fill="white"/>
                  </g>
                </svg>
              </button></div>
              
              <div class="msg-info-time">${formatDate(new Date())}</div>
            </div>
            <div class="msg-text">${text}</div>
          </div>
        </div>
      `;
      
      msgerChat.insertAdjacentHTML("beforeend", msgHTML);
      msgerChat.scrollTop = msgerChat.scrollHeight;
      
      const copyBtn = document.getElementById(msgId)?.querySelector(".copy-con");
      if (copyBtn) {
        copyBtn.addEventListener("click", () => copyToClipboard(text));
      }
    }

    function appendSystemMessage(text) {
      appendMessage("XPR-WSS", "", "left", escapeHtml(text));
    }

    function sendMessage() {
      const msgText = msgerInput.value.trim();
      if (!msgText || !isConnected) {
        if (!isConnected) {
          showPopup("Not connected to chat!", true);
        }
        return;
      }

      try {
        const messageId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        
        appendMessage(USER_NAME, PERSON_IMG, "right", msgText, messageId);
        
        const messageData = {
          type: "message",
          name: USER_NAME,
          img: PERSON_IMG,
          side: "right",
          text: msgText,
          chatCode: chatCode,
          messageId: messageId
        };
        
        console.log("Sending message:", messageData);
        socket.send(JSON.stringify(messageData));
        
        msgerInput.value = "";
      } catch (error) {
        console.log("Message send error:", error);
        showPopup("Failed to send message!", true);
      }
    }
  }

  const style = document.createElement('style');
  style.textContent = `
    .users-counter {
      position: fixed;
      top: 10px;
      right: 10px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 1000;
    }
    .users-counter.warning {
      background-color: rgba(255, 50, 50, 0.8);
    }
  `;
  document.head.appendChild(style);
});