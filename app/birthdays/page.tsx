import { Suspense } from 'react';
import BirthdaysClient from './BirthdaysClient';
import BirthdaysSkeleton from './BirthdaysSkeleton';
import type { BirthdayPerson } from './BirthdaysClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Дні народження | KABUR18',
  description: 'Календар днів народження',
};

export const revalidate = 300; // Revalidate кожні 5 хвилин

async function fetchBirthdays(): Promise<BirthdayPerson[]> {
  redirect('/');
  // try {
  //   const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_BIRTHDAYS_URL;
    
  //   if (!SCRIPT_URL) {
  //     console.error('Google Script Birthdays URL not configured');
  //     return [];
  //   }

  //   const response = await fetch(SCRIPT_URL, {
  //     cache: 'no-store',
  //     next: { revalidate: 300 }
  //   });

  //   if (!response.ok) {
  //     console.error(`Fetch error: ${response.status}`);
  //     return [];
  //   }

  //   const data = await response.json();
    
  //   if (!Array.isArray(data)) {
  //     console.error('Invalid data format');
  //     return [];
  //   }

  //   return data;

  // } catch (error) {
  //   console.error('fetchBirthdays error:', error);
  //   return [];
  // }
}

async function BirthdaysContent() {
  const birthdays = await fetchBirthdays();
  
  if (birthdays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">📅</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">Немає даних</h3>
        <p className="text-muted-foreground">
          Не вдалося завантажити дні народження. Спробуйте пізніше.
        </p>
      </div>
    );
  }

  return <BirthdaysClient data={birthdays} />;
}

export default function BirthdaysPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Дні народження
          </h1>
          <p className="text-muted-foreground">
            Календар
          </p>
        </div>

        <Suspense fallback={<BirthdaysSkeleton />}>
          <BirthdaysContent />
        </Suspense>
      </div>
    </div>
  );
}