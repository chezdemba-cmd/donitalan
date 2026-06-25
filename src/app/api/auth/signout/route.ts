import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL('/accueil', request.url)
  const response = NextResponse.redirect(url)
  response.cookies.delete('donitalan-token')
  return response
}
