import { stravaService } from '@/lib/strava/service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const menu = await stravaService.getTodaysMenu();
    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not available' },
        { status: 404 }
      );
    }
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}