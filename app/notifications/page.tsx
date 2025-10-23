import { AppLayout } from "@/components/app-shell/app-layout"

export default function NotificationsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight">Notifications / Alerts</h1>
        <p className="text-muted-foreground mt-2">View and manage system notifications and alerts</p>
        <div className="mt-8 p-8 border rounded-lg bg-muted/50">
          <p className="text-center text-muted-foreground">Notifications system coming soon...</p>
        </div>
      </div>
    </AppLayout>
  )
}
