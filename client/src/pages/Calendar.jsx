import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RequestForm from '../components/RequestForm';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [filterType, setFilterType] = useState('');
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchEvents();
    }, [currentDate, filterType]);

    const fetchEvents = async () => {
        try {
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            let url = `http://localhost:5000/api/calendar/events?month=${month}&year=${year}`;
            if (filterType) {
                url += `&type=${filterType}`;
            }
            const res = await axios.get(url, { headers: { token } });
            setEvents(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        return { daysInMonth, startingDay };
    };

    const getEventsForDay = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(event => {
            const eventDate = new Date(event.scheduled_date).toISOString().split('T')[0];
            return eventDate === dateStr;
        });
    };

    const handleDateClick = async (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
        
        try {
            const res = await axios.get(`http://localhost:5000/api/calendar/events/date/${dateStr}`, {
                headers: { token }
            });
            setSelectedDateEvents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
    const days = [];
    
    // Empty cells for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
        days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEvents = getEventsForDay(day);
        const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
        const isSelected = selectedDate === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        days.push(
            <div 
                key={day} 
                className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                onClick={() => handleDateClick(day)}
            >
                <span className="day-number">{day}</span>
                {dayEvents.length > 0 && (
                    <div className="day-events">
                        {dayEvents.slice(0, 2).map((event, idx) => (
                            <div 
                                key={idx} 
                                className={`event-dot ${event.type}`}
                                title={event.subject}
                            >
                                {event.subject.substring(0, 10)}...
                            </div>
                        ))}
                        {dayEvents.length > 2 && (
                            <div className="more-events">+{dayEvents.length - 2} more</div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (loading) return <div>Loading calendar...</div>;

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <h1>Maintenance Calendar</h1>
                <div className="calendar-controls">
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Types</option>
                        <option value="preventive">Preventive Only</option>
                        <option value="corrective">Corrective Only</option>
                    </select>
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        Schedule Maintenance
                    </button>
                </div>
            </div>

            <div className="calendar-nav">
                <button className="btn-secondary" onClick={() => navigateMonth(-1)}>
                    ← Previous
                </button>
                <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                <button className="btn-secondary" onClick={() => navigateMonth(1)}>
                    Next →
                </button>
            </div>

            <div className="calendar-grid">
                {dayNames.map(day => (
                    <div key={day} className="calendar-header-day">{day}</div>
                ))}
                {days}
            </div>

            {selectedDate && (
                <div className="selected-date-panel">
                    <h3>Events on {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                    {selectedDateEvents.length === 0 ? (
                        <p className="no-events">No scheduled maintenance for this date.</p>
                    ) : (
                        <div className="date-events-list">
                            {selectedDateEvents.map(event => (
                                <div key={event.id} className={`date-event-card ${event.type}`}>
                                    <div className="event-header">
                                        <h4>{event.subject}</h4>
                                        <span className={`event-type ${event.type}`}>{event.type}</span>
                                    </div>
                                    <p><strong>Resource:</strong> {event.resource_name}</p>
                                    <p><strong>Time:</strong> {new Date(event.scheduled_date).toLocaleTimeString()}</p>
                                    {event.duration && <p><strong>Duration:</strong> {event.duration}h</p>}
                                    {event.technician_name && <p><strong>Technician:</strong> {event.technician_name}</p>}
                                    {event.team_name && <p><strong>Team:</strong> {event.team_name}</p>}
                                    <p><strong>Status:</strong> <span className={`status-${event.status}`}>{event.status}</span></p>
                                </div>
                            ))}
                        </div>
                    )}
                    <button 
                        className="btn-primary" 
                        onClick={() => setShowForm(true)}
                        style={{ marginTop: '1rem' }}
                    >
                        + Add Maintenance for {new Date(selectedDate + 'T00:00:00').toLocaleDateString()}
                    </button>
                </div>
            )}

            {showForm && (
                <RequestForm 
                    onClose={() => setShowForm(false)} 
                    onSubmit={() => {
                        fetchEvents();
                        if (selectedDate) handleDateClick(parseInt(selectedDate.split('-')[2]));
                    }}
                    defaultDate={selectedDate}
                />
            )}
        </div>
    );
};

export default Calendar;
