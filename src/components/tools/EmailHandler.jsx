import emailjs from "emailjs-com";

emailjs.init(import.meta.env.VITE_REACT_PUBLIC_EMAIL_KEY);

const SendEmail = (title, to_email, from_name, to_name, message) => {
  const serviceId = import.meta.env.VITE_REACT_EMAIL_SERVICE_ID;
  const templateId = "template_ztmqd9r";
  const templateParams = {
    title: title,
    email: to_email,
    from_name: from_name,
    to_name: to_name,
    message: message,
  };

  return emailjs.send(serviceId, templateId, templateParams).catch((err) => {
    throw new Error("Failed to send email: " + err.message); //Throwing an error to be caught by the calling function
  });
};

export default SendEmail;
