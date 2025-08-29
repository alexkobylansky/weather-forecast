"use client"
import {useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {LanguageSwitcher} from "@/components/language-switcher";
import {Cloud, Cloudy, Sun, CloudRain, CloudDrizzle, CloudFog, CloudHail, CloudLightning, CloudMoon, CloudMoonRain, CloudRainWind, CloudSnow, CloudSun, CloudSunRain, Wind, Eye, Thermometer, Sunrise, Sunset, Clock, Moon, Droplet} from "lucide-react";

import {initMap, getCurrentWeather, getForecastWeather, getOneCallAPI} from "@/services/weather-services";

import {dailyItem, hourlyItem, OneCall} from "@/types/one-call";
import {listItem, ForecastWeather} from "@/types/forecast-weather";

const currentDate: Date = new Date();
let getDay = (time: number) => new Date(time);

const monthsUkr = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
const monthsEng = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const daysUkr = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const dayEng = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const timestampConversation = (t: number) => {
  const now = getDay(t * 1000);
  let hour: string | number = now.getHours();
  let minute: string | number = now.getMinutes();
  hour = (hour < 10) ? `0${hour}` : hour;
  minute = (minute < 10) ? `0${minute}` : minute;
  return `${hour}:${minute}`
};

const windDeg = (deg: number) => {
  if (deg >= 0 || deg <= 22.5 && deg >= 337.5 || deg <= 360) return 'північний'
  else if (deg >= 22.6 || deg <= 67.5) return 'північно-східний'
  else if (deg >= 67.6 || deg <= 112.5) return 'східний'
  else if (deg >= 112.6 || deg <= 157.5) return 'південно-східний'
  else if (deg >= 157.6 || deg <= 202.5) return 'південний'
  else if (deg >= 202.6 || deg <= 277.5) return 'південно-західний'
  else if (deg >= 277.6 || deg <= 282.5) return 'західний'
};

const getDuration = (sunrise: number, sunset: number) => {
  const sunRise = getDay(sunrise).getTime();
  const sunSet = getDay(sunset).getTime();
  const different: number = sunSet - sunRise;
  let hours: string | number = Math.floor((different % 86400) / 3600)
  let minutes: string | number = Math.ceil(((different % 86400) % 3600) / 60);
  if (minutes === 60) minutes -= 1;
  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  return `${hours} ч ${minutes} мин`;
};

export default function WeatherForecast() {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather>({} as CurrentWeather);
  const [foreCastWeather, setForeCastWeather] = useState<ForecastWeather>({} as ForecastWeather);
  const [oneCallApi, setOneCallApi] = useState<OneCall>({} as OneCall);

  const getPosition = async (lat: number, lon: number) => {
    const currentWeather = await getCurrentWeather(lat, lon);
    const forecastWeather = await getForecastWeather(lat, lon);
    const oneCallWeather = await getOneCallAPI(lat, lon)
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
        void getPosition(lat, lon);
      },
      function (error) {
        console.log(error);
        void getPosition(lat, lon);
      }
    );
  };

  const todayAt23 = currentDate.setHours(23, 0, 0);
  const tomorrowAt6 = todayAt23 + 25200000;
  const timestampSeconds = Math.trunc(tomorrowAt6 / 1000);

  useEffect(() => {
    getLocation();
  }, []);

  if (!currentWeather.cod && !foreCastWeather.cod && !oneCallApi.timezone) {
    return <div><p>Loading...</p></div>
  } else {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-primary/60 border-b border-primary/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cloud className="h-8 w-8 text-primary-foreground" />
                <h1 className="text-2xl font-serif font-black text-primary-foreground">WeatherCast</h1>
              </div>
              <div className="flex-1 max-w-md mx-8">
                <div className="relative">
                  <Input
                    placeholder="Search for a city..."
                    className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/70"
                  />
                  <Button size="sm" className="absolute right-1 top-1 bg-accent hover:bg-accent/90">
                    Search
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <LanguageSwitcher />
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="current">Current Weather & Hourly</TabsTrigger>
              <TabsTrigger value="forecast">5-Day Forecast</TabsTrigger>
            </TabsList>
            <TabsContent value="current">
              {/* Current Weather Section */}
              <section className="mb-12">
                <Card className="bg-card border-border shadow-lg">
                  <CardHeader className="text-center pb-4">
                    <table className="current-weather-table">
                      <tbody>
                      <tr>
                        <td>
                          <img src={`https://openweathermap.org/img/wn/${currentWeather?.weather[0].icon}@2x.png`} alt='icon'/>
                        </td>
                        <td>
                          <CardTitle className="text-6xl font-serif font-black text-foreground mb-2">{Math.round(currentWeather?.main.temp)}°C</CardTitle>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p className="text-xl text-muted-foreground">{currentWeather?.weather[0].description}</p>
                        </td>
                        <td>
                          <p className="text-sm text-muted-foreground">Feels like</p>
                          <p className="font-semibold">{Math.round(currentWeather?.main.feels_like)}°C</p>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>
                          <span>{currentWeather?.name}</span>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-row justify-center flex-wrap w-full gap-4">
                      <div className="flex items-center grow justify-center  space-x-2 p-3 rounded-lg bg-muted">
                        <Sunrise className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Sunrise</p>
                          <p className="font-semibold">{timestampConversation(currentWeather?.sys.sunrise)}</p>
                        </div>
                      </div>
                      <div className="flex items-center grow justify-center  space-x-2 p-3 rounded-lg bg-muted">
                        <Sunset className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Sunset</p>
                          <p className="font-semibold">{timestampConversation(currentWeather?.sys.sunset)}</p>
                        </div>
                      </div>
                      <div className="flex items-center grow justify-center  space-x-2 p-3 rounded-lg bg-muted">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Day length</p>
                          <p className="font-semibold">{getDuration(currentWeather?.sys?.sunrise, currentWeather?.sys.sunset)}</p>
                        </div>
                      </div>
                      <div className="flex items-center grow justify-center  space-x-2 p-3 rounded-lg bg-muted">
                        <Eye className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Visibility</p>
                          <p className="font-semibold">{(currentWeather?.visibility / 1000)} km</p>
                        </div>
                      </div>
                      <div className="flex items-center grow justify-center  space-x-2 p-3 rounded-lg bg-muted">
                        <Wind className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Wind</p>
                          <p className="font-semibold">{currentWeather?.wind.speed} м/с</p>
                          <p className="text-sm text-muted-foreground">{windDeg(currentWeather?.wind.deg)}</p>
                        </div>
                      </div>
                      <div className="flex items-center grow justify-center  space-x-2 p-3 rounded-lg bg-muted">
                        <Droplet className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Humidity</p>
                          <p className="font-semibold">{currentWeather?.main.humidity} %</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
              {/* Hourly Forecast Table */}
              <section>
                <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Hourly Forecast</h2>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          {/*icon + description*/}
                          <TableHead>Weather</TableHead>
                          <TableHead>Temperature (&deg;C)</TableHead>
                          <TableHead>Feels Like (&deg;C)</TableHead>
                          <TableHead>Wind (m/s)</TableHead>
                          <TableHead>Wind direction</TableHead>
                          <TableHead>Wind gust</TableHead>
                          <TableHead>Dew point (&deg;C)</TableHead>
                          <TableHead>Humidity</TableHead>
                          <TableHead>Pressure (mmHg)</TableHead>
                          <TableHead>Visibility (km)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {oneCallApi?.hourly.map((item, index) => {
                          if (item.dt > timestampSeconds) {
                            return
                          }
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{timestampConversation(item.dt)}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {/*<hour.icon className="h-5 w-5 text-primary" />*/}
                                  <img src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`} className="h-5 w-5" alt='icon'/>
                                  <span>{item.weather[0].description}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-semibold">{Math.round(item.temp)}&deg;</TableCell>
                              <TableCell>{Math.round(item.feels_like)}&deg;</TableCell>
                              <TableCell>{Math.round(item.wind_speed)}</TableCell>
                              <TableCell>{windDeg(item.wind_deg)}</TableCell>
                              <TableCell>{item.wind_gust}</TableCell>
                              <TableCell>{item.dew_point}&deg;</TableCell>
                              <TableCell>{item.humidity}%</TableCell>
                              <TableCell>{Math.floor((item.pressure * 0.75006156) * 100) / 100}</TableCell>
                              <TableCell>{item.visibility / 1000}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </section>
            </TabsContent>
            <TabsContent value="forecast">
              <section>
                <h2 className="text-3xl font-serif font-bold text-foreground mb-6">5-Day Forecast</h2>
                <Tabs defaultValue="day1" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="day1">Today</TabsTrigger>
                    <TabsTrigger value="day2">Tomorrow</TabsTrigger>
                    <TabsTrigger value="day3">Wednesday</TabsTrigger>
                    <TabsTrigger value="day4">Thursday</TabsTrigger>
                    <TabsTrigger value="day5">Friday</TabsTrigger>
                  </TabsList>
                  <TabsContent value="day1" className="mt-6">
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Time</TableHead>
                              <TableHead>Weather</TableHead>
                              <TableHead>Temperature</TableHead>
                              <TableHead>Wind</TableHead>
                              <TableHead>Humidity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[
                              {
                                time: "12:00 PM",
                                icon: Sun,
                                temp: "24°C",
                                wind: "12 km/h",
                                humidity: "65%",
                                desc: "Sunny",
                              },
                              {
                                time: "3:00 PM",
                                icon: Cloud,
                                temp: "25°C",
                                wind: "18 km/h",
                                humidity: "63%",
                                desc: "Partly Cloudy",
                              },
                              {
                                time: "6:00 PM",
                                icon: Cloud,
                                temp: "21°C",
                                wind: "18 km/h",
                                humidity: "78%",
                                desc: "Cloudy",
                              },
                              {
                                time: "9:00 PM",
                                icon: Cloud,
                                temp: "19°C",
                                wind: "15 km/h",
                                humidity: "82%",
                                desc: "Cloudy",
                              },
                            ].map((period, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{period.time}</TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <period.icon className="h-5 w-5 text-primary" />
                                    <span>{period.desc}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold">{period.temp}</TableCell>
                                <TableCell>{period.wind}</TableCell>
                                <TableCell>{period.humidity}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="day2" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tomorrow - March 16, 2024</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Time</TableHead>
                              <TableHead>Weather</TableHead>
                              <TableHead>Temperature</TableHead>
                              <TableHead>Wind</TableHead>
                              <TableHead>Humidity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[
                              {
                                time: "12:00 PM",
                                icon: Cloud,
                                temp: "22°C",
                                wind: "15 km/h",
                                humidity: "70%",
                                desc: "Cloudy",
                              },
                              {
                                time: "3:00 PM",
                                icon: CloudRain,
                                temp: "20°C",
                                wind: "22 km/h",
                                humidity: "85%",
                                desc: "Light Rain",
                              },
                              {
                                time: "6:00 PM",
                                icon: CloudRain,
                                temp: "18°C",
                                wind: "25 km/h",
                                humidity: "90%",
                                desc: "Rain",
                              },
                              {
                                time: "9:00 PM",
                                icon: Cloud,
                                temp: "17°C",
                                wind: "20 km/h",
                                humidity: "88%",
                                desc: "Cloudy",
                              },
                            ].map((period, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{period.time}</TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <period.icon className="h-5 w-5 text-primary" />
                                    <span>{period.desc}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold">{period.temp}</TableCell>
                                <TableCell>{period.wind}</TableCell>
                                <TableCell>{period.humidity}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="day3" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Wednesday - March 17, 2024</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Time</TableHead>
                              <TableHead>Weather</TableHead>
                              <TableHead>Temperature</TableHead>
                              <TableHead>Wind</TableHead>
                              <TableHead>Humidity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[
                              {
                                time: "12:00 PM",
                                icon: CloudRain,
                                temp: "19°C",
                                wind: "18 km/h",
                                humidity: "88%",
                                desc: "Rain",
                              },
                              {
                                time: "3:00 PM",
                                icon: CloudRain,
                                temp: "18°C",
                                wind: "20 km/h",
                                humidity: "92%",
                                desc: "Heavy Rain",
                              },
                              {
                                time: "6:00 PM",
                                icon: CloudRain,
                                temp: "17°C",
                                wind: "22 km/h",
                                humidity: "95%",
                                desc: "Rain",
                              },
                              {
                                time: "9:00 PM",
                                icon: Cloud,
                                temp: "16°C",
                                wind: "18 km/h",
                                humidity: "90%",
                                desc: "Cloudy",
                              },
                            ].map((period, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{period.time}</TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <period.icon className="h-5 w-5 text-primary" />
                                    <span>{period.desc}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold">{period.temp}</TableCell>
                                <TableCell>{period.wind}</TableCell>
                                <TableCell>{period.humidity}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="day4" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Thursday - March 18, 2024</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Time</TableHead>
                              <TableHead>Weather</TableHead>
                              <TableHead>Temperature</TableHead>
                              <TableHead>Wind</TableHead>
                              <TableHead>Humidity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[
                              {
                                time: "12:00 PM",
                                icon: Sun,
                                temp: "26°C",
                                wind: "10 km/h",
                                humidity: "55%",
                                desc: "Sunny",
                              },
                              {
                                time: "3:00 PM",
                                icon: Sun,
                                temp: "28°C",
                                wind: "12 km/h",
                                humidity: "50%",
                                desc: "Sunny",
                              },
                              {
                                time: "6:00 PM",
                                icon: Cloud,
                                temp: "25°C",
                                wind: "14 km/h",
                                humidity: "60%",
                                desc: "Partly Cloudy",
                              },
                              {
                                time: "9:00 PM",
                                icon: Cloud,
                                temp: "22°C",
                                wind: "12 km/h",
                                humidity: "65%",
                                desc: "Cloudy",
                              },
                            ].map((period, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{period.time}</TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <period.icon className="h-5 w-5 text-primary" />
                                    <span>{period.desc}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold">{period.temp}</TableCell>
                                <TableCell>{period.wind}</TableCell>
                                <TableCell>{period.humidity}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="day5" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Friday - March 19, 2024</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Time</TableHead>
                              <TableHead>Weather</TableHead>
                              <TableHead>Temperature</TableHead>
                              <TableHead>Wind</TableHead>
                              <TableHead>Humidity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[
                              {
                                time: "12:00 PM",
                                icon: Cloud,
                                temp: "23°C",
                                wind: "16 km/h",
                                humidity: "68%",
                                desc: "Cloudy",
                              },
                              {
                                time: "3:00 PM",
                                icon: Sun,
                                temp: "25°C",
                                wind: "14 km/h",
                                humidity: "62%",
                                desc: "Partly Sunny",
                              },
                              {
                                time: "6:00 PM",
                                icon: Sun,
                                temp: "24°C",
                                wind: "12 km/h",
                                humidity: "58%",
                                desc: "Sunny",
                              },
                              {
                                time: "9:00 PM",
                                icon: Cloud,
                                temp: "21°C",
                                wind: "10 km/h",
                                humidity: "70%",
                                desc: "Partly Cloudy",
                              },
                            ].map((period, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{period.time}</TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <period.icon className="h-5 w-5 text-primary" />
                                    <span>{period.desc}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold">{period.temp}</TableCell>
                                <TableCell>{period.wind}</TableCell>
                                <TableCell>{period.humidity}</TableCell>
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
        <footer className="bg-muted mt-16 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">© 2024 WeatherCast. Powered by modern weather data.</p>
          </div>
        </footer>
      </div>
    )
  }
}