import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CustomCalendar = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const toggleCalendar = () => setShowCalendar(!showCalendar);

  const [showTooltip, setShowTooltip] = useState(false);

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
          <Calendar />
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;
