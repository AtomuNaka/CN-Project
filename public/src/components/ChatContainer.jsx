import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";
import ReactPlayer from "react-player";
import ConvertAudio from "./ConvertAudio";

export default function ChatContainer({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        );

        const response = await fetch(recieveMessageRoute, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: data._id,
            to: currentChat._id,
          }),
        });

        const responseData = await response.json();
        setMessages(responseData);
      } catch (error) {
        console.error("Error fetching messages:", error);
        // Handle network or other errors
      }
    };

    fetchData();
  }, [currentChat]);

  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        )._id;
      }
    };
    getCurrentChat();
  }, [currentChat]);

  const handleSendMsg = async (msg) => {
    try {
      const data = JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      // Emit message using socket
      socket.current.emit("send-msg", {
        to: currentChat._id,
        from: data._id,
        msg,
      });
      // Make HTTP POST request using fetch
      await fetch(sendMessageRoute, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: data._id,
          to: currentChat._id,
          message: msg,
        }),
      });

      // Update local state with the new message
      const msgs = [...messages];
      msgs.push({ fromSelf: true, message: msg });
      setMessages(msgs);
    } catch (error) {
      console.error("Error sending message:", error);
      // Handle network or other errors
    }
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        hideMenu();
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const showMenu = (e) => {
    e.preventDefault();
    setIsVisible(true);

    // const menuHeight = 100; // Set the height of your menu
    // const minX = 10; // Set the minimum distance from the left

    // const triggerRect = triggerRef.current.getBoundingClientRect();
    // const scrollY = window.scrollY || window.pageYOffset; // Consider the scroll position

    // const top = e.top;
    // const left = Math.max(minX, triggerRect.left + window.scrollX);

    setPosition({ x: e.pageX, y: e.pageY });
  };

  const hideMenu = () => {
    setIsVisible(false);
  };

  const handleMenuItemCopy = (copiedText) => {
    hideMenu();
    // Now you can use the value of message.message (copiedText) here
    // For example, you can copy it to the clipboard
    navigator.clipboard
      .writeText(copiedText)
      .then(() => {
        console.log("Text copied to clipboard:", copiedText);
      })
      .catch((err) => {
        console.error("Unable to copy text to clipboard", err);
      });
  };

  const handleFileSelection = (event) => {
    const selectedFile = event.target.files[0];
    // Add your logic for handling the selected file here
    handleSendMsg(selectedFile);
  };
  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt=""
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
        <form>
          <label htmlFor="fileInput" style={{ color: "white" }}>
            Select File:
          </label>
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={handleFileSelection}
          />
          <button
            type="button"
            onClick={() => document.getElementById("fileInput").click()}
          >
            Choose File
          </button>
        </form>
      </div>
      <div className="chat-messages">
        {messages.map((message) => {
          const recordedBlob =
            typeof message.message === "string" &&
            message.message.includes("blob:http://localhost:3000");
          const isYouTubeLink =
            typeof message.message === "string" &&
            message.message.includes("https://www.youtube.com/watch?");
          const isImage =
            typeof message.message === "string" &&
            message.message.includes(".png");
          const isFile = message.message instanceof File;
          return (
            <div ref={scrollRef} key={uuidv4()}>
              <div
                className={`message ${
                  message.fromSelf ? "sended" : "recieved"
                }`}
              >
                <div
                  className={`message ${
                    message.fromSelf ? "sended" : "received"
                  }`}
                ></div>
                <div
                  className="content"
                  key={message.id}
                  style={{ cursor: "context-menu", color: "white" }}
                  onContextMenu={showMenu}
                  ref={triggerRef}
                >
                  {recordedBlob ? (
                    <ConvertAudio message={message.message} />
                  ) : isFile ? (
                    <p>File: {message.message.name}</p>
                  ) : isImage ? (
                    <img src={message.message} alt="img"></img>
                  ) : isYouTubeLink ? (
                    <ReactPlayer
                      url={message.message}
                      width="280px"
                      height="210px"
                      controls={true}
                    />
                  ) : (
                    <>{message.message}</>
                  )}
                </div>
                {isVisible && (
                  <div
                    className="custom-menu"
                    style={{ top: position.y, left: position.x }}
                    ref={menuRef}
                  >
                    <div onClick={() => handleMenuItemCopy(message.message)}>
                      Copy
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;
