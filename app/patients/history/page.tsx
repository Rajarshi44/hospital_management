import { AppLayout } from "@/components/app-shell/app-layout"

export default function PatientHistoryPage() {
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight">Patient History</h1>
        <p className="text-muted-foreground mt-2">View comprehensive patient medical history and records</p>
        <div className="mt-8 p-8 border rounded-lg bg-muted/50">
          <p className="text-center text-muted-foreground">Patient history system coming soon...</p>
        </div>
      </div>
    </AppLayout>
  )
}
