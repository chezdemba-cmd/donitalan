import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'donitalan-dev-secret'
)

export async function getUserSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('donitalan-token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      id: payload.userId as string,
      role: payload.role as string,
      phone: payload.phone as string,
      email: payload.email as string,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
    }
  } catch {
    return null
  }
}
