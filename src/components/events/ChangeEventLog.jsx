import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config.js";
import CustomCalendar from "../tools/CustomCalendar.jsx";
import Help from "../layouts/Help.jsx";

function formatDate(timestamp) {
  if (!timestamp) return "";

  const date = timestamp.toDate();
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

const ChangeEventLog = ({ adjustingEntry, accountName }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const querySnapshot = await getDocs(collection(db, "eventLog"));
      const eventsArray = querySnapshot.docs
        .filter((doc) => {
          let condition1 = doc.id !== "idCounter";
          if (accountName) {
            try {
              let condition2 = doc.data().type === "account";
              console.log(
                accountName.toLowerCase() +
                  " = " +
                  doc.data().after.accountName.toLowerCase()
              );
              let condition3 =
                doc.data().after.accountName.toLowerCase() ===
                accountName.toLowerCase();
              return condition1 && condition2 && condition3;
            } catch (e) {
              return false;
            }
          }
          return condition1;
        })
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => {
          //Convert IDs from string to number for comparison
          const idA = parseInt(a.id, 10);
          const idB = parseInt(b.id, 10);

          //Ensure id 0 is sorted last
          if (idA === 0) return 1; //Always sorts a (with id 0) to the end
          if (idB === 0) return -1; //Always sorts b (with id 0) to the end

          //Descending order for the rest
          return idB - idA;
        });
      setEvents(eventsArray);
    };

    fetchEvents();
  }, []);

  const retrieveIdentifier = (event) => {
    if (typeof event.after.accountName != "undefined") {
      return event.after.accountName;
    }
    if (typeof event.after.DisplayName != "undefined") {
      return event.after.DisplayName;
    }
  };

  return (
    <div className="wrapper">
      {!adjustingEntry && (
        <>
          <CustomCalendar />
          <Help componentName="EventLog" />
          <h1>Event Log</h1>
        </>
      )}

      <table className="event-log-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Time</th>
            <th>Author</th>
            <th>Name</th>
            <th>Type</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>{event.id}</td>
              <td>{formatDate(event.timestamp)}</td>
              <td>{event.author}</td>
              <td>{retrieveIdentifier(event)}</td>
              <td>{event.type}</td>
              <td>
                {Array.isArray(event.diff)
                  ? event.diff.map((change, index) => (
                      <React.Fragment key={index}>
                        {change}
                        <br />
                      </React.Fragment>
                    ))
                  : "No changes recorded"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChangeEventLog;
