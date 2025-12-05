// DEPRECATED: This route has been moved to /api/mcp
// Keeping this file for backwards compatibility redirect

import { NextResponse } from 'next/server';

const REDIRECT_URL = 'https://interleaved-learning-mcp.vercel.app/api/mcp';

export async function GET() {
  return NextResponse.json(
    { 
      message: 'This endpoint has moved to /api/mcp',
      new_endpoint: REDIRECT_URL
    },
    { status: 301 }
  );
}

export async function POST() {
  return NextResponse.json(
    { 
      message: 'This endpoint has moved to /api/mcp',
      new_endpoint: REDIRECT_URL
    },
    { status: 301 }
  );
}
