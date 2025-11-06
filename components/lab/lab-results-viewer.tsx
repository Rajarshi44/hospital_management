"use client"

import type React from "react"
import { useState, useRef } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Download, FileText, AlertTriangle, CheckCircle, Clock, Save } from "lucide-react"
import { mockLabResults, mockLabOrders } from "@/lib/lab"
import { LabReportPrintLayout } from "./lab-report-print-layout"

interface LabResultsViewerProps {
  orderId: string
}

export function LabResultsViewer({ orderId }: LabResultsViewerProps) {
  const order = mockLabOrders.find((o) => o.id === orderId)
  const results = mockLabResults.filter((r) => r.orderId === orderId)
  const [report, setReport] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Lab Report ${orderId}</title>
              <style>
                body { margin: 0; padding: 0; }
                @media print {
                  @page { size: A4; margin: 10mm; }
                }
              </style>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 250)
      }
    }
  }

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
          <Button variant="outline" onClick={handlePrint}>
            <Download className="h-4 w-4 mr-2" />
            Generate PDF
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
          <TabsTrigger value="report">Write Report</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>View all test results for this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={results.length > 0 
                    ? results.map((result) => {
                        let text = `Test: ${result.testName}\n`;
                        text += `Status: ${result.status.toUpperCase()}\n`;
                        text += `Result: ${result.value}\n`;
                        if (result.normalRange) text += `Normal Range: ${result.normalRange}\n`;
                        if (result.units) text += `Units: ${result.units}\n`;
                        if (result.notes) text += `Notes: ${result.notes}\n`;
                        text += `Completed: ${result.completedAt.toLocaleDateString()} by ${result.technician}\n`;
                        if (result.verifiedBy) text += `Verified by: ${result.verifiedBy}\n`;
                        return text;
                      }).join('\n---\n\n')
                    : 'No results available yet. Results will appear here once tests are completed.'
                  }
                  readOnly
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lab Report</CardTitle>
                  <CardDescription>Write comprehensive report for this lab order</CardDescription>
                </div>
                {isSaved && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Saved
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2">Report Content</Label>
                  <Textarea
                    placeholder="Enter detailed lab report findings, observations, and recommendations...&#10;&#10;Example:&#10;Test: Complete Blood Count&#10;Findings: All parameters within normal limits&#10;Hemoglobin: 14.2 g/dL&#10;WBC Count: 7,500 cells/μL&#10;&#10;Interpretation: Normal blood profile&#10;Recommendation: No follow-up required"
                    value={report}
                    onChange={(e) => {
                      setReport(e.target.value)
                      setIsSaved(false)
                    }}
                    className="min-h-[400px] font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setIsSaved(true)
                      // Here you would typically save to backend
                      console.log("Report saved:", report)
                    }}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Report
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setReport("")
                      setIsSaved(false)
                    }}
                  >
                    Clear
                  </Button>
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

      {/* Hidden Print Layout */}
      <div className="hidden">
        <LabReportPrintLayout
          ref={printRef}
          patientInfo={{
            name: order.patientName,
            uhid: order.patientId,
            age: "N/A", // You can add this to mock data
            gender: "N/A", // You can add this to mock data
            address: undefined,
          }}
          orderInfo={{
            orderId: order.id,
            orderDate: order.orderedAt.toLocaleDateString(),
            collectionDate: order.collectedAt?.toLocaleDateString(),
            reportDate: order.completedAt?.toLocaleDateString() || new Date().toLocaleDateString(),
            doctorName: order.doctorName,
            priority: order.priority.toUpperCase(),
          }}
          tests={results.map((result) => ({
            testName: result.testName,
            value: result.value,
            units: result.units,
            normalRange: result.normalRange,
            status: result.status,
            notes: result.notes,
            completedAt: result.completedAt,
            technician: result.technician,
            verifiedBy: result.verifiedBy,
          }))}
          report={report || undefined}
        />
      </div>
    </div>
  )
}
