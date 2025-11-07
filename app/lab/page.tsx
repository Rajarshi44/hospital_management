"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, FileText, Clock, CheckCircle, AlertTriangle, Edit, Loader2 } from "lucide-react"
import { AppLayout } from "@/components/app-shell/app-layout"
import { LabOrderForm } from "@/components/lab/lab-order-form"
import { LabResultsViewer } from "@/components/lab/lab-results-viewer"
import { LabTestMaster } from "@/components/lab/lab-test-master"
import { LabOrderStatusDialog } from "@/components/lab/lab-order-status-dialog"
import { useLab } from "@/hooks/useLab"
import { LabOrderStatus, Priority } from "@/lib/types/lab.types"

export default function LabPage() {
  const [activeTab, setActiveTab] = useState("orders")
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  
  const { orders, loading, fetchOrders, updateOrderStatus } = useLab()

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredOrders = orders.filter(
    (order) => {
      const patientName = order.patient ? `${order.patient.firstName} ${order.patient.lastName}` : ''
      const doctorName = order.doctor ? `${order.doctor.firstName} ${order.doctor.lastName}` : ''
      const searchLower = searchTerm.toLowerCase()
      
      return (
        patientName.toLowerCase().includes(searchLower) ||
        doctorName.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower) ||
        (order.orderId || '').toLowerCase().includes(searchLower)
      )
    }
  )

  const handleStatusUpdate = async (orderId: string, newStatus: LabOrderStatus) => {
    try {
      await updateOrderStatus(orderId, {
        status: newStatus,
        notes: `Status updated to ${newStatus}`,
      })
      setEditingOrderId(null)
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  const getStatusIcon = (status: LabOrderStatus) => {
    switch (status) {
      case LabOrderStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case LabOrderStatus.IN_PROGRESS:
        return <Clock className="h-4 w-4 text-blue-600" />
      case LabOrderStatus.PENDING:
        return <Clock className="h-4 w-4 text-yellow-600" />
      case LabOrderStatus.CANCELLED:
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: LabOrderStatus) => {
    switch (status) {
      case LabOrderStatus.COMPLETED:
        return "bg-green-50 text-green-700 border-green-200"
      case LabOrderStatus.IN_PROGRESS:
        return "bg-blue-50 text-blue-700 border-blue-200"
      case LabOrderStatus.PENDING:
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case LabOrderStatus.CANCELLED:
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT:
        return "destructive"
      case Priority.HIGH:
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
                  <p className="text-2xl font-bold">{orders.filter((o) => o.status === LabOrderStatus.PENDING).length}</p>
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
                  <p className="text-2xl font-bold">{orders.filter((o) => o.status === LabOrderStatus.IN_PROGRESS).length}</p>
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
                  <p className="text-2xl font-bold">{orders.filter((o) => o.status === LabOrderStatus.COMPLETED).length}</p>
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
                  <p className="text-2xl font-bold">{orders.filter((o) => o.priority === Priority.URGENT).length}</p>
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
            <TabsTrigger value="tests">Lab Master</TabsTrigger>
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
                        <TableCell className="font-mono">{order.orderId || order.id}</TableCell>
                        <TableCell className="font-medium">{order.patient ? `${order.patient.firstName} ${order.patient.lastName}` : '—'}</TableCell>
                        <TableCell>{order.doctor ? `${order.doctor.firstName} ${order.doctor.lastName}` : '—'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(order.tests || []).slice(0, 2).map((test) => (
                              <Badge key={test.id} variant="outline" className="text-xs">
                                {test.test?.name?.split(" ")[0] || test.testId}
                              </Badge>
                            ))}
                            {(order.tests || []).length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(order.tests || []).length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(order.priority)}>{order.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>{order.orderedAt ? new Date(order.orderedAt).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setEditingOrderId(order.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedOrderId(order.id)}>
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {editingOrderId && (
              <LabOrderStatusDialog
                  orderId={editingOrderId}
                  currentStatus={orders.find(o => o.id === editingOrderId)?.status ?? LabOrderStatus.PENDING}
                  onStatusUpdate={handleStatusUpdate}
                  onClose={() => setEditingOrderId(null)}
                />
            )}
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
            <LabTestMaster />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
