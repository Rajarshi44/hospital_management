"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear all authentication data
    localStorage.removeItem("hospital_user")
    
    // Clear any other session data
    localStorage.clear()
    
    // Redirect to login page
    router.push("/")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p>Logging out...</p>
      </div>
    </div>
  )
}