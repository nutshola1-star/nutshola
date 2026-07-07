import AccountingClient from './AccountingClient';

export const metadata = {
  title: 'Accounting - Nutshola',
  description: 'View accounting reports, track revenue, orders, and financial statistics for Nutshola.',
  keywords: [
    'Nutshola',
    'accounting',
    'revenue',
    'orders',
    'financial report',
    'business analytics',
    'sales report'
  ],
  authors: [{ name: 'Nutshola' }],
  creator: 'Nutshola',
  publisher: 'Nutshola',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function AccountingPage() {
  return <AccountingClient />;
}