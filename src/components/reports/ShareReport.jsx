import React, { useState, useEffect } from 'react';
import { getDocs, collection } from "firebase/firestore";
import emailjs from 'emailjs-com';
import { auth, db } from "../../firebase-config";

emailjs.init(import.meta.env.VITE_REACT_PUBLIC_EMAIL_KEY);

const ShareReport = (reportName) => {
    const [showModal, setShowModal] = useState(false);
    const [userEmails, setUserEmails] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState('');

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
        const input = document.getElementById('capture');
        const htmlContent = input.innerHTML;
        sendEmail(htmlContent);
        setShowModal(false);
    };

    const sendEmail = (htmlContent) => {
        const serviceId = import.meta.env.VITE_REACT_EMAIL_SERVICE_ID;
        const templateId = import.meta.env.VITE_REACT_EMAIL_TEMPLATE_ID;
        const templateParams = {
            email: selectedEmail,
            report_name: reportName,
            content: htmlContent
        };
    
        emailjs.send(serviceId, templateId, templateParams)
            .then(response => console.log('Email successfully sent!', response))
            .catch(err => console.error('Failed to send email:', err));
    };

    return (
        <div style={{ paddingTop: '60px' }} >
            <button onClick={() => setShowModal(true)}>Capture and Send Email</button>
            {showModal && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', zIndex: 1000 }}>
                    <p>Select an email to send to: </p>
                    <select onChange={(e) => setSelectedEmail(e.target.value)} value={selectedEmail}>
                        {userEmails.map(email => (
                            <option key={email} value={email}>{email}</option>
                        ))}
                    </select>
                    <button onClick={captureHtml}>Confirm</button>
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
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return users.filter(user => user.email).map(user => user.email); // Ensuring only users with an email are returned
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return [];
    }
}