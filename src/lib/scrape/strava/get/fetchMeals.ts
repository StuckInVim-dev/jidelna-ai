import axios from 'axios';

interface RequestData {
  cislo: string;
  sid: string;
  s5url: string;
}

async function fetchMeals(CANTEEN_NUMBER: string, USERNAME: string, SID: string) {

  const URL = "https://app.strava.cz/api/objednavky";

  const data: RequestData = {
    cislo: CANTEEN_NUMBER,
    sid: SID,
    s5url: "https://wss5.strava.cz/WSStravne5_5/WSStravne5.svc",
  };

  const cookies = {
    cislo: CANTEEN_NUMBER,
    jmeno: USERNAME,
  };

  try {
    const response = await axios.post(URL, data, {
      headers: {
        'Cookie': Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ')
      }
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
}

export default fetchMeals;