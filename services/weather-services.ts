declare global {
  interface Window {
    google?: any;
  }
}

const appid: string = process.env.REACT_APP_APPID!;

const createParams = (lat: number, lon: number, currentLocale: string) => {
  return {
    lat: String(lat),
    lon: String(lon),
    units: 'metric',
    lang: currentLocale,
    appid: appid
  };
};

const baseURL = 'https://api.openweathermap.org/data';

async function getCity(lat: number, lon: number, currentLocale: string) {
  const params = new URLSearchParams(createParams(lat, lon, currentLocale));
  const url = `${baseURL}/2.5/weather?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}, ${response.statusText}`);
    }

    const currentWeather = await response.json();
    const forecastWeather = await getForecastWeather(lat, lon, currentLocale);
    const oneCallWeather = await getOneCallAPI(lat, lon, currentLocale);
    return {currentWeather, forecastWeather, oneCallWeather};
  } catch (error: any) {
    console.error('Fetch error:', error.message);
    throw error;
  }
}

async function getCurrentWeather(lat: number, lon: number, currentLocale: string): Promise<CurrentWeather> {
  const params = new URLSearchParams(createParams(lat, lon, currentLocale));
  const url = `${baseURL}/2.5/weather?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}, ${response.statusText}`);
    }

    const currentWeather = await response.json();

    function createIcon(icon: string) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = `https://openweathermap.org/img/wn/${icon}.png`;
      document.head.append(link);
    }

    createIcon(currentWeather.weather[0].icon);

    const place = await getPlace(lat, lon);

    currentWeather.name = place;

    return currentWeather;
  } catch (error: any) {
    console.error('Fetch error:', error.message);
    throw error;
  }
}

async function getPlace(lat: number, lon: number) {
  const params = new URLSearchParams({
    latlng: `${lat},${lon}`,
    language: 'uk',
    key: 'AIzaSyBP6TTt_WvIbUp5gx0n5niy6wyC175FUhs'
  });
  const url = `https://maps.googleapis.com/maps/api/geocode/json?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}, ${response.statusText}`);
    }

    const place = await response.json();

    return place.results[0].address_components[2].long_name;
  } catch (error: any) {
    console.error('Fetch error:', error.message);
    throw error;
  }
}

async function getForecastWeather(lat: number, lon: number, currentLocale: string) {
  const params = new URLSearchParams(createParams(lat, lon, currentLocale));
  const url = `${baseURL}/2.5/forecast?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}, ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Fetch error:', error.message);
    throw error;
  }
}

async function getOneCallAPI(lat: number, lon: number, currentLocale: string) {
  const params = createParams(lat, lon, currentLocale);
  const paramsWithExclude = new URLSearchParams({
    ...params,
    lang: currentLocale,
    exclude: 'current,minutely,alerts'
  });
  const url = `${baseURL}/3.0/onecall?${paramsWithExclude}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}, ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Fetch error:', error.message);
    throw error;
  }
}

export {
  getCity,
  getCurrentWeather,
  getForecastWeather,
  getOneCallAPI
}