import { NextRequest, NextResponse } from 'next/server'
import { User, Tokens, UserLogin, LoginResponse } from '@/types'
import { mainApi } from '@/lib/api'

export async function POST(req: NextRequest) {
  const payload: UserLogin = await req.json()
  console.log("Login request payload:", payload)
  try {
    const result: LoginResponse = await mainApi.auth.login(payload)

    const user: User = result.user;
    const tokens: Tokens = {
      accessToken: result.access_token,
        expires_in: result.expires_in
    };

    const response = NextResponse.json({ user, tokens });

    // Store tokens in secure HTTP-only cookies
    response.cookies.set("syntra_chat_accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: tokens.expires_in, // Use the token's expiry time
      path: "/",
    });

    // Store user info in a separate cookie (can be accessed client-side for UI purposes)
    response.cookies.set(
      "syntra_chat_user",
      JSON.stringify({
        id: user.id,
        orgId: user.organization_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        avatar: user.avatar_url ? user.avatar_url : null,
        initials: user.initials,
        isAdmin: user.is_admin,
      }),
      {
        httpOnly: false, // Accessible on client-side for UI
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: tokens.expires_in, // 7 days
        path: "/",
      }
    );

    return response
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 })
  }
}