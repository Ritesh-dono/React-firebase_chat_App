import "./list.css"
import ChatList from"./chatList/ChatList";
import Userinfo from "./userInfo/Userinfo"



import React from 'react'
const List =()=> {
  return (
    <div className="list">
     
      <Userinfo />
      <ChatList />

    </div>
  )
}

export default List

