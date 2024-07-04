import "./chat.css";
import React, { useEffect, useRef, useState } from 'react';
import EmojiPicker from "emoji-picker-react";
import AddUser from "../list/chatList/addUser/AddUser";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";


const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({ file: null, url: "" });
  const { currentUser } = useUserStore();
  const { chatId, user ,isCurrentUserBlocked,isReceiverBlocked } = useChatStore();
  const endRef = useRef(null);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setImg({ file, url: URL.createObjectURL(file) });
    }
  };

  const handleSend = async () => {
    if (text === "" && !img.file) return;

    let imgUrl = null;
    if (img.file) {
      imgUrl = await upload(img.file);
    }

    const messageData = {
      senderId: currentUser.id,
      text,
      createdAt: new Date(),
      ...(imgUrl && { img: imgUrl })
    };

    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(messageData),
      });

      const userIds = [currentUser.id, user.id];
      for (const id of userIds) {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);
          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text || "Image";
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
            userChatsData.chats[chatIndex].updatedAt = Date.now();
            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      }
    } catch (err) {
      console.log(err);
    }

    setImg({ file: null, url: "" });
    setText("");
  };

  const [addMode] = useState(false);
  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png" }alt="User Avatar" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>king of the hell</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="Phone Icon" />
          <img src="./video.png" alt="Video Icon" />
          <img src="./info.png" alt="Info Icon" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createdAt}>
            {message.img && <img src={message.img} alt="Sent Image" />}
            <div className="texts">
              <p>{message.text}</p>
              <span>1 min ago</span>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="Preview" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="Image Icon" />
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />
          <img src="./camera.png" alt="Camera Icon" />
          <img src="./mic.png" alt="Microphone Icon" />
        </div>
        <input
          type="text"
          placeholder={ isCurrentUserBlocked || isReceiverBlocked? "you cannot send message":"Type a message..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked|| isReceiverBlocked} 
        />
        <div className="emoji">
          <img src="./emoji.png" alt="Emoji Icon" onClick={() => setOpen((prev) => !prev)} />
          {open && <div className="picker"><EmojiPicker onEmojiClick={handleEmoji} /></div>}
        </div>
        <button className="sendBtn" onClick={handleSend} disabled={isCurrentUserBlocked|| isReceiverBlocked}>Send</button>
      </div>
      {addMode && <AddUser /> }
    </div>
  );
};

export default Chat;
