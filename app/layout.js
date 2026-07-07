import './globals.css';
import Nav from '@/components/Nav';
import { BudgetProvider } from '@/components/budget-context';

export const metadata = {
  title: 'Personal Budget',
  description: 'Personal budget tracker — transactions, savings, groceries and loans',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Budget' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9f9f7' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0d0d' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BudgetProvider>
          <Nav />
          <main className="shell">{children}</main>
        </BudgetProvider>
      </body>
    </html>
  );
}
