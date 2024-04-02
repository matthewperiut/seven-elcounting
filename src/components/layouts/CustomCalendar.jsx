import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CustomCalendar = () => {
    const [showCalendar, setShowCalendar] = useState(false); 
    const toggleCalendar = () => setShowCalendar(!showCalendar); 

    return (
        <>
            <button onClick={toggleCalendar} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }}>
                {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
            </button>
            {showCalendar && (
                <div style={{ position: 'absolute', top: '180px', left: '20px', zIndex: 1000 }}>
                    <Calendar />
                </div>
            )}
        </>
    );
};

export default CustomCalendar;