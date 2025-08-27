// app/page.tsx (server component)
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/login')
}