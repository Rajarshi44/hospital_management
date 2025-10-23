import { AppLayout } from "@/components/app-shell/app-layout"

export default function DutyRosterPage() {
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight">Duty Roster</h1>
        <p className="text-muted-foreground mt-2">
          Manage staff duty schedules and shift planning
        </p>
        <div className="mt-8 p-8 border rounded-lg bg-muted/50">
          <p className="text-center text-muted-foreground">
            Duty roster system coming soon...
          </p>
        </div>
      </div>
    </AppLayout>
  )
}