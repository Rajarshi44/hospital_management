import { AppLayout } from "@/components/app-shell/app-layout"

export default function IPDPatientsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight">IPD - Admission & Discharge</h1>
        <p className="text-muted-foreground mt-2">
          Manage in-patient admissions and discharges
        </p>
        <div className="mt-8 p-8 border rounded-lg bg-muted/50">
          <p className="text-center text-muted-foreground">
            IPD management system coming soon...
          </p>
        </div>
      </div>
    </AppLayout>
  )
}