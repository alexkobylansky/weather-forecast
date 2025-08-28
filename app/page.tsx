"use client"
import {useEffect, useState} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Cloud, Cloudy, Sun, CloudRain, CloudDrizzle, CloudFog, CloudHail, CloudLightning, CloudMoon, CloudMoonRain, CloudRainWind, CloudSnow, CloudSun, CloudSunRain, Wind, Eye, Thermometer, Sunrise, Sunset, Clock, Moon, Droplet } from "lucide-react";

import {initMap, getCurrentWeather, getForecastWeather, getOneCallAPI} from "@/services/weather-services";

const currentDate: Date = new Date();
let getDay = (time: number) => new Date(time);

const monthsRus = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const monthsEng = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const dayRu = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
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
  if (deg >= 0 || deg <= 22.5 && deg >= 337.5 || deg <= 360) return 'северный'
  else if (deg >= 22.6 || deg <= 67.5) return 'северо-восточный'
  else if (deg >= 67.6 || deg <= 112.5) return 'восточный'
  else if (deg >= 112.6 || deg <= 157.5) return 'юго-восточный'
  else if (deg >= 157.6 || deg <= 202.5) return 'южный'
  else if (deg >= 202.6 || deg <= 277.5) return 'юго-западный'
  else if (deg >= 277.6 || deg <= 282.5) return 'западный'
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
    setCurrentWeather(await getCurrentWeather(lat, lon));
    setForeCastWeather(await  getForecastWeather(lat, lon))
    setOneCallApi(await getOneCallAPI(lat, lon));
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
                  <div className="flex items-center justify-center mb-2">
                    <Sun className="h-16 w-16 text-accent mr-4" />
                    <div>
                      <CardTitle className="text-6xl font-serif font-black text-foreground mb-2">24°C</CardTitle>
                      <p className="text-xl text-muted-foreground">Sunny</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                    <span>New York, NY</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted">
                      <Thermometer className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Feels like</p>
                        <p className="font-semibold">27°C</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted">
                      <Sunrise className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Sunrise</p>
                        <p className="font-semibold">6:24 AM</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted">
                      <Sunset className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Sunset</p>
                        <p className="font-semibold">7:42 PM</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Day length</p>
                        <p className="font-semibold">13h 18m</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted">
                      <Eye className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Visibility</p>
                        <p className="font-semibold">10 km</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted">
                      <Wind className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Wind</p>
                        <p className="font-semibold">12 km/h</p>
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
                        <TableHead>Weather</TableHead>
                        <TableHead>Temperature</TableHead>
                        <TableHead>Feels Like</TableHead>
                        <TableHead>Wind</TableHead>
                        <TableHead>Humidity</TableHead>
                        <TableHead>Visibility</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        {
                          time: "12:00 PM",
                          icon: Sun,
                          temp: "24°C",
                          feels: "27°C",
                          wind: "12 km/h",
                          humidity: "65%",
                          visibility: "10 km",
                          desc: "Sunny",
                        },
                        {
                          time: "1:00 PM",
                          icon: Sun,
                          temp: "25°C",
                          feels: "28°C",
                          wind: "14 km/h",
                          humidity: "62%",
                          visibility: "10 km",
                          desc: "Sunny",
                        },
                        {
                          time: "2:00 PM",
                          icon: Cloud,
                          temp: "26°C",
                          feels: "29°C",
                          wind: "16 km/h",
                          humidity: "60%",
                          visibility: "9 km",
                          desc: "Partly Cloudy",
                        },
                        {
                          time: "3:00 PM",
                          icon: Cloud,
                          temp: "25°C",
                          feels: "28°C",
                          wind: "18 km/h",
                          humidity: "63%",
                          visibility: "8 km",
                          desc: "Cloudy",
                        },
                        {
                          time: "4:00 PM",
                          icon: CloudRain,
                          temp: "23°C",
                          feels: "26°C",
                          wind: "20 km/h",
                          humidity: "75%",
                          visibility: "6 km",
                          desc: "Light Rain",
                        },
                        {
                          time: "5:00 PM",
                          icon: CloudRain,
                          temp: "22°C",
                          feels: "25°C",
                          wind: "22 km/h",
                          humidity: "80%",
                          visibility: "5 km",
                          desc: "Rain",
                        },
                        {
                          time: "6:00 PM",
                          icon: Cloud,
                          temp: "21°C",
                          feels: "24°C",
                          wind: "18 km/h",
                          humidity: "78%",
                          visibility: "7 km",
                          desc: "Cloudy",
                        },
                        {
                          time: "7:00 PM",
                          icon: Cloud,
                          temp: "20°C",
                          feels: "23°C",
                          wind: "15 km/h",
                          humidity: "76%",
                          visibility: "8 km",
                          desc: "Partly Cloudy",
                        },
                      ].map((hour, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{hour.time}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <hour.icon className="h-5 w-5 text-primary" />
                              <span>{hour.desc}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{hour.temp}</TableCell>
                          <TableCell>{hour.feels}</TableCell>
                          <TableCell>{hour.wind}</TableCell>
                          <TableCell>{hour.humidity}</TableCell>
                          <TableCell>{hour.visibility}</TableCell>
                        </TableRow>
                      ))}
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
                    <CardHeader>
                      <CardTitle>Today - March 15, 2024</CardTitle>
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
