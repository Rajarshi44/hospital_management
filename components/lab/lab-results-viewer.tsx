"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { mockLabResults, mockLabOrders } from "@/lib/lab"

interface LabResultsViewerProps {
  orderId: string
}

export function LabResultsViewer({ orderId }: LabResultsViewerProps) {
  const order = mockLabOrders.find((o) => o.id === orderId)
  const results = mockLabResults.filter((r) => r.orderId === orderId)

  if (!order) {
    return <div>Order not found</div>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "normal":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "abnormal":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-50 text-green-700 border-green-200"
      case "abnormal":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "critical":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lab Results</h2>
          <p className="text-muted-foreground">Order #{order.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Order Information */}
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Patient</Label>
              <p className="font-medium">{order.patientName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Ordering Doctor</Label>
              <p className="font-medium">{order.doctorName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Order Date</Label>
              <p className="font-medium">{order.orderedAt.toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
              <Badge
                variant={
                  order.priority === "stat" ? "destructive" : order.priority === "urgent" ? "default" : "secondary"
                }
              >
                {order.priority.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {results.length > 0 ? (
            results.map((result) => (
              <Card key={result.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      {result.testName}
                    </CardTitle>
                    <Badge className={getStatusColor(result.status)}>{result.status.toUpperCase()}</Badge>
                  </div>
                  <CardDescription>
                    Completed on {result.completedAt.toLocaleDateString()} by {result.technician}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Results</Label>
                      <p className="font-mono text-sm bg-muted p-3 rounded-md mt-1">{result.value}</p>
                    </div>

                    {result.normalRange && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Normal Range</Label>
                        <p className="text-sm text-muted-foreground mt-1">{result.normalRange}</p>
                      </div>
                    )}

                    {result.units && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Units</Label>
                        <p className="text-sm text-muted-foreground mt-1">{result.units}</p>
                      </div>
                    )}

                    {result.notes && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                        <p className="text-sm mt-1">{result.notes}</p>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Technician: {result.technician}</span>
                      {result.verifiedBy && <span>Verified by: {result.verifiedBy}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium">Results Pending</h3>
                  <p className="text-sm text-muted-foreground">Test results are not yet available</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {results.filter((r) => r.status === "normal").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Normal</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {results.filter((r) => r.status === "abnormal").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Abnormal</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {results.filter((r) => r.status === "critical").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Critical</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Ordered Tests</h4>
                  <div className="space-y-2">
                    {order.tests.map((test) => (
                      <div key={test.id} className="flex justify-between items-center">
                        <span>{test.name}</span>
                        <Badge variant="outline">{test.category}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div>
                    <p className="font-medium">Order Created</p>
                    <p className="text-sm text-muted-foreground">{order.orderedAt.toLocaleString()}</p>
                  </div>
                </div>

                {order.collectedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                    <div>
                      <p className="font-medium">Sample Collected</p>
                      <p className="text-sm text-muted-foreground">{order.collectedAt.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {order.completedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <div>
                      <p className="font-medium">Results Available</p>
                      <p className="text-sm text-muted-foreground">{order.completedAt.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
