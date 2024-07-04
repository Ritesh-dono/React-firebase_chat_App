
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebaseConfig";
import { useUserStore } from "../../lib/userStore";
import "./detail.css";
import React from 'react';
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";



const Detail = () => {
const {chatId,user,isCurrentUserBlocked,isReceiverBlocked,changeBlock}=useChatStore();
const {currentUser}=useUserStore(); 
  const handleBlock=async ()=>{
   if(!user) return;
const userDocRef=doc(db,"users",currentUser.id);
   try {
    await updateDoc(userDocRef,{
      blocked:isReceiverBlocked?arrayRemove(user.id):arrayUnion(user.id),
    });
    changeBlock()
   } catch (err) {
    console.log(err);
    
   }

  };
  return (
    <div className="details">
      <div className="user1">
        <img src={user?.avatar || "./avatar.png"} alt="User avatar" />
        <h2>{user?.username}</h2>
        <p>Lorem ipsum dor sit amet.</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Setting</span>
            <img src="./arrowUp.png" alt="Arrow up" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="./arrowUp.png" alt="Arrow up" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="Arrow down" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="water.jpg" alt="Water" />
                <span>photo_2024_2.png</span>
              </div>
              <img className="downloadIcon" src="./download.png" alt="Download" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="water.jpg" alt="Water" />
                <span>photo_2024_2.png</span>
              </div>
              <img className="downloadIcon" src="./download.png" alt="Download" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="water.jpg" alt="Water" />
                <span>photo_2024_2.png</span>
              </div>
              <img className="downloadIcon" src="./download.png" alt="Download" />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="Arrow up" />
          </div>
        </div>
        <button onClick={handleBlock}>{
          isCurrentUserBlocked?"You are blocked ":isReceiverBlocked ?"User blocked":"Block user  "



        }
        
        
        </button>
        <button className=" Logout" onClick={()=>auth.signOut()}>LogOut</button>
      </div>
     
    </div>
   
  );
}

export default Detail;
