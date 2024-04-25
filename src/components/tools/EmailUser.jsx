import { useState } from "react";
import SendEmail from "./EmailHandler";
import UserContextProvider, { Context } from "../context/UserContext";

const EmailUser = ({ in_email }) => {
  const { user } = Context();
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleShow = () => {
    setShow(!show);
    setSubmitted(false);
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = async () => {
    await SendEmail(title, in_email, user.email, "", message);
    setTitle("");
    setMessage("");
    setShow(false);
    setSubmitted(true);
  };

  return (
    <>
      <button onClick={toggleShow}>{show ? "Close" : "Email"}</button>
      {show && !submitted && (
      <div>
        <div style={{ margin: "10px 0" }}>
          <label htmlFor="title">Title:</label>
          <input 
            type="text" 
            id="title" 
            value={title}
            onChange={handleTitleChange} 
            style={{ marginLeft: "10px" }} 
          />
        </div>
          <div style={{ margin: "10px 0" }}>
            <label htmlFor="message">Message:</label>
            <textarea 
              id="message" 
              value={message}
              onChange={handleMessageChange}
              style={{ marginLeft: "10px", resize: "both", width: "300px", height: "100px" }}
            />
          </div>
        <button onClick={handleSubmit}>Submit</button>
      </div>
      )}
      {submitted && <div style={{ color: "green" }}>Email Successfully Sent!</div>}
    </>
  );
}

export default EmailUser;