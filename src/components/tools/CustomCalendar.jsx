import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CustomCalendar = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const toggleCalendar = () => setShowCalendar(!showCalendar);

  const [showTooltip, setShowTooltip] = useState(false);

  // Function to process dates further
  const processDates = (startDate, endDate) => {
    // Here you can call another function or perform actions with the dates
    console.log("Start Date:", startDate, "End Date:", endDate);
    // For example, calling another function: sendDatesSomewhere(startDate, endDate);
  };

  const handleDateSelection = (range) => {
    if (range.length === 2) { // Ensure both dates are selected
      const startDate = range[0].toDate();
      const endDate = range[1].toDate();
      // Pass the dates to the processDates function
      processDates(startDate, endDate);
    }
  };

  return (
    <div className="calendar-container">
      <button
        onClick={toggleCalendar}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {showCalendar ? "Hide Calendar" : "Show Calendar"}
      </button>
      {showTooltip && (
        <div className="tooltip">
          Click to {showCalendar ? "Hide" : "Show"} Calendar
        </div>
      )}
      {showCalendar && (
        <div className="calendar">
          <Calendar selectRange={true} onChange={handleDateSelection} />
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;
