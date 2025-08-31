'use client'
import { NextIntlClientProvider } from 'next-intl'
import { ReactNode, useEffect, useState } from 'react'

interface Props {
  children: ReactNode
  locale: string
}

export default function ClientWrapper({ children, locale }: Props) {
  const [messages, setMessages] = useState<any>(null)

  useEffect(() => {
    import(`../locales/${locale}/translation.json`)
      .then((mod) => setMessages(mod))
      .catch(() => setMessages({}))
  }, [locale])

  if (!messages) return null // Или спиннер

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  )
}