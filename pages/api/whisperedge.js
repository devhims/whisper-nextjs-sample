import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

const handler = (req) => {
  const { headers } = new NextRequest(req);
  const userAgent = headers.get('user-agent');
  return NextResponse.json({ userAgent });
};

export default handler;
