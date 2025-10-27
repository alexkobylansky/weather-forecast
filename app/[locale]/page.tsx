'use client'
import {useEffect, useState, useRef, RefObject} from 'react';
import {useTranslations, useLocale} from 'next-intl'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {LanguageSwitcher} from '@/components/language-switcher';
import {
  Clock,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudMoonRain,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  CloudSunRain,
  Cloudy,
  Droplet,
  Eye,
  Haze,
  Moon,
  Snowflake,
  Sun,
  Sunrise,
  Sunset,
  Wind
} from 'lucide-react';

import {getCurrentWeather, getForecastWeather, getOneCallAPI, getCity} from '@/services/weather-services';

import {dailyItem, hourlyItem, OneCall} from '@/types/one-call';
import {listItem, ForecastWeather} from '@/types/forecast-weather';
import {DaysTabComponent} from "@/components/days-tab-component";

const currentDate: Date = new Date();
const getDay = (time: number) => new Date(time);

const monthsUkr = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
const monthsEng = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const daysUkr = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const daysEng = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const timestampConversation = (t: number) => {
  const now = getDay(t * 1000);
  let hour: string | number = now.getHours();
  let minute: string | number = now.getMinutes();
  hour = (hour < 10) ? `0${hour}` : hour;
  minute = (minute < 10) ? `0${minute}` : minute;
  return `${hour}:${minute}`
};

const getDuration = (sunrise: number, sunset: number) => {
  const sunRise = getDay(sunrise * 1000).getTime();
  const sunSet = getDay(sunset * 1000).getTime();
  const different: number = sunSet - sunRise;
  let hours: string | number = Math.floor((different % 86400) / 3600)
  let minutes: string | number = Math.ceil(((different % 86400) % 3600) / 60);
  if (minutes === 60) minutes -= 1;
  hours = (hours < 10) ? `0${hours}` : hours;
  minutes = (minutes < 10) ? `0${minutes}` : minutes;
  return `${hours} ч ${minutes} мин`;
};

