"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Mail, Printer, CreditCard, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { mockInvoices, serviceCategories } from "@/lib/billing"

interface InvoiceViewerProps {
  invoiceId: string
}

export function InvoiceViewer({ invoiceId }: InvoiceViewerProps) {
  const invoice = mockInvoices.find((inv) => inv.id === invoiceId)

  if (!invoice) {
    return <div>Invoice not found</div>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "sent":
        return <Mail className="h-4 w-4 text-blue-600" />
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

  const getCategoryStyle = (category: string) => {
    const categoryInfo = serviceCategories.find((cat) => cat.value === category)
    return categoryInfo?.color || "bg-gray-50 text-gray-700"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoice {invoice.invoiceNumber}</h2>
          <p className="text-muted-foreground">Created on {invoice.createdAt.toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          {invoice.status !== "paid" && (
            <Button>
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(invoice.status)}
              <div>
                <h3 className="font-medium">Invoice Status</h3>
                <Badge className={getStatusColor(invoice.status)}>{invoice.status.toUpperCase()}</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">${invoice.total.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle>Bill To</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{invoice.patientName}</p>
              {invoice.patientEmail && <p className="text-sm text-muted-foreground">{invoice.patientEmail}</p>}
              {invoice.patientPhone && <p className="text-sm text-muted-foreground">{invoice.patientPhone}</p>}
              {invoice.patientAddress && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.patientAddress}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Number:</span>
                <span className="font-medium">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issue Date:</span>
                <span>{invoice.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date:</span>
                <span>{invoice.dueDate.toLocaleDateString()}</span>
              </div>
              {invoice.doctorName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider:</span>
                  <span>{invoice.doctorName}</span>
                </div>
              )}
              {invoice.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="capitalize">{invoice.paymentMethod.replace("_", " ")}</span>
                </div>
              )}
              {invoice.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid On:</span>
                  <span>{invoice.paidAt.toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle>Services & Charges</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryStyle(item.category)}>
                      {serviceCategories.find((cat) => cat.value === item.category)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">${item.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${invoice.tax.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-${invoice.discount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
