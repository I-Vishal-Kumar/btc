import { NextResponse } from 'next/server';
import { getCommissionPageDetails } from '@/(backend)/services/user.service.serv';

export async function GET() {
  const data = await getCommissionPageDetails();
  const response = NextResponse.json(data);

  response.headers.set(
    'Cache-Control',
    'public, max-age=120, stale-while-revalidate=180' 
  );

  return response;
}