import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import {db} from "../../firebase-config.js";

const EventLog = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
      const fetchEvents = async () => {
          const querySnapshot = await getDocs(collection(db, "eventLog"));
          const eventsArray = querySnapshot.docs
              .filter(doc => doc.id !== "idCounter")
              .map(doc => ({
                  id: doc.id,
                  ...doc.data(),
              }))
              .sort((a, b) => {
                  // Convert IDs from string to number for comparison
                  const idA = parseInt(a.id, 10);
                  const idB = parseInt(b.id, 10);

                  // Ensure id 0 is sorted last
                  if (idA === 0) return 1; // Always sorts a (with id 0) to the end
                  if (idB === 0) return -1; // Always sorts b (with id 0) to the end

                  // Descending order for the rest
                  return idB - idA;
              });
          setEvents(eventsArray);
      };

    fetchEvents();
  }, []);

  return (
      <>
        <h1>Event Log</h1>
        <table className="event-log-table">
          <thead>
          <tr>
            <th>ID</th>
            <th>Author</th>
            <th>Type</th>
            <th>Change</th>
          </tr>
          </thead>
          <tbody>
          {events.map(event => (
              <tr key={event.id}>
                <td>{event.id}</td>
                <td>{event.author}</td>
                <td>{event.type}</td>
                <td>
                  {Array.isArray(event.diff) ? event.diff.map((change, index) => (
                      <React.Fragment key={index}>
                        {change}<br/>
                      </React.Fragment>
                  )) : 'No changes recorded'}
                </td>
              </tr>
          ))}
          </tbody>
        </table>
      </>
  );
}

export default EventLog;
