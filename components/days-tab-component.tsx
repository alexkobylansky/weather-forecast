import React, {JSX} from "react";
import {useTranslations} from 'next-intl'
import {Card, CardContent} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {listItem} from "@/types/forecast-weather";
import {TabsContent} from "@/components/ui/tabs";

interface DaysTabComponentProps {
  dayCount: string;
  day: listItem[];
  timestampConversation: (t: number) => string;
  showIcon: (id: number, dt: number, classes: string) => JSX.Element | undefined;
  windDeg: (deg: number) => string | undefined;
}

export const DaysTabComponent = ({
                                   dayCount,
                                   day,
                                   timestampConversation,
                                   showIcon,
                                   windDeg}: DaysTabComponentProps) => {
  const t = useTranslations();

  return (
    <TabsContent value={dayCount} className='mt-6'>
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
              {day.map((day: listItem, index) => (
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
  )
};