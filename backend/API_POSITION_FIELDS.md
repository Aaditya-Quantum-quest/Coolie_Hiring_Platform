# Position Fields API Documentation

## Overview
The booking API now supports `startingPosition` and `endPosition` fields to specify exact pickup and drop-off locations within a station.

---

## Create Booking

### Endpoint
```
POST /api/bookings
```

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body
```json
{
  "station": "New Delhi Railway Station",
  "initialStation": "Mumbai Central",
  "platform": "5",
  "amount": 150,
  "trainNo": "12345",
  "trainName": "Rajdhani Express",
  "luggageImgUrl": "/uploads/luggage_photos/luggage-123.jpg",
  "luggageCount": 2,
  "startingPosition": "Platform 5, Coach B3",
  "endPosition": "Exit Gate B (Parking Area)"
}
```

### New Fields

| Field | Type | Required | Max Length | Description | Example |
|-------|------|----------|------------|-------------|---------|
| `startingPosition` | string | No | 200 | Where customer needs coolie | "Platform 5", "Entrance A", "Coach B3" |
| `endPosition` | string | No | 200 | Where customer wants to go | "Exit B", "Platform 2", "Parking Area" |

### Response
```json
{
  "success": true,
  "booking": {
    "id": "abc-123-def",
    "booking_ref": "BK1234",
    "customer_id": "customer-uuid",
    "coolie_id": "coolie-uuid",
    "initial_station_name": "Mumbai Central",
    "destination_station_name": "New Delhi Railway Station",
    "platform": "5",
    "train_no": "12345",
    "train_name": "Rajdhani Express",
    "amount": 150,
    "status": "pending",
    "otp": "1234",
    "starting_position": "Platform 5, Coach B3",
    "end_position": "Exit Gate B (Parking Area)",
    "created_at": "2026-05-04T10:30:00.000Z",
    "updated_at": "2026-05-04T10:30:00.000Z"
  }
}
```

---

## Get My Bookings

### Endpoint
```
GET /api/bookings/my-bookings
```

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "bookings": [
    {
      "id": "BK1234",
      "coolieId": "coolie-uuid",
      "coolieName": "Rajesh Kumar",
      "coolieRating": 4.8,
      "coolieTrips": 150,
      "coolieBadge": "Gold Porter",
      "initialStation": "Mumbai Central",
      "station": "New Delhi Railway Station",
      "platform": "5",
      "destination": "New Delhi Railway Station",
      "luggageCount": 2,
      "date": "2026-05-04",
      "time": "10:30",
      "amount": 150,
      "status": "pending",
      "paymentStatus": "pending",
      "rating": 0,
      "reviewText": "",
      "otp": "1234",
      "trainNo": "12345",
      "trainName": "Rajdhani Express",
      "luggageImgUrl": "/uploads/luggage_photos/luggage-123.jpg",
      "startingPosition": "Platform 5, Coach B3",
      "endPosition": "Exit Gate B (Parking Area)"
    }
  ]
}
```

---

## Get Booking Details

### Endpoint
```
GET /api/bookings/:id
```

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "booking": {
    "id": "abc-123-def",
    "booking_ref": "BK1234",
    "customer_id": "customer-uuid",
    "coolie_id": "coolie-uuid",
    "initial_station_name": "Mumbai Central",
    "destination_station_name": "New Delhi Railway Station",
    "platform": "5",
    "train_no": "12345",
    "train_name": "Rajdhani Express",
    "amount": 150,
    "status": "pending",
    "starting_position": "Platform 5, Coach B3",
    "end_position": "Exit Gate B (Parking Area)",
    "coolieName": "Rajesh Kumar",
    "cooliePhoto": "/uploads/passport_photos/...",
    "customerName": "John Doe",
    "customerPhone": "+91-9876543210",
    "created_at": "2026-05-04T10:30:00.000Z"
  }
}
```

---

## Common Use Cases

### Use Case 1: Platform to Exit
```json
{
  "startingPosition": "Platform 5",
  "endPosition": "Exit Gate B"
}
```

### Use Case 2: Entrance to Platform
```json
{
  "startingPosition": "Main Entrance",
  "endPosition": "Platform 12"
}
```

### Use Case 3: Platform to Platform (Transfer)
```json
{
  "startingPosition": "Platform 3",
  "endPosition": "Platform 8"
}
```

### Use Case 4: Specific Coach Location
```json
{
  "startingPosition": "Platform 5, Coach B3",
  "endPosition": "Exit Gate A (Taxi Stand)"
}
```

---

## Backward Compatibility

### Old Bookings (without position fields)
```json
{
  "startingPosition": null,
  "endPosition": null
}
```

### Creating Booking Without Position Fields
Still works! Fields are optional:
```json
{
  "station": "New Delhi Railway Station",
  "platform": "5",
  "amount": 150
  // startingPosition and endPosition omitted
}
```

---

## Validation Rules

1. **Optional Fields**: Both fields are optional
2. **Max Length**: 200 characters each
3. **Format**: Free text (no specific format required)
4. **Null Handling**: Backend handles null/undefined gracefully
5. **Display**: Frontend should show "Not specified" if null

---

## Frontend Integration Example

### React/JavaScript
```javascript
// Booking Form
const [formData, setFormData] = useState({
  station: '',
  platform: '',
  amount: 0,
  startingPosition: '',
  endPosition: ''
});

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });
  
  const data = await response.json();
  console.log('Booking created:', data.booking);
};

// Display Booking
const BookingDetails = ({ booking }) => (
  <div>
    <h3>Trip Details</h3>
    <p><strong>From:</strong> {booking.startingPosition || 'Not specified'}</p>
    <p><strong>To:</strong> {booking.endPosition || 'Not specified'}</p>
    <p><strong>Platform:</strong> {booking.platform}</p>
  </div>
);
```

---

## Testing with cURL

### Create Booking with Positions
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "station": "New Delhi Railway Station",
    "initialStation": "Mumbai Central",
    "platform": "5",
    "amount": 150,
    "trainNo": "12345",
    "trainName": "Rajdhani Express",
    "luggageImgUrl": "/uploads/luggage_photos/test.jpg",
    "luggageCount": 2,
    "startingPosition": "Platform 5, Coach B3",
    "endPosition": "Exit Gate B"
  }'
```

### Get Bookings
```bash
curl -X GET http://localhost:5000/api/bookings/my-bookings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Handling

### Invalid Data
```json
{
  "success": false,
  "message": "Validation error"
}
```

### Position Too Long (>200 chars)
Database will truncate or return error depending on configuration.

**Recommendation**: Add frontend validation to limit input to 200 characters.

---

## Database Schema

```sql
ALTER TABLE bookings 
ADD COLUMN starting_position VARCHAR(200),
ADD COLUMN end_position VARCHAR(200);
```

### Indexes (Optional - for performance)
```sql
CREATE INDEX idx_bookings_positions 
ON bookings(starting_position, end_position);
```

---

## Socket.io Real-time Updates

When a booking is created, coolies receive real-time notification via Socket.io:

```javascript
// Coolie receives
socket.on('booking:new-request', (data) => {
  console.log('New booking:', data);
  // data includes all booking fields including positions
});
```

---

## Migration Status

✅ Database schema updated
✅ Backend API updated
✅ Backward compatible
🔧 Frontend updates required

---

## Support

For issues or questions:
1. Check `POSITION_FIELDS_IMPLEMENTATION.md`
2. Run test script: `node backend/scripts/test_position_fields.js`
3. Check backend logs for errors
