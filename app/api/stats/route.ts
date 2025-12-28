import { NextResponse } from 'next/server';

export const revalidate = 30; // Кеш на 30 секунд

interface DashboardStats {
  totalFlights: number;
  successfulHits: number;
  droneLosses: number;
  successRate: number;
  crewStats: {
    crew: string;
    flights: number;
    hits: number;
    losses: number;
  }[];
  pilotStats: {
    pilot: string;
    flights: number;
    hits: number;
  }[];
  targetStats: {
    target: string;
    count: number;
  }[];
  recentFlights: {
    time: string;
    pilot: string;
    result: string;
    target: string;
  }[];
}

export async function GET() {
  try {
    const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_STATS_URL;

    if (!SCRIPT_URL) {
      console.error('Google Script URL not configured');
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
      next: { revalidate: 30 } // Next.js кеш
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from Google Sheets');
    }

    const data: DashboardStats = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}