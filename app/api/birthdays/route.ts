import { NextResponse } from 'next/server';

export const revalidate = 300; // Кеш на 5 хвилин

interface BirthdayPerson {
  id: string;
  name: string;
  birthDate: string;
}

export async function GET() {
  try {
    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_BIRTHDAYS_URL;

    if (!scriptUrl) {
      throw new Error('Google Script URL not configured');
    }

    const response = await fetch(scriptUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 } // Next.js кеш на 5 хвилин
    });

    if (!response.ok) {
      throw new Error('Failed to fetch birthdays from Google Sheets');
    }

    const data: BirthdayPerson[] = await response.json();
    
    // Сортуємо по даті народження
    // const sorted = data.sort((a, b) => {
    //     const dateA = new Date(a.birthDate);
    //     const dateB = new Date(b.birthDate);
        
    //     // Сортуємо по місяцю та дню (ігноруємо рік)
    //     if (dateA.getMonth() !== dateB.getMonth()) {
    //         return dateA.getMonth() - dateB.getMonth();
    //     }
    //     return dateA.getDate() - dateB.getDate();
    // });
    console.log(data);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching birthdays:', error);
    return NextResponse.json(
      { error: 'Failed to fetch birthdays' },
      { status: 500 }
    );
  }
}