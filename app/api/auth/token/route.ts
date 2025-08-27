import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'No token found' }, { status: 401 })
    }

    return NextResponse.json({ access_token: accessToken })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get token' }, { status: 500 })
  }
}