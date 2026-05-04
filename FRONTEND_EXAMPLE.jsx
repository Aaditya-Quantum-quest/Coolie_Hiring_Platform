/**
 * Frontend Example: Booking Form with Position Fields
 * 
 * This is a reference implementation showing how to add the "From" and "To" fields
 * to your existing booking form.
 * 
 * Adapt this code to match your actual component structure and styling.
 */

import React, { useState } from 'react';

const BookingFormExample = () => {
  // Existing state
  const [station, setStation] = useState('');
  const [platform, setPlatform] = useState('');
  const [trainNo, setTrainNo] = useState('');
  const [trainName, setTrainName] = useState('');
  
  // ✨ NEW: Position fields state
  const [startingPosition, setStartingPosition] = useState('');
  const [endPosition, setEndPosition] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const bookingData = {
      station,
      initialStation: 'Current Station', // Your logic here
      platform,
      trainNo,
      trainName,
      amount: 150, // Your pricing logic
      luggageImgUrl: '/uploads/luggage_photos/example.jpg',
      luggageCount: 2,
      // ✨ NEW: Include position fields
      startingPosition,
      endPosition
    };

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Booking created successfully!');
        console.log('Booking:', data.booking);
      } else {
        alert('Booking failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <h2>Book a Coolie</h2>

      {/* Existing fields */}
      <div className="form-group">
        <label>Destination Station</label>
        <input
          type="text"
          placeholder="e.g., New Delhi Railway Station"
          value={station}
          onChange={(e) => setStation(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Platform Number</label>
        <input
          type="text"
          placeholder="e.g., 5"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          required
        />
      </div>

      {/* ✨ NEW: Starting Position Field */}
      <div className="form-group">
        <label>
          From (Starting Position)
          <span className="optional-badge">Optional</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Platform 5, Coach B3, Entrance A"
          value={startingPosition}
          onChange={(e) => setStartingPosition(e.target.value)}
          maxLength={200}
        />
        <small className="help-text">
          Where should the coolie meet you?
        </small>
      </div>

      {/* ✨ NEW: End Position Field */}
      <div className="form-group">
        <label>
          To (Destination)
          <span className="optional-badge">Optional</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Exit Gate B, Platform 2, Parking Area"
          value={endPosition}
          onChange={(e) => setEndPosition(e.target.value)}
          maxLength={200}
        />
        <small className="help-text">
          Where do you want to go?
        </small>
      </div>

      <div className="form-group">
        <label>Train Number</label>
        <input
          type="text"
          placeholder="e.g., 12345"
          value={trainNo}
          onChange={(e) => setTrainNo(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Train Name</label>
        <input
          type="text"
          placeholder="e.g., Rajdhani Express"
          value={trainName}
          onChange={(e) => setTrainName(e.target.value)}
        />
      </div>

      <button type="submit" className="btn-submit">
        Book Coolie
      </button>
    </form>
  );
};

export default BookingFormExample;

/**
 * CSS Example (add to your stylesheet)
 */
const styles = `
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.optional-badge {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  font-weight: normal;
  color: #666;
  background: #f0f0f0;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.help-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #666;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-submit:hover {
  background: #4338ca;
}
`;

/**
 * Booking Details Display Example
 */
const BookingDetailsExample = ({ booking }) => {
  return (
    <div className="booking-details">
      <h2>Trip Details</h2>
      
      <div className="detail-row">
        <span className="label">Current Station</span>
        <span className="value">{booking.initialStation}</span>
      </div>

      <div className="detail-row">
        <span className="label">Destination Station</span>
        <span className="value">{booking.station}</span>
      </div>

      <div className="detail-row">
        <span className="label">Platform</span>
        <span className="value">{booking.platform}</span>
      </div>

      {/* ✨ NEW: Display position fields */}
      {(booking.startingPosition || booking.endPosition) && (
        <div className="position-section">
          <h3>Journey Details</h3>
          
          {booking.startingPosition && (
            <div className="detail-row">
              <span className="label">📍 From</span>
              <span className="value">{booking.startingPosition}</span>
            </div>
          )}

          {booking.endPosition && (
            <div className="detail-row">
              <span className="label">🎯 To</span>
              <span className="value">{booking.endPosition}</span>
            </div>
          )}
        </div>
      )}

      <div className="detail-row">
        <span className="label">Train Number</span>
        <span className="value">{booking.trainNo}</span>
      </div>

      <div className="detail-row">
        <span className="label">Train Name</span>
        <span className="value">{booking.trainName}</span>
      </div>

      <div className="detail-row">
        <span className="label">Amount</span>
        <span className="value">₹{booking.amount}</span>
      </div>

      <div className="detail-row">
        <span className="label">Status</span>
        <span className={`status-badge ${booking.status}`}>
          {booking.status}
        </span>
      </div>
    </div>
  );
};

/**
 * Common Position Suggestions (Optional Enhancement)
 */
const PositionSuggestions = {
  starting: [
    'Platform 1',
    'Platform 2',
    'Platform 3',
    'Platform 4',
    'Platform 5',
    'Main Entrance',
    'North Entrance',
    'South Entrance',
    'Parking Area',
    'Waiting Room'
  ],
  ending: [
    'Exit Gate A',
    'Exit Gate B',
    'Exit Gate C',
    'Platform 1',
    'Platform 2',
    'Taxi Stand',
    'Parking Area',
    'Metro Station',
    'Bus Stand',
    'Auto Stand'
  ]
};

/**
 * Enhanced Input with Suggestions (Optional)
 */
const PositionInputWithSuggestions = ({ value, onChange, suggestions, placeholder, label }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="form-group position-input">
      <label>{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        maxLength={200}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => {
                onChange(suggestion);
                setShowSuggestions(false);
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Usage Example with Suggestions
 */
const EnhancedBookingForm = () => {
  const [startingPosition, setStartingPosition] = useState('');
  const [endPosition, setEndPosition] = useState('');

  return (
    <form>
      <PositionInputWithSuggestions
        label="From (Starting Position)"
        placeholder="e.g., Platform 5"
        value={startingPosition}
        onChange={setStartingPosition}
        suggestions={PositionSuggestions.starting}
      />

      <PositionInputWithSuggestions
        label="To (Destination)"
        placeholder="e.g., Exit Gate B"
        value={endPosition}
        onChange={setEndPosition}
        suggestions={PositionSuggestions.ending}
      />
    </form>
  );
};
