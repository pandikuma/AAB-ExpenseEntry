import React from "react";
import "./Topbar.css";
import notification from '../Images/notification.png'
import menu from '../Images/menu.png'

const Topbar = () => {
  return (
    <div>

      <div className="topbar">
      <div className="usermenu">
            <img src={menu}></img>
          </div>
        <div className="user-info">
          <img src={notification} alt="#"></img>
          <img
            src="https://via.placeholder.com/40"
            alt="User"
            className="user-avatar"
          />
          <span>Karan Gupta</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
