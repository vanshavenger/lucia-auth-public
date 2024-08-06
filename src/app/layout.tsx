import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ScrollToTopButton } from '@/components/global/scroll-to-top-button'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lucia-Auth',
  description: 'Lucia-Auth template for Next.js with Tailwind CSS by Vansh Chopra.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ScrollToTopButton />
          <Toaster richColors closeButton position='bottom-right' expand />
        </ThemeProvider>
      </body>
    </html>
  )
}
