declare global {
  interface Window {
    google?: any;
  }
}

const createParams = (lat: number, lon: number) => {
  return {
    lat: String(lat),
    lon: String(lon),
    units: 'metric',
    lang: 'ua',
    appid: '2e3f0a4de66d0bcd26974266f439e301'
  };
};

const baseURL = 'https://api.openweathermap.org/data';

async function initMap() {
  const {PlaceAutocompleteElement} = await window.google.maps.importLibrary('places');

  const placeAutocomplete = await new PlaceAutocompleteElement();
  placeAutocomplete.id = 'place-autocomplete-input';
  const wrap = document.getElementById('search');
  const gmpPlaceAutocomplete = document.getElementById('place-autocomplete-input');

  if (wrap) {
    wrap.appendChild(placeAutocomplete);
  }

  placeAutocomplete.addEventListener('gmp-select', async ({placePrediction}: {placePrediction:any}) => {
    const place = placePrediction.toPlace();
    await place.fetchFields({fields: ['location']});

    const lat = place.location.lat();
    const lon = place.location.lng();
    void getCity(lat, lon);
  });
}

async function getCity(lat: number, lon: number) {
  const params = new URLSearchParams(createParams(lat, lon));
  const url = `${baseURL}/2.5/weather?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // showError(response.status, response.statusText);
      throw new Error(`HTTP Error: ${response.status}, ${response.statusText}`);
    }

    const currentWeather = await response.json();
    const forecastWeather = await getForecastWeather(lat, lon);
    const oneCallWeather = await getOneCallAPI(lat, lon);
    return {currentWeather, forecastWeather, oneCallWeather};
  } catch (error: any) {
    console.error('Fetch error:', error.message);
    throw error;
  } finally {
    // hidePreloader();
  }
}

async function getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
  const params = new URLSearchParams(createParams(lat, lon));
  const url = `${baseURL}/2.5/weather?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // showError(response.status, response.statusText);
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

async function getForecastWeather(lat: number, lon: number) {
  const params = new URLSearchParams(createParams(lat, lon));
  const url = `${baseURL}/2.5/forecast?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // showError(response.status, response.statusText);
      throw new Error(`HTTP Error: ${response.status}, ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Fetch error:', error.message);
    throw error;
  }
}

async function getOneCallAPI(lat: number, lon: number) {
  const params = createParams(lat, lon);
  const paramsWithExclude = new URLSearchParams({
    ...params,
    exclude: 'current,minutely,alerts'
  });
  const url = `${baseURL}/3.0/onecall?${paramsWithExclude}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // showError(response.status, response.statusText);
      throw new Error(`HTTP Error: ${response.status}, ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Fetch error:', error.message);
    throw error;
  }
}

export {
  initMap,
  getCurrentWeather,
  getForecastWeather,
  getOneCallAPI
}