const BASE_URL = 'https://irctc1.p.rapidapi.com';
const HEADERS = {
  'x-rapidapi-key': '10e73efc9cmsh7c1fd2c49c363a5p1f1c13jsncfa8684f9afc',
  'x-rapidapi-host': 'irctc1.p.rapidapi.com',
  'Content-Type': 'application/json',
};

async function testApi() {
  const query = '12301';
  const url = `${BASE_URL}/api/v1/searchTrain?query=${query}`;
  
  try {
    const res = await fetch(url, { method: 'GET', headers: HEADERS });
    console.log('Status:', res.status);
    const json = await res.json();
    console.log('Response:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

testApi();
