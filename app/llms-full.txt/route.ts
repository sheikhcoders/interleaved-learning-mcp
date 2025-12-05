import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'llms-full.txt');
    const content = readFileSync(filePath, 'utf-8');
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new NextResponse('# Interleaved Learning MCP Server\n\nFull documentation available at: https://github.com/sheikhcoders/interleaved-learning-mcp', {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }
}
