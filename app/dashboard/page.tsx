"use client"

import { AppLayout } from "@/components/app-shell/app-layout"
import { EnhancedRoleDashboard } from "@/components/dashboard/enhanced-role-dashboard-clean"

export default function DashboardPage() {
  return (
    <AppLayout>
      <EnhancedRoleDashboard />
    </AppLayout>
  )
}
