import React, { useState, useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";
import emailjs from "emailjs-com";
import { db } from "../../firebase-config";

emailjs.init(import.meta.env.VITE_REACT_PUBLIC_EMAIL_KEY);

const ShareReport = (reportName) => {
  const [showModal, setShowModal] = useState(false);
  const [userEmails, setUserEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserEmails = async () => {
      const emails = await fetchUsersEmails();
      setUserEmails(emails);
      if (emails.length > 0) {
        setSelectedEmail(emails[0]);
      }
    };
    fetchUserEmails();
  }, []);

  const captureHtml = () => {
    const input = document.getElementById("capture");
    const htmlContent = input.innerHTML;
    if (sendEmail(htmlContent)) {
      setShowModal(false);
    }
  };

  const sendEmail = (htmlContent) => {
    const serviceId = import.meta.env.VITE_REACT_EMAIL_SERVICE_ID;
    const templateId = import.meta.env.VITE_REACT_EMAIL_TEMPLATE_ID;
    const templateParams = {
      email: selectedEmail,
      report_name: reportName,
      content: htmlContent,
    };
    try {
      emailjs
        .send(serviceId, templateId, templateParams)
        .catch((err) => setError("Failed to send email:" + err));
    } catch (e) {
      if (e.includes("user ID is required")) {
        setError(
          e +
            "\n **Developer Note: Update your .env file, see #resources in discord"
        );
      } else {
        setError(e);
      }
      return false;
    }
    return true;
  };

  return (
    <div style={{ paddingTop: "50px" }}>
      <button onClick={() => setShowModal(true)}>Capture and Send Email</button>
      {showModal && (
        <div>
          <p>Select an email to send to: </p>
          <select
            onChange={(e) => setSelectedEmail(e.target.value)}
            value={selectedEmail}
          >
            {userEmails.map((email) => (
              <option key={email} value={email}>
                {email}
              </option>
            ))}
          </select>
          <button onClick={captureHtml}>Confirm</button>
          <p className="error">{error}</p>
          <button onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default ShareReport;

async function fetchUsersEmails() {
  try {
    const usersCollectionRef = collection(db, "users");
    const querySnapshot = await getDocs(usersCollectionRef);
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return users.filter((user) => user.email).map((user) => user.email); //Ensuring only users with an email are returned
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}
