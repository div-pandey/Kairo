import type { Metadata } from 'next';
import './globals.css';
import { NavigationProgress } from '@/components/ui/NavigationProgress';

export const metadata: Metadata = {
  title: 'Kairo — KCC Student Printing Service',
  description: 'Affordable campus printing for KCC ITM students. Black & White ₹3/page, Colour ₹5/page. Upload, configure, and collect your printouts hassle-free.',
  keywords: 'KCC, printing, student, printout, campus, KCC ITM',
  openGraph: {
    title: 'Kairo — KCC Student Printing Service',
    description: 'Print your college work without burning your pocket. B&W ₹3/page, Colour ₹5/page.',
    type: 'website',
    siteName: 'Kairo',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
