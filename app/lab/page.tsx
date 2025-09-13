"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { AppLayout } from "@/components/app-shell/app-layout"
import { LabOrderForm } from "@/components/lab/lab-order-form"
import { LabResultsViewer } from "@/components/lab/lab-results-viewer"
import { mockLabOrders } from "@/lib/lab"

export default function LabPage() {
  const [activeTab, setActiveTab] = useState("orders")
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOrders = mockLabOrders.filter(
    (order) =>
      order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "cancelled":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-200"
      case "processing":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "stat":
        return "destructive"
      case "urgent":
        return "default"
      default:
        return "secondary"
    }
  }

  if (showOrderForm) {
    return (
      <AppLayout>
        <LabOrderForm
          onSubmit={(order) => {
            console.log("New order:", order)
            setShowOrderForm(false)
          }}
          onCancel={() => setShowOrderForm(false)}
        />
      </AppLayout>
    )
  }

  if (selectedOrderId) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setSelectedOrderId(null)}>
            ← Back to Orders
          </Button>
          <LabResultsViewer orderId={selectedOrderId} />
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
            <h1 className="text-3xl font-bold">Laboratory</h1>
            <p className="text-muted-foreground">Manage lab orders and view test results</p>
          </div>
          <Button onClick={() => setShowOrderForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Lab Order
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold">{mockLabOrders.filter((o) => o.status === "pending").length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold">{mockLabOrders.filter((o) => o.status === "processing").length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                  <p className="text-2xl font-bold">{mockLabOrders.filter((o) => o.status === "completed").length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">STAT Orders</p>
                  <p className="text-2xl font-bold">{mockLabOrders.filter((o) => o.priority === "stat").length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="orders">Lab Orders</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="tests">Test Catalog</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lab Orders</CardTitle>
                    <CardDescription>View and manage laboratory test orders</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search orders..."
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
                      <TableHead>Order ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Tests</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.id}</TableCell>
                        <TableCell className="font-medium">{order.patientName}</TableCell>
                        <TableCell>{order.doctorName}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {order.tests.slice(0, 2).map((test) => (
                              <Badge key={test.id} variant="outline" className="text-xs">
                                {test.name.split(" ")[0]}
                              </Badge>
                            ))}
                            {order.tests.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{order.tests.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(order.priority)}>{order.priority.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <Badge className={getStatusColor(order.status)}>{order.status.toUpperCase()}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>{order.orderedAt.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedOrderId(order.id)}>
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

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Recent Results</CardTitle>
                <CardDescription>View completed test results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium">No Results Available</h3>
                  <p className="text-sm text-muted-foreground">Select an order from the Orders tab to view results</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <Card>
              <CardHeader>
                <CardTitle>Test Catalog</CardTitle>
                <CardDescription>Browse available laboratory tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium">Test Catalog</h3>
                  <p className="text-sm text-muted-foreground">View available tests and their information</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
