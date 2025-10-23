"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserCheck, Activity, FileText, Users, Clock, AlertTriangle, TrendingUp, Bed } from "lucide-react"
import Link from "next/link"
import { mockAdmissions, getDaysAdmitted } from "@/lib/ipd-mock-data"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"

export default function IPDOverviewPage() {
  // Calculate dashboard stats
  const totalAdmissions = mockAdmissions.filter(a => a.status !== 'discharged').length
  const criticalPatients = mockAdmissions.filter(a => a.status === 'critical').length
  const dischargeReady = mockAdmissions.filter(a => 
    a.status === 'stable' && getDaysAdmitted(a.admissionDate) >= 2
  ).length
  const newAdmissionsToday = mockAdmissions.filter(a => 
    new Date(a.admissionDate).toDateString() === new Date().toDateString()
  ).length

  const recentAdmissions = mockAdmissions
    .filter(a => a.status !== 'discharged')
    .sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime())
    .slice(0, 5)

  return (
    <AuthProvider>
      <AppLayout>
        <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">IPD Management</h1>
          <p className="text-muted-foreground">
            Comprehensive inpatient department management system
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {totalAdmissions} Active Patients
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admissions</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAdmissions}</div>
            <p className="text-xs text-muted-foreground">
              Active inpatients
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Patients</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Discharge</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dischargeReady}</div>
            <p className="text-xs text-muted-foreground">
              Patients stable for discharge
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Admissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newAdmissionsToday}</div>
            <p className="text-xs text-muted-foreground">
              New admissions today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 hover:border-blue-300 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              Patient Admission
            </CardTitle>
            <CardDescription>
              Admit new patients or register existing patients for inpatient care
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/ipd/admission">
              <Button className="w-full">
                <UserCheck className="mr-2 h-4 w-4" />
                New Admission
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-green-200 hover:border-green-300 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Inpatient Management
            </CardTitle>
            <CardDescription>
              Monitor patient status, record vitals, manage treatments and transfers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/ipd/inpatient">
              <Button variant="outline" className="w-full">
                <Activity className="mr-2 h-4 w-4" />
                Manage Patients
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:border-purple-300 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Patient Discharge
            </CardTitle>
            <CardDescription>
              Process discharges, generate summaries and complete billing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/ipd/discharge">
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Process Discharge
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Admissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Admissions</CardTitle>
          <CardDescription>
            Latest patient admissions and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAdmissions.map((admission) => (
              <div key={admission.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{admission.patientName}</h3>
                    <Badge variant="secondary">{admission.uhid}</Badge>
                    <Badge 
                      variant={admission.status === 'critical' ? 'destructive' : 
                              admission.status === 'stable' ? 'default' : 'secondary'}
                    >
                      {admission.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {admission.wardName} - Bed {admission.bedNumber}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {getDaysAdmitted(admission.admissionDate)} days
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/admin/ipd/inpatient">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {recentAdmissions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No recent admissions</p>
              <p className="text-sm">New admissions will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </AppLayout>
    </AuthProvider>
  )
}