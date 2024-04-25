import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CustomCalendar = ({handleDateSelection, isRange}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarValue, setCalendarValue] = useState(null); 
  const toggleCalendar = () => setShowCalendar(!showCalendar);

  const onDateChange = (value) => {
    setCalendarValue(value); // Updates calendar value when date is changed
    handleDateSelection(value);
  };
  
  const resetDateFilter = () => {
    setCalendarValue(null); // Reset the calendar value to null to clear selection
    handleDateSelection(null); 
  };

  return (
    <div className="calendar-container">
      <button onClick={toggleCalendar}>
        {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
      </button>
      {showCalendar && (
        <>
          <div className="calendar">
          {!isRange ?
          (<Calendar selectRange={false} onChange={onDateChange} value={calendarValue} />) :
          (<Calendar selectRange={true} onChange={onDateChange} value={calendarValue} />) }
        </div>
          <button onClick={resetDateFilter}>Reset</button>
        </>
      )}
    </div>
  );
};

export default CustomCalendar;
