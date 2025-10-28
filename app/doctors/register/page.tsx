"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-shell/app-layout"
import { DoctorRegistrationFormSimplified } from "@/components/doctors/doctor-registration-form-simplified"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function RegisterDoctorPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/doctors")
  }

  const handleCancel = () => {
    router.push("/doctors")
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Register New Doctor</h1>
            <p className="text-muted-foreground">
              Enter doctor information to register them in the system
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="max-w-5xl mx-auto">
          <DoctorRegistrationFormSimplified onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </div>
    </AppLayout>
  )
}
