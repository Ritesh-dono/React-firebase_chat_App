import { useEffect, useState } from 'react';
import "./chatList.css";
import AddUser from '../chatList/addUser/AddUser';
import { useUserStore } from '../../../lib/userStore';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
import { useChatStore } from '../../../lib/chatStore';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput ] = useState("");
  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      if (!res.exists() || !res.data().chats) {
        setChats([]);
        return;
      };

      const items = res.data().chats;
      const promises = items.map(async (item) => {
        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef);
        const user = userDocSnap.data();
        return { ...item, user };
      });

      const chatData = await Promise.all(promises);
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const updatedChats = chats.map(item => {
      if (item.chatId === chat.chatId) {
        return { ...item, isSeen: true };
      }
      return item;
    });

    const userChatsRef = doc(db, "userchats", currentUser.id);
    try {
      await updateDoc(userChatsRef, {
        chats: updatedChats.map(({ user, ...rest }) => rest), // Remove user object before updating Firestore
      });
      setChats(updatedChats); // Update local state to reflect seen status
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log(err);
    }
  };
  const filterdChats=chats.filter(c=>c. user.username.toLowerCase().includes(input.toLowerCase()))

  return (
    <div className="chatlist">
      <div className="search">
        <div className="searchBAR">
          <img src="./search.png" alt="Search Icon" />
          <input type="text" placeholder="Search" onChange={ (e)=>setInput(e.target.value)} />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt={addMode ? "Minus Icon" : "Plus Icon"}
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {filterdChats.map((chat) => (
        <div
          className={`items ${chat.isSeen ? "seen" : "unseen"}`} // Apply class based on seen status
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
        >
          <img src={chat.user.blocked.includes(currentUser.id)? "./avatar.png":chat.user.avatar|| "./avatar.png" }alt="Avatar" />
          <div className="texts">
            <span>{chat.user.blocked.includes(currentUser.id)? "User":chat.user.username }</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
