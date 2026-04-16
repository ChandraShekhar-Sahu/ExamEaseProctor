import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function Notify() {
  const handleNotify = () => toast("Wow, so easy!");

  return (
    <div>
      <button onClick={handleNotify}>Show Notification</button>
      <ToastContainer />
    </div>
  );
}

export default Notify;
