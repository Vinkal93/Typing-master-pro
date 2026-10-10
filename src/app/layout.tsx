import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { ProfileProvider } from '@/context/ProfileContext';

export const metadata: Metadata = {
  title: 'Typing Master Pro — Offline Hindi & English Typing Tutor',
  description: 'Professional typing tutor software for computer institutes and government exam preparation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <ProfileProvider>
            {children}
          </ProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
