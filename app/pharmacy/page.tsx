"use client"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InventoryDashboard } from "@/components/pharmacy/inventory-dashboard"
import { PrescriptionManagement } from "@/components/pharmacy/prescription-management"
import { Package, Pill } from "lucide-react"

export default function PharmacyPage() {
  return (
    <AuthProvider>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pharmacy Management</h1>
            <p className="text-muted-foreground">Manage prescriptions, inventory, and medication dispensing</p>
          </div>

          <Tabs defaultValue="prescriptions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="prescriptions" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Prescriptions
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Inventory
              </TabsTrigger>
            </TabsList>

            <TabsContent value="prescriptions">
              <PrescriptionManagement />
            </TabsContent>

            <TabsContent value="inventory">
              <InventoryDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </AuthProvider>
  )
}
