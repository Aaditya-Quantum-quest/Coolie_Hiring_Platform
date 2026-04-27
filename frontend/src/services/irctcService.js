/**
 * IRCTC RapidAPI Service
 * Base URL : https://irctc1.p.rapidapi.com
 * All endpoints centralised here — import and use in any component.
 */

const BASE_URL = 'https://irctc1.p.rapidapi.com'

const HEADERS = {
  'x-rapidapi-key': '10e73efc9cmsh7c1fd2c49c363a5p1f1c13jsncfa8684f9afc',
  'x-rapidapi-host': 'irctc1.p.rapidapi.com',
  'Content-Type': 'application/json',
}

/** Generic GET helper */
async function get(path, params = {}) {
  const url = new URL(BASE_URL + path)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v)
  })

  const res = await fetch(url.toString(), { method: 'GET', headers: HEADERS })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`IRCTC API error ${res.status}: ${text}`)
  }

  const json = await res.json()
  return json
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Search Train
// ─────────────────────────────────────────────────────────────────────────────
export async function searchTrain(query) {
  try {
    return await get('/api/v1/searchTrain', { query })
  } catch (err) {
    console.warn('IRCTC API failed, using mock fallback:', err.message)
    // Mock fallback for testing when quota is exceeded
    const mockData = [
      { train_number: '12301', train_name: 'Howrah Rajdhani Express' },
      { train_number: '12002', train_name: 'Bhopal Shatabdi Express' },
      { train_number: '12951', train_name: 'Mumbai Rajdhani Express' },
      { train_number: '22415', train_name: 'Vande Bharat Express' },
    ].filter(t => t.train_number.includes(query) || t.train_name.toLowerCase().includes(query.toLowerCase()))
    
    return { status: true, data: mockData }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Search Station
// ─────────────────────────────────────────────────────────────────────────────
export async function searchStation(query) {
  try {
    return await get('/api/v1/searchStation', { query })
  } catch (err) {
    console.warn('IRCTC API failed, using mock fallback:', err.message)
    const mockData = [
      { station_code: 'NDLS', station_name: 'New Delhi' },
      { station_code: 'HWH', station_name: 'Howrah Junction' },
      { station_code: 'CSMT', station_name: 'Mumbai CSMT' },
      { station_code: 'MAS', station_name: 'MGR Chennai Central' },
      { station_code: 'SBC', station_name: 'KSR Bengaluru City' },
      { station_code: 'RMU', station_name: 'Rampur Junction' },
      { station_code: 'MB', station_name: 'Moradabad Junction' },
    ].filter(s => s.station_code.includes(query.toUpperCase()) || s.station_name.toLowerCase().includes(query.toLowerCase()))
    
    return { status: true, data: mockData }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Trains Between Stations
// ─────────────────────────────────────────────────────────────────────────────
export async function getTrainsBetweenStations(fromStationCode, toStationCode, dateOfJourney) {
  try {
    return await get('/api/v3/trainBetweenStations', { fromStationCode, toStationCode, dateOfJourney })
  } catch (err) {
    console.warn('IRCTC API failed, using mock fallback:', err.message)
    // Dynamic mock generator based on user input
    const mockData = [
      {
        train_number: '12230',
        train_name: 'Lucknow Mail',
        departure_time: '02:40',
        arrival_time: '03:20',
        duration: '00:40',
        run_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        classes: ['1A', '2A', '3A', 'SL'],
        delay: 'On Time',
        status: 'Running',
        route: `LKO - BE - ${fromStationCode} - ${toStationCode} - GZB - NDLS`
      },
      {
        train_number: '15036',
        train_name: 'Uttarakhand Sampark Kranti',
        departure_time: '11:25',
        arrival_time: '12:15',
        duration: '00:50',
        run_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        classes: ['CC', '2S'],
        delay: '15 mins late',
        status: 'Running',
        route: `KGM - ${fromStationCode} - ${toStationCode} - GZB - DLI`
      },
      {
        train_number: '12039',
        train_name: 'Kathgodam Shatabdi Express',
        departure_time: '18:10',
        arrival_time: '18:50',
        duration: '00:40',
        run_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        classes: ['EC', 'CC'],
        delay: 'On Time',
        status: 'Running',
        route: `KGM - HDW - ${fromStationCode} - ${toStationCode} - GZB - NDLS`
      },
      {
        train_number: '22453',
        train_name: 'Rajya Rani Express',
        departure_time: '20:15',
        arrival_time: '21:05',
        duration: '00:50',
        run_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        classes: ['2S', 'CC'],
        delay: '5 mins late',
        status: 'Running',
        route: `LKO - ${fromStationCode} - ${toStationCode} - MTC`
      }
    ]
    return { status: true, data: { trains: mockData } }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Live Train Status  ← MOST CRITICAL
// ─────────────────────────────────────────────────────────────────────────────
export async function getLiveTrainStatus(trainNo, startDay = 1) {
  return get('/api/v1/liveTrainStatus', { trainNo, startDay })
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Live Train Schedule (full route)
// ─────────────────────────────────────────────────────────────────────────────
export async function getLiveTrainSchedule(trainNo, startDay = 1) {
  return get('/api/v1/liveTrainSchedule', { trainNo, startDay })
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. PNR Status
// ─────────────────────────────────────────────────────────────────────────────
export async function getPNRStatus(pnrNumber) {
  return get('/api/v3/getPNRStatus', { pnrNumber })
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Check Seat Availability
// ─────────────────────────────────────────────────────────────────────────────
export async function checkSeatAvailability({ classType, fromStationCode, quota, toStationCode, trainNo, date }) {
  return get('/api/v2/checkSeatAvailability', { classType, fromStationCode, quota, toStationCode, trainNo, date })
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Get Train Classes
// ─────────────────────────────────────────────────────────────────────────────
export async function getTrainClasses(trainNo) {
  return get('/api/v1/getTrainClasses', { trainNo })
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Get Fare
// ─────────────────────────────────────────────────────────────────────────────
export async function getFare(trainNo, fromStationCode, toStationCode) {
  return get('/api/v2/getFare', { trainNo, fromStationCode, toStationCode })
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Get Trains By Station
// ─────────────────────────────────────────────────────────────────────────────
export async function getTrainsByStation(stationCode) {
  return get('/api/v3/getTrainsByStation', { stationCode })
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Get Live Station Board
// ─────────────────────────────────────────────────────────────────────────────
export async function getLiveStation(fromStationCode, hours = 2, toStationCode = '') {
  return get('/api/v3/getLiveStation', { fromStationCode, toStationCode, hours })
}