export default function WeatherForecast() {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather>({} as CurrentWeather);
  const [foreCastWeather, setForeCastWeather] = useState<ForecastWeather>({} as ForecastWeather);
  const [oneCallApi, setOneCallApi] = useState<OneCall>({} as OneCall);
  const [day1, setDay1] = useState<listItem[]>([]);
  const [day2, setDay2] = useState<listItem[]>([]);
  const [day3, setDay3] = useState<listItem[]>([]);
  const [day4, setDay4] = useState<listItem[]>([]);
  const [day5, setDay5] = useState<listItem[]>([]);

  const firstInitDays = useRef(false);

  const t = useTranslations();

  const currentLocale = useLocale();

  const windDeg = (deg: number) => {
    if ((deg >= 0 && deg <= 22.5) || (deg >= 337.6 && deg <= 360)) return t('wind.north');
    else if (deg >= 22.6 || deg <= 67.5) return t('wind.north-east');
    else if (deg >= 67.6 || deg <= 112.5) return t('wind.east');
    else if (deg >= 112.6 || deg <= 157.5) return t('wind.south-east');
    else if (deg >= 157.6 || deg <= 202.5) return t('wind.south');
    else if (deg >= 202.6 || deg <= 277.5) return t('wind.south-west');
    else if (deg >= 277.6 || deg <= 282.5) return t('wind.west');
    else if (deg >= 282.6 || deg <= 337.5) return t('wind.north-west');
  };

  function showIcon(id: number, dt: number, classes: string = '') {
    const sunrise = currentWeather.sys.sunrise;
    const sunset = currentWeather.sys.sunset;
    if (id >= 200 && id <= 232) {
      return <CloudLightning className={classes}/>
    } else if (id >= 300 && id <= 321) {
      return <CloudDrizzle className={classes}/>
    } else if (id == 500) {
      if (getDay(dt * 1000).getHours() > getDay(sunrise * 1000).getHours() && getDay(dt * 1000).getHours() <= getDay(sunset * 1000).getHours()) {
        return <CloudSunRain className={classes}/>
      } else {
        return <CloudMoonRain className={classes}/>
      }
    } else if (id == 501) {
      return <CloudDrizzle className={classes}/>
    } else if (id >= 502 && id <= 504) {
      return <CloudRain className={classes}/>
    } else if (id == 511) {
      return <Snowflake className={classes}/>
    } else if (id >= 520 && id <= 531) {
      return <CloudRainWind className={classes}/>
    } else if (id >= 600 && id <= 622) {
      return <CloudSnow className={classes}/>
    } else if (id >= 700 && id <= 731) {
      return <Haze className={classes}/>
    } else if (id >= 741 && id <= 781) {
      return <CloudFog className={classes}/>
    } else if (id === 800) {
      if (getDay(dt * 1000).getHours() > getDay(sunrise * 1000).getHours() && getDay(dt * 1000).getHours() <= getDay(sunset * 1000).getHours()) {
        return <Sun className={classes}/>
      } else {
        return <Moon className={classes}/>
      }
    } else if (id == 801) {
      if (getDay(dt * 1000).getHours() > getDay(sunrise * 1000).getHours() && getDay(dt * 1000).getHours() <= getDay(sunset * 1000).getHours()) {
        return <CloudSun className={classes}/>
      } else {
        return <CloudMoon className={classes}/>
      }
    } else if (id == 802) {
      return <Cloud className={classes}/>
    } else if (id == 803 || id == 804) {
      return <Cloudy className={classes}/>
    }
  }

  function showMainIcon(id: number, classes: string = '') {
    if (id >= 200 && id <= 232) {
      return <CloudLightning className={classes}/>
    } else if (id >= 300 && id <= 321) {
      return <CloudDrizzle className={classes}/>
    } else if (id == 500) {
      return <CloudSunRain className={classes}/>
    } else if (id == 501) {
      return <CloudDrizzle className={classes}/>
    } else if (id >= 502 && id <= 504) {
      return <CloudRain className={classes}/>
    } else if (id == 511) {
      return <Snowflake className={classes}/>
    } else if (id >= 520 && id <= 531) {
      return <CloudRainWind className={classes}/>
    } else if (id >= 600 && id <= 622) {
      return <CloudSnow className={classes}/>
    } else if (id >= 700 && id <= 731) {
      return <Haze className={classes}/>
    } else if (id >= 741 && id <= 781) {
      return <CloudFog className={classes}/>
    } else if (id === 800) {
      return <Sun className={classes}/>
    } else if (id == 801) {
      return <CloudSun className={classes}/>
    } else if (id == 802) {
      return <Cloud className={classes}/>
    } else if (id == 803 || id == 804) {
      return <Cloudy className={classes}/>
    }
  }

  const getPosition = async (lat: number, lon: number, currentLocale: string) => {
    const currentWeather: CurrentWeather = await getCurrentWeather(lat, lon, currentLocale);
    const forecastWeather: ForecastWeather = await getForecastWeather(lat, lon, currentLocale);
    const oneCallWeather: OneCall = await getOneCallAPI(lat, lon, currentLocale)
    setCurrentWeather(currentWeather);
    setForeCastWeather(forecastWeather);
    setOneCallApi(oneCallWeather);
  };

  const getLocation = () => {
    let lat = 50.4497115;
    let lon = 30.5235707;
    navigator.geolocation.getCurrentPosition(function (geoPosition) {
        let lat = geoPosition ? geoPosition.coords.latitude : 50.4497115;
        let lon = geoPosition ? geoPosition.coords.longitude : 30.5235707;
        void getPosition(lat, lon, currentLocale);
      },
      function (error) {
        console.log(error);
        void getPosition(lat, lon, currentLocale);
      }
    );
  };

  const loadScript = () => {
    if (!window?.google) {
      const googlePlaces = process.env.NEXT_PUBLIC_GOOGLE_PLACES!;
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googlePlaces}&v=beta`;
      document.body.appendChild(script);
      script.onload = () => {
        if (window.google?.maps?.importLibrary) {
          void initAutocomplete()
        }
      }
      script.onerror = () => {
        console.warn('Could not load script!');
      }
    }
  };

  const searchRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
  const calledOnceRef: RefObject<boolean> = useRef(false);

  async function initAutocomplete() {
    if (!searchRef.current) {
      console.warn('searchRef.current is null');
      return;
    }

    if (window?.google?.maps) {
      const {PlaceAutocompleteElement} = await window.google.maps.importLibrary('places');

      const placeAutocomplete = new PlaceAutocompleteElement();
      placeAutocomplete.id = 'place-autocomplete-input';
      placeAutocomplete.style.colorScheme = 'none';
      const gmpPlaceAutocomplete = document.getElementById('place-autocomplete-input');

      if (!gmpPlaceAutocomplete) {
        searchRef.current.appendChild(placeAutocomplete);
      }

      placeAutocomplete.addEventListener('gmp-select', async ({placePrediction}: {placePrediction: any}) => {
        const place = placePrediction.toPlace();
        await place.fetchFields({fields: ['location']});

        const lat = place.location.lat();
        const lon = place.location.lng();
        const {currentWeather, forecastWeather, oneCallWeather} = await getCity(lat, lon, currentLocale);
        setCurrentWeather(currentWeather);
        setForeCastWeather(forecastWeather);
        setOneCallApi(oneCallWeather);
      });
    }
  }

  const todayAt23 = currentDate.setHours(23, 0, 0);
  const tomorrowAt6 = todayAt23 + 25200000;
  const timestampSeconds = Math.trunc(tomorrowAt6 / 1000);

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (currentWeather.cod && foreCastWeather.cod && oneCallApi.timezone) {
     if (!calledOnceRef.current) {
       calledOnceRef.current = true;
       loadScript();
     }
      void initAutocomplete();
    }
  }, [currentWeather.cod, foreCastWeather.cod, oneCallApi.timezone]);

  const currentHourlyForecast: hourlyItem[] = [];

  if (oneCallApi.hourly) {
    for (let i = 0; i < oneCallApi?.hourly.length; i++) {
      currentHourlyForecast.push(oneCallApi.hourly[i]);
      if (oneCallApi.hourly[i].dt === timestampSeconds) break;
    }
  }

  const trunc = (t: number) => Math.trunc(t / 1000);
  const endToday = currentDate.setHours(23, 0, 0);
  const MS_IN_DAY = 86400000; // 24 часа
  const MS_IN_3_HOURS = 10800000; // 3 часа

  const startDay1 = trunc(endToday + MS_IN_3_HOURS);
  const endDay1 = trunc(endToday + MS_IN_DAY);
  const startDay2 = trunc((endDay1 * 1000) + MS_IN_3_HOURS);
  const endDay2 = trunc((endDay1 * 1000) + MS_IN_DAY);
  const startDay3 = trunc((endDay2 * 1000) + MS_IN_3_HOURS);
  const endDay3 = trunc((endDay2 * 1000) + MS_IN_DAY);
  const startDay4 = trunc((endDay3 * 1000) + MS_IN_3_HOURS);
  const endDay4 = trunc((endDay3 * 1000) + MS_IN_DAY);
  const startDay5 = trunc((endDay4 * 1000) + MS_IN_3_HOURS);
  const endDay5 = trunc((endDay4 * 1000) + MS_IN_DAY);

  const day1 = [];
  const day2 = [];
  const day3 = [];
  const day4 = [];
  const day5 = [];

  if (foreCastWeather.list) {
    for (let i = 0; i < foreCastWeather.list.length; i++) {
      if (foreCastWeather.list[i].dt >= startDay1 && foreCastWeather.list[i].dt <= endDay1) {
        day1.push(foreCastWeather.list[i]);
      } else if (foreCastWeather.list[i].dt >= startDay2 && foreCastWeather.list[i].dt <= endDay2) {
        day2.push(foreCastWeather.list[i]);
      } else if (foreCastWeather.list[i].dt >= startDay3 && foreCastWeather.list[i].dt <= endDay3) {
        day3.push(foreCastWeather.list[i]);
      } else if (foreCastWeather.list[i].dt >= startDay4 && foreCastWeather.list[i].dt <= endDay4) {
        day4.push(foreCastWeather.list[i]);
      } else if (foreCastWeather.list[i].dt >= startDay5 && foreCastWeather.list[i].dt <= endDay5) {
        day5.push(foreCastWeather.list[i]);
      }
    }
  }

  if (!currentWeather.cod && !foreCastWeather.cod && !oneCallApi.timezone) {
    return <div><p>Loading...</p></div>
  } else {
    return (
      <div className='min-h-screen bg-background'>
        {/* Header */}
        <header className='sticky top-0 z-50 bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-primary/60 border-b border-primary/20'>
          <div className='container mx-auto px-4 py-4'>
            <div className='flex items-center justify-between md:flex-row flex-col'>
              <div className='flex items-center space-x-2 md:mb-0 mb-4'>
                <Cloud className='h-8 w-8 text-primary-foreground'/>
                <h1 className='text-2xl font-serif font-black text-primary-foreground'>WeatherCast</h1>
              </div>
              <div className='flex-1 max-w-md mx-8'>
                <div className='relative' id='search' ref={searchRef}>
                </div>
              </div>
              <div className='flex items-center space-x-2 md:mt-0 mt-4'>
                <LanguageSwitcher/>
              </div>
            </div>
          </div>
        </header>
        <main className='container mx-auto px-4 py-8'>
          <Tabs defaultValue='current' className='w-full'>
            <TabsList className='grid w-full grid-cols-2 mb-8'>
              <TabsTrigger className='cursor-pointer h-[70px]' value='current'>{t('headers.currentWeather')}</TabsTrigger>
              <TabsTrigger className='cursor-pointer h-[70px]' value='forecast'>{t('headers.5-DayForecast')}</TabsTrigger>
            </TabsList>
            <TabsContent value='current'>
              {/* Current Weather Section */}
              <section className='mb-12'>
                <Card className='bg-card border-border shadow-lg'>
                  <CardHeader className='text-center pb-4'>
                    <table className='current-weather-table'>
                      <tbody>
                      <tr>
                        <td>
                          {showIcon(currentWeather?.weather[0].id, currentWeather.dt,'h-16 w-16 text-accent')}
                        </td>
                        <td>
                          <CardTitle className='text-6xl text-foreground'>{Math.round(currentWeather?.main.temp)}°C</CardTitle>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p className='text-xl text-muted-foreground'>{currentWeather?.weather[0].description}</p>
                        </td>
                        <td>
                          <p className='text-sm text-muted-foreground'>{t('weather.feelsLike')}</p>
                          <p className='font-semibold'>{Math.round(currentWeather?.main.feels_like)}°C</p>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>
                          <span className='text-[30px]'>{currentWeather?.name}</span>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-row justify-center flex-wrap w-full gap-4'>
                      <div className='flex items-center grow justify-center [@media(max-width:382px)]:justify-start space-x-2 p-3 rounded-lg bg-muted'>
                        <Sunrise className='h-5 w-5 text-primary'/>
                        <div>
                          <p className='text-sm text-muted-foreground'>{t('weather.sunrise')}</p>
                          <p className='font-semibold'>{timestampConversation(currentWeather?.sys.sunrise)}</p>
                        </div>
                      </div>
                      <div className='flex items-center grow justify-center [@media(max-width:382px)]:justify-start space-x-2 p-3 rounded-lg bg-muted'>
                        <Sunset className='h-5 w-5 text-primary'/>
                        <div>
                          <p className='text-sm text-muted-foreground'>{t('weather.sunset')}</p>
                          <p className='font-semibold'>{timestampConversation(currentWeather?.sys.sunset)}</p>
                        </div>
                      </div>
                      <div className='flex items-center grow justify-center [@media(max-width:382px)]:justify-start space-x-2 p-3 rounded-lg bg-muted'>
                        <Clock className='h-5 w-5 text-primary'/>
                        <div>
                          <p className='text-sm text-muted-foreground'>{t('weather.dayLength')}</p>
                          <p className='font-semibold'>{getDuration(currentWeather?.sys?.sunrise, currentWeather?.sys.sunset)}</p>
                        </div>
                      </div>
                      <div className='flex items-center grow justify-center [@media(max-width:382px)]:justify-start space-x-2 p-3 rounded-lg bg-muted'>
                        <Eye className='h-5 w-5 text-primary'/>
                        <div>
                          <p className='text-sm text-muted-foreground'>{t('weather.visibility')}</p>
                          <p className='font-semibold'>{`${currentWeather?.visibility / 1000} ${t('table.visibilityDistance')}`}</p>
                        </div>
                      </div>
                      <div className='flex items-center grow justify-center [@media(max-width:382px)]:justify-start space-x-2 p-3 rounded-lg bg-muted'>
                        <Wind className='h-5 w-5 text-primary'/>
                        <div className='current-weather-wind'>
                          <p className='text-sm text-muted-foreground'>{t('weather.wind')}</p>
                          <p className='font-semibold'>{`${Math.round(currentWeather?.wind.speed)} ${t('weather.windSpeed')}`}</p>
                          <p className='text-sm text-muted-foreground current-weather-wind-deg'>{windDeg(currentWeather?.wind.deg)}</p>
                        </div>
                      </div>
                      <div className='flex items-center grow justify-center [@media(max-width:382px)]:justify-start space-x-2 p-3 rounded-lg bg-muted'>
                        <Droplet className='h-5 w-5 text-primary'/>
                        <div>
                          <p className='text-sm text-muted-foreground'>{t('weather.humidity')}</p>
                          <p className='font-semibold'>{currentWeather?.main.humidity} %</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
              {/* Hourly Forecast Table */}
              <section>
                <h2 className='text-3xl font-serif font-bold text-foreground mb-6'>{t('headers.hourlyForecast')}</h2>
                <Card>
                  <CardContent className='p-0'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('table.time')}</TableHead>
                          <TableHead>{t('table.weather')}</TableHead>
                          <TableHead>{t('table.temperature')} (&deg;C)</TableHead>
                          <TableHead>{t('table.feelsLike')}(&deg;C)</TableHead>
                          <TableHead>{`${t('table.wind')} (${t('table.windSpeed')})`}</TableHead>
                          <TableHead>{t('table.windDirection')}</TableHead>
                          <TableHead>{t('table.windGust')}</TableHead>
                          <TableHead>{t('table.dewPoint')} (&deg;C)</TableHead>
                          <TableHead>{t('table.humidity')}</TableHead>
                          <TableHead>{t('table.pressure')} (mmHg)</TableHead>
                          <TableHead>{`${t('table.visibility')} (${t('table.visibilityDistance')})`}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentHourlyForecast.map((item: hourlyItem, index) => (
                          <TableRow key={index}>
                            <TableCell className='font-medium'>{timestampConversation(item.dt)}</TableCell>
                            <TableCell>
                              <div className='flex items-center space-x-2'>
                                {showIcon(item.weather[0].id, item.dt,'h-5 w-5 text-primary')}
                                <span>{item.weather[0].description}</span>
                              </div>
                            </TableCell>
                            <TableCell className='font-semibold'>{Math.round(item.temp)}&deg;</TableCell>
                            <TableCell>{Math.round(item.feels_like)}&deg;</TableCell>
                            <TableCell>{Math.round(item.wind_speed)}</TableCell>
                            <TableCell>{windDeg(item.wind_deg)}</TableCell>
                            <TableCell>{item.wind_gust}</TableCell>
                            <TableCell>{item.dew_point}&deg;</TableCell>
                            <TableCell>{item.humidity}%</TableCell>
                            <TableCell>{Math.floor((item.pressure * 0.75006156) * 100) / 100}</TableCell>
                            <TableCell>{item.visibility / 1000}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </section>
            </TabsContent>
            <TabsContent value='forecast'>
              <section>
                <h2 className='text-3xl font-serif font-bold text-foreground mb-6'>{t('headers.5-DayForecast')}</h2>
                <Tabs defaultValue='day1' className='w-full'>
                  <TabsList className='flex flex-row  overflow-x-auto py-3 px-1'>
                    {oneCallApi.daily.map((day: dailyItem, index) => {
                      if (day.dt >= startDay1 && day.dt <= endDay5) {
                        const currentMonth = getDay(day.dt * 1000).getMonth();
                        const currentDate = getDay(day.dt * 1000).getDate();

                        const localMonth = currentLocale === 'uk' ? monthsUkr[currentMonth] : monthsEng[currentMonth];
                        const localDay = currentLocale === 'uk' ? daysUkr[getDay(day.dt * 1000).getDay()] : daysEng[getDay(day.dt * 1000).getDay()];

                        return (
                          <TabsTrigger key={index} value={`day${index}`} className='cursor-pointer min-w-[200px] py-3'>
                            <div className='forecast-day-block'>
                              <h3>{localDay}</h3>
                              <span className='forecast-day-date'>{localMonth} {currentDate}</span>
                              <div className='forecast-day-icon h-16 flex justify-center items-center w-full pt-3'>
                                {showMainIcon(day.weather[0].id, 'text-accent')}
                              </div>
                              <span className='forecast-day-temperature text-2xl pt-2.5 block'>{Math.floor(day.temp.max)}&deg;C</span>
                              <span className='forecast-day-description'>{day.weather[0].description}</span>
                            </div>
                          </TabsTrigger>
                        )
                      }
                    })}
                  </TabsList>
                  <TabsContent value='day1' className='mt-6'>
                    <Card>
                      <CardContent className='p-0'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('table.time')}</TableHead>
                              <TableHead>{t('table.weather')}</TableHead>
                              <TableHead>{t('table.temperature')} (&deg;C)</TableHead>
                              <TableHead>{t('table.feelsLike')}(&deg;C)</TableHead>
                              <TableHead>{`${t('table.wind')} (${t('table.windSpeed')})`}</TableHead>
                              <TableHead>{t('table.windDirection')}</TableHead>
                              <TableHead>{t('table.windGust')}</TableHead>
                              <TableHead>{t('table.humidity')}</TableHead>
                              <TableHead>{t('table.pressure')} (mmHg)</TableHead>
                              <TableHead>{`${t('table.visibility')} (${t('table.visibilityDistance')})`}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {day1.map((day: listItem, index) => (
                              <TableRow key={index}>
                                <TableCell className='font-medium'>{timestampConversation(day.dt)}</TableCell>
                                <TableCell>
                                  <div className='flex items-center space-x-2'>
                                    {showIcon(day.weather[0].id, day.dt,'h-5 w-5 text-primary')}
                                    <span>{day.weather[0].description}</span>
                                  </div>
                                </TableCell>
                                <TableCell className='font-semibold'>{Math.round(day.main.temp)}&deg;</TableCell>
                                <TableCell>{Math.round(day.main.feels_like)}&deg;</TableCell>
                                <TableCell>{Math.round(day.wind.speed)}</TableCell>
                                <TableCell>{windDeg(day.wind.deg)}</TableCell>
                                <TableCell>{day.wind.gust}</TableCell>
                                <TableCell>{day.main.humidity}%</TableCell>
                                <TableCell>{Math.floor((day.main.pressure * 0.75006156) * 100) / 100}</TableCell>
                                <TableCell>{day.visibility / 1000}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value='day2' className='mt-6'>
                    <Card>
                      <CardContent className='p-0'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('table.time')}</TableHead>
                              <TableHead>{t('table.weather')}</TableHead>
                              <TableHead>{t('table.temperature')} (&deg;C)</TableHead>
                              <TableHead>{t('table.feelsLike')}(&deg;C)</TableHead>
                              <TableHead>{`${t('table.wind')} (${t('table.windSpeed')})`}</TableHead>
                              <TableHead>{t('table.windDirection')}</TableHead>
                              <TableHead>{t('table.windGust')}</TableHead>
                              <TableHead>{t('table.humidity')}</TableHead>
                              <TableHead>{t('table.pressure')} (mmHg)</TableHead>
                              <TableHead>{`${t('table.visibility')} (${t('table.visibilityDistance')})`}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {day2.map((day: listItem, index) => (
                              <TableRow key={index}>
                                <TableCell className='font-medium'>{timestampConversation(day.dt)}</TableCell>
                                <TableCell>
                                  <div className='flex items-center space-x-2'>
                                    {showIcon(day.weather[0].id, day.dt,'h-5 w-5 text-primary')}
                                    <span>{day.weather[0].description}</span>
                                  </div>
                                </TableCell>
                                <TableCell className='font-semibold'>{Math.round(day.main.temp)}&deg;</TableCell>
                                <TableCell>{Math.round(day.main.feels_like)}&deg;</TableCell>
                                <TableCell>{Math.round(day.wind.speed)}</TableCell>
                                <TableCell>{windDeg(day.wind.deg)}</TableCell>
                                <TableCell>{day.wind.gust}</TableCell>
                                <TableCell>{day.main.humidity}%</TableCell>
                                <TableCell>{Math.floor((day.main.pressure * 0.75006156) * 100) / 100}</TableCell>
                                <TableCell>{day.visibility / 1000}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value='day3' className='mt-6'>
                    <Card>
                      <CardContent className='p-0'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('table.time')}</TableHead>
                              <TableHead>{t('table.weather')}</TableHead>
                              <TableHead>{t('table.temperature')} (&deg;C)</TableHead>
                              <TableHead>{t('table.feelsLike')}(&deg;C)</TableHead>
                              <TableHead>{`${t('table.wind')} (${t('table.windSpeed')})`}</TableHead>
                              <TableHead>{t('table.windDirection')}</TableHead>
                              <TableHead>{t('table.windGust')}</TableHead>
                              <TableHead>{t('table.humidity')}</TableHead>
                              <TableHead>{t('table.pressure')} (mmHg)</TableHead>
                              <TableHead>{`${t('table.visibility')} (${t('table.visibilityDistance')})`}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {day3.map((day: listItem, index) => (
                              <TableRow key={index}>
                                <TableCell className='font-medium'>{timestampConversation(day.dt)}</TableCell>
                                <TableCell>
                                  <div className='flex items-center space-x-2'>
                                    {showIcon(day.weather[0].id, day.dt,'h-5 w-5 text-primary')}
                                    <span>{day.weather[0].description}</span>
                                  </div>
                                </TableCell>
                                <TableCell className='font-semibold'>{Math.round(day.main.temp)}&deg;</TableCell>
                                <TableCell>{Math.round(day.main.feels_like)}&deg;</TableCell>
                                <TableCell>{Math.round(day.wind.speed)}</TableCell>
                                <TableCell>{windDeg(day.wind.deg)}</TableCell>
                                <TableCell>{day.wind.gust}</TableCell>
                                <TableCell>{day.main.humidity}%</TableCell>
                                <TableCell>{Math.floor((day.main.pressure * 0.75006156) * 100) / 100}</TableCell>
                                <TableCell>{day.visibility / 1000}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value='day4' className='mt-6'>
                    <Card>
                      <CardContent className='p-0'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('table.time')}</TableHead>
                              <TableHead>{t('table.weather')}</TableHead>
                              <TableHead>{t('table.temperature')} (&deg;C)</TableHead>
                              <TableHead>{t('table.feelsLike')}(&deg;C)</TableHead>
                              <TableHead>{`${t('table.wind')} (${t('table.windSpeed')})`}</TableHead>
                              <TableHead>{t('table.windDirection')}</TableHead>
                              <TableHead>{t('table.windGust')}</TableHead>
                              <TableHead>{t('table.humidity')}</TableHead>
                              <TableHead>{t('table.pressure')} (mmHg)</TableHead>
                              <TableHead>{`${t('table.visibility')} (${t('table.visibilityDistance')})`}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {day4.map((day, index) => (
                              <TableRow key={index}>
                                <TableCell className='font-medium'>{timestampConversation(day.dt)}</TableCell>
                                <TableCell>
                                  <div className='flex items-center space-x-2'>
                                    {showIcon(day.weather[0].id, day.dt,'h-5 w-5 text-primary')}
                                    <span>{day.weather[0].description}</span>
                                  </div>
                                </TableCell>
                                <TableCell className='font-semibold'>{Math.round(day.main.temp)}&deg;</TableCell>
                                <TableCell>{Math.round(day.main.feels_like)}&deg;</TableCell>
                                <TableCell>{Math.round(day.wind.speed)}</TableCell>
                                <TableCell>{windDeg(day.wind.deg)}</TableCell>
                                <TableCell>{day.wind.gust}</TableCell>
                                <TableCell>{day.main.humidity}%</TableCell>
                                <TableCell>{Math.floor((day.main.pressure * 0.75006156) * 100) / 100}</TableCell>
                                <TableCell>{day.visibility / 1000}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value='day5' className='mt-6'>
                    <Card>
                      <CardContent className='p-0'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('table.time')}</TableHead>
                              <TableHead>{t('table.weather')}</TableHead>
                              <TableHead>{t('table.temperature')} (&deg;C)</TableHead>
                              <TableHead>{t('table.feelsLike')}(&deg;C)</TableHead>
                              <TableHead>{`${t('table.wind')} (${t('table.windSpeed')})`}</TableHead>
                              <TableHead>{t('table.windDirection')}</TableHead>
                              <TableHead>{t('table.windGust')}</TableHead>
                              <TableHead>{t('table.humidity')}</TableHead>
                              <TableHead>{t('table.pressure')} (mmHg)</TableHead>
                              <TableHead>{`${t('table.visibility')} (${t('table.visibilityDistance')})`}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {day5.map((day: listItem, index) => (
                              <TableRow key={index}>
                                <TableCell className='font-medium'>{timestampConversation(day.dt)}</TableCell>
                                <TableCell>
                                  <div className='flex items-center space-x-2'>
                                    {showIcon(day.weather[0].id, day.dt,'h-5 w-5 text-primary')}
                                    <span>{day.weather[0].description}</span>
                                  </div>
                                </TableCell>
                                <TableCell className='font-semibold'>{Math.round(day.main.temp)}&deg;</TableCell>
                                <TableCell>{Math.round(day.main.feels_like)}&deg;</TableCell>
                                <TableCell>{Math.round(day.wind.speed)}</TableCell>
                                <TableCell>{windDeg(day.wind.deg)}</TableCell>
                                <TableCell>{day.wind.gust}</TableCell>
                                <TableCell>{day.main.humidity}%</TableCell>
                                <TableCell>{Math.floor((day.main.pressure * 0.75006156) * 100) / 100}</TableCell>
                                <TableCell>{day.visibility / 1000}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </section>
            </TabsContent>
          </Tabs>
        </main>
        {/* Footer */}
        <footer className='bg-muted mt-16 py-8'>
          <div className='container mx-auto px-4 text-center'>
            <p className='text-muted-foreground'>© 2025 WeatherCast. Powered by OpenWeather data</p>
          </div>
        </footer>
      </div>
    )
  }
}