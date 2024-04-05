import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CustomCalendar = () => {
    const [showCalendar, setShowCalendar] = useState(false); 
    const toggleCalendar = () => setShowCalendar(!showCalendar); 

    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <>
            <button 
                onClick={toggleCalendar} 
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                style={{ position: 'absolute', top: 0, left: 20, zIndex: 1000 }}>
                {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
                {showTooltip && (
                    <div style={{
                        position: 'absolute',
                        bottom: '10px', 
                        left: '175%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0, 0, 0, 0.50)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                    }}>
                        Click {showCalendar ? 'hide' : 'show'} calendar
                    </div>
                )}
            </button>
            {showCalendar && (
                <div style={{ position: 'absolute', top: '65px', left: '20px', zIndex: 1000 }}>
                    <Calendar />
                </div>
            )}
        </>
    );
};

export default CustomCalendar;