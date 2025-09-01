'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  // @ts-ignore
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'uk'>(currentLocale);

  const languages = {
    en: { name: 'English', flag: '🇺🇸' },
    uk: { name: 'Українська', flag: '🇺🇦' },
  };

  const handleLanguageChange = (lang: 'en' | 'uk') => {
    setCurrentLanguage(lang);
    const segments = pathname.split('/');
    segments[1] = lang; // заменяем локаль в URL
    const newPath = segments.join('/');
    router.push(newPath);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='text-primary-foreground hover:bg-primary-foreground/10 gap-2 cursor-pointer'>
          <Globe className='h-4 w-4' />
          <span className='hidden sm:inline'>
            {languages[currentLanguage].flag} {languages[currentLanguage].name}
          </span>
          <span className='sm:hidden'>{languages[currentLanguage].flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-[160px]'>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('en')}
          className={`${currentLanguage === 'en' ? 'bg-accent' : ''} cursor-pointer`}
        >
          <span className='mr-2'>🇺🇸</span>
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('uk')}
          className={`${currentLanguage === 'uk' ? 'bg-accent' : ''} cursor-pointer`}
        >
          <span className='mr-2'>🇺🇦</span>
          Українська
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
