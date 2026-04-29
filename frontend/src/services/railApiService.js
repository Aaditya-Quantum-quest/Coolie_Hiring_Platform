/**
 * Rail Radar API Service
 * Base URL : https://api.railradar.org
 */

const BASE_URL = 'https://api.railradar.org'
const API_KEY = 'rr_fgu9dnlqvaa8hl78ee22cog2q8bbq723'

const headers = {
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json',
}

/** Generic GET helper */
async function get(path, params = {}) {
  const url = new URL(BASE_URL + path)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v)
  })

  const res = await fetch(url.toString(), { method: 'GET', headers })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`RailRadar API error ${res.status}: ${text}`)
  }

  const json = await res.json()
  return json
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Search Station
// ─────────────────────────────────────────────────────────────────────────────
export async function searchStation(q) {
  try {
    const res = await get('/api/v1/search/stations', { query: q })
    console.log('RailRadar Station Search Response:', res)
    
    // Attempt to find the array of stations
    let rawStations = []
    if (res && res.data) {
      if (Array.isArray(res.data)) {
        rawStations = res.data
      } else if (Array.isArray(res.data.stations)) {
        rawStations = res.data.stations
      }
    } else if (res && Array.isArray(res.stations)) {
      rawStations = res.stations
    } else if (Array.isArray(res)) {
      rawStations = res
    }

    if (!Array.isArray(rawStations)) rawStations = []
    
    // Normalize station objects to have station_name and station_code
    const normalized = rawStations.map(s => ({
      ...s,
      station_name: s.station_name || s.name || s.label || s.stationName || '',
      station_code: s.station_code || s.code || s.value || s.stationCode || ''
    }))

    return { status: true, data: normalized }
  } catch (err) {
    console.error('RailRadar searchStation failed:', err)
    return { status: false, data: [], error: err.message }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Search Train
// ─────────────────────────────────────────────────────────────────────────────
export async function searchTrain(q) {
  try {
    const res = await get('/api/v1/search/trains', { query: q })
    console.log('RailRadar Train Search Response:', res)
    
    let rawTrains = []
    if (res && res.data) {
      if (Array.isArray(res.data)) {
        rawTrains = res.data
      } else if (Array.isArray(res.data.trains)) {
        rawTrains = res.data.trains
      }
    } else if (res && Array.isArray(res.trains)) {
      rawTrains = res.trains
    } else if (Array.isArray(res)) {
      rawTrains = res
    }

    if (!Array.isArray(rawTrains)) rawTrains = []

    // Normalize train objects
    const normalized = rawTrains.map(t => ({
      ...t,
      train_name: t.train_name || t.name || t.trainName || '',
      train_number: t.train_number || t.number || t.trainNumber || ''
    }))

    return { status: true, data: normalized }
  } catch (err) {
    console.error('RailRadar searchTrain failed:', err)
    return { status: false, data: [], error: err.message }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Trains Between Stations
// ─────────────────────────────────────────────────────────────────────────────
export async function getTrainsBetweenStations(from, to, date) {
  try {
    const res = await get('/api/v1/trains/between', { from, to, date })
    return { status: true, data: { trains: res.trains || res.data || res } }
  } catch (err) {
    console.error('RailRadar getTrainsBetweenStations failed:', err)
    throw err
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Live Train Status / Full Train Data
// ─────────────────────────────────────────────────────────────────────────────
export async function getLiveTrainStatus(trainNumber) {
  try {
    const res = await get(`/api/v1/trains/${trainNumber}`)
    return { status: true, data: res }
  } catch (err) {
    console.error('RailRadar getLiveTrainStatus failed:', err)
    throw err
  }
}
// ─────────────────────────────────────────────────────────────────────────────
// 7. PNR Status (Not supported by RailRadar)
// ─────────────────────────────────────────────────────────────────────────────
export async function getPNRStatus(pnrNumber) {
  return { status: false, message: 'PNR Status is currently unavailable on the new RailRadar API.' }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Train Schedule
// ─────────────────────────────────────────────────────────────────────────────
export async function getLiveTrainSchedule(trainNumber) {
  try {
    const res = await get(`/api/v1/trains/${trainNumber}/schedule`)
    return { status: true, data: res }
  } catch (err) {
    console.error('RailRadar getLiveTrainSchedule failed:', err)
    throw err
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Live Station Board
// ─────────────────────────────────────────────────────────────────────────────
export async function getLiveStation(stationCode) {
  try {
    const res = await get(`/api/v1/stations/${stationCode}/live`)
    return { status: true, data: res }
  } catch (err) {
    console.error('RailRadar getLiveStation failed:', err)
    throw err
  }
}
