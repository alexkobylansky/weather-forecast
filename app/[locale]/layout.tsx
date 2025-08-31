import * as React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import ClientWrapper from '@/components/client-wrapper';
import { notFound } from 'next/navigation'
import { locales } from '@/i18n'

export const metadata: Metadata = {
  title: 'Weather Forecast Website',
  description: 'Weather Forecast Website',
  generator: 'v0.app',
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode,
  params: { locale: string }
}>) {
  const { locale } = params;

  if (!locales.includes(locale as any)) {
    notFound()
  }

  return (
      <ClientWrapper locale={locale}>
        {children}
      </ClientWrapper>
  )
}