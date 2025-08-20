import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to login page when accessing root
  redirect('/login')
}