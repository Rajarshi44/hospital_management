import { AppLayout } from "@/components/app-shell/app-layout"
import { DepartmentManagement } from "@/components/doctors/department-management"

export default function DepartmentsPage() {
  return (
    <AppLayout>
      <DepartmentManagement />
    </AppLayout>
  )
}