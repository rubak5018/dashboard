import { NextResponse } from 'next/server';

export const revalidate = 300; // Кеш на 5 хвилин

export interface BirthdayPerson {
  id: string;
  name: string;
  birthDate: string; // ISO формат: YYYY-MM-DD
}

export async function GET() {
  try {
    const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_BIRTHDAYS_URL;

    if (!SCRIPT_URL) {
      console.error('Google Script Birthdays URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const response = await fetch(SCRIPT_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 },
      cache: 'no-store' // Не кешуємо на рівні fetch
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch birthdays: ${response.status}`);
    }

    const data = await response.json();
    
    // Валідація
    if (!Array.isArray(data)) {
      console.error('Invalid data format from Google Sheets');
      return NextResponse.json([], {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    // Фільтруємо та сортуємо
    const birthdays: BirthdayPerson[] = data
      .filter(item => {
        // Перевіряємо валідність даних
        if (!item.id || !item.name || !item.birthDate) {
          console.warn('Invalid birthday entry:', item);
          return false;
        }
        // Перевіряємо формат дати
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(item.birthDate)) {
          console.warn('Invalid date format:', item.birthDate);
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Сортуємо по місяцю та дню (ігноруємо рік)
        const dateA = new Date(a.birthDate);
        const dateB = new Date(b.birthDate);
        
        if (dateA.getMonth() !== dateB.getMonth()) {
          return dateA.getMonth() - dateB.getMonth();
        }
        return dateA.getDate() - dateB.getDate();
      });

    console.log(`Successfully fetched ${birthdays.length} birthdays`);

    return NextResponse.json(birthdays, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching birthdays:', error);
    return NextResponse.json(
      { error: 'Failed to fetch birthdays', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}