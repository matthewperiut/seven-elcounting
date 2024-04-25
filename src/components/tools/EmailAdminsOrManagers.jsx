import { useState } from "react";
import SendEmail from "./EmailHandler";
import UserContextProvider, { Context } from "../context/UserContext";

const EmailAdminsOrManagers = () => {
    const { user } = Context();
    const [show, setShow] = useState(false);
    const [issue, setIssue] = useState("");
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const toggleShow = () => {
        setShow(!show);
        setSubmitted(false);
    };

    const handleIssueChange = (event) => {
        setIssue(event.target.value);
    };

    const handleMessageChange = (event) => {
        setMessage(event.target.value);
    };

    const handleSubmit = async () => {
        console.log("Submitting Issue:", issue, "Message:", message);
        await SendEmail("Issue Report: " + issue, "matthewperiut@gmail.com", user.email, "Manager", message);
        setIssue("");
        setMessage("");
        setShow(false);
        setSubmitted(true);
    };

    return (
        <div>
            <button onClick={toggleShow}>{show ? "Close Form" : "Email Managers for Assistance"}</button>
            {show && !submitted && (
                <div>
                    <div style={{ margin: "10px 0" }}>
                        <label htmlFor="issue">Issue:</label>
                        <input 
                            type="text" 
                            id="issue" 
                            value={issue}
                            onChange={handleIssueChange} 
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
            {submitted && <div style={{ color: "green" }}>Email Submitted!</div>}
        </div>
    );
}

export default EmailAdminsOrManagers;