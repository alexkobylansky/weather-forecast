import type React from 'react'
import './[locale]/globals.css'
import {GeistSans} from 'geist/font/sans';
import {GeistMono} from 'geist/font/mono';

export default function RootLayout({
                                     children,
                                     params
                                   }: {
  children: React.ReactNode,
  params: { locale: string }
}) {
  //TODO Fix this
  const locale = params.locale;

  return (
    <html lang={locale}>
    <head>
      <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      <title>{locale == 'en' ? 'Forecast Website' : 'Сайт погоди'}</title>
    </head>
    <body>
    {children}
    </body>
    </html>
  )
}

export const metadata = {
  generator: 'v0.app'
};