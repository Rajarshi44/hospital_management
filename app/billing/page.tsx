"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, FileText, DollarSign, Clock, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react"
import { AppLayout } from "@/components/app-shell/app-layout"
import { InvoiceForm } from "@/components/billing/invoice-form"
import { InvoiceViewer } from "@/components/billing/invoice-viewer"
import { mockInvoices } from "@/lib/billing"

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState("invoices")
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredInvoices = mockInvoices.filter(
    (invoice) =>
      invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.doctorName && invoice.doctorName.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "sent":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "draft":
        return <Clock className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-50 text-green-700 border-green-200"
      case "sent":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "overdue":
        return "bg-red-50 text-red-700 border-red-200"
      case "draft":
        return "bg-gray-50 text-gray-700 border-gray-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  // Calculate statistics
  const totalRevenue = mockInvoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.total, 0)
  const pendingAmount = mockInvoices.filter((inv) => inv.status === "sent").reduce((sum, inv) => sum + inv.total, 0)
  const overdueAmount = mockInvoices.filter((inv) => inv.status === "overdue").reduce((sum, inv) => sum + inv.total, 0)

  if (showInvoiceForm) {
    return (
      <AppLayout>
        <InvoiceForm
          onSubmit={(invoice) => {
            console.log("New invoice:", invoice)
            setShowInvoiceForm(false)
          }}
          onCancel={() => setShowInvoiceForm(false)}
        />
      </AppLayout>
    )
  }

  if (selectedInvoiceId) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setSelectedInvoiceId(null)}>
            ← Back to Invoices
          </Button>
          <InvoiceViewer invoiceId={selectedInvoiceId} />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Billing & Invoices</h1>
            <p className="text-muted-foreground">Manage patient billing and financial records</p>
          </div>
          <Button onClick={() => setShowInvoiceForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">${pendingAmount.toFixed(2)}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">${overdueAmount.toFixed(2)}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">${(totalRevenue * 0.3).toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>Manage patient invoices and billing</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search invoices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                        <TableCell className="font-medium">{invoice.patientName}</TableCell>
                        <TableCell>{invoice.doctorName || "-"}</TableCell>
                        <TableCell className="font-medium">${invoice.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(invoice.status)}
                            <Badge className={getStatusColor(invoice.status)}>{invoice.status.toUpperCase()}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>{invoice.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={invoice.status === "overdue" ? "text-red-600 font-medium" : ""}>
                            {invoice.dueDate.toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedInvoiceId(invoice.id)}>
                            <FileText className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Track received payments and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium">Payment Tracking</h3>
                  <p className="text-sm text-muted-foreground">View payment history and transaction details</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>Generate billing and revenue reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium">Financial Analytics</h3>
                  <p className="text-sm text-muted-foreground">Generate detailed financial reports and analytics</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
