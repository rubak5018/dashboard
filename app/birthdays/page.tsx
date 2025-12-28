import { Suspense } from 'react';
import BirthdaysClient from './BirthdaysClient';
import BirthdaysSkeleton from './BirthdaysSkeleton';

export const metadata = {
  title: 'Дні народження | RUBAK',
  description: 'Календар днів народження',
};

async function fetchBirthdays() {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_BIRTHDAYS_URL, // GAS URL
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`Fetch error: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];

  } catch (error) {
    console.error('fetchBirthdays error:', error);
    return [];
  }
}

export default async function BirthdaysPage() {
  const birthdays = await fetchBirthdays();

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Дні народження
          </h1>
          <p className="text-muted-foreground">
            Календар днів народження
          </p>
        </div>

        <Suspense fallback={<BirthdaysSkeleton />}>
          <BirthdaysClient data={birthdays} />
        </Suspense>
      </div>
    </div>
  );
}
