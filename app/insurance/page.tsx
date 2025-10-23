import { AppLayout } from "@/components/app-shell/app-layout"

export default function InsurancePage() {
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight">Insurance / TPA</h1>
        <p className="text-muted-foreground mt-2">
          Manage insurance claims and Third Party Administrator (TPA) relationships
        </p>
        <div className="mt-8 p-8 border rounded-lg bg-muted/50">
          <p className="text-center text-muted-foreground">
            Insurance and TPA management system coming soon...
          </p>
        </div>
      </div>
    </AppLayout>
  )
}