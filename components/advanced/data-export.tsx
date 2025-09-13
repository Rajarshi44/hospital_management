"use client"

import { useState } from "react"
import { Download, FileText, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import type { DateRange } from "react-day-picker"

interface ExportField {
  id: string
  label: string
  checked: boolean
}

interface DataExportProps {
  title: string
  fields: ExportField[]
  onExport: (format: string, fields: string[], dateRange?: DateRange) => Promise<void>
}

export function DataExport({ title, fields: initialFields, onExport }: DataExportProps) {
  const [format, setFormat] = useState<string>("csv")
  const [fields, setFields] = useState<ExportField[]>(initialFields)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [isExporting, setIsExporting] = useState(false)

  const handleFieldToggle = (fieldId: string) => {
    setFields((prev) => prev.map((field) => (field.id === fieldId ? { ...field, checked: !field.checked } : field)))
  }

  const handleSelectAll = () => {
    const allChecked = fields.every((field) => field.checked)
    setFields((prev) => prev.map((field) => ({ ...field, checked: !allChecked })))
  }

  const handleExport = async () => {
    const selectedFields = fields.filter((field) => field.checked).map((field) => field.id)

    if (selectedFields.length === 0) {
      toast({
        title: "Export Error",
        description: "Please select at least one field to export",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    try {
      await onExport(format, selectedFields, dateRange)
      toast({
        title: "Export Successful",
        description: `Data exported as ${format.toUpperCase()} file`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "csv":
      case "xlsx":
        return <FileSpreadsheet className="h-4 w-4" />
      default:
        return <Download className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Export Format</label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV File</SelectItem>
              <SelectItem value="xlsx">Excel File</SelectItem>
              <SelectItem value="pdf">PDF Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range (Optional)</label>
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        </div>

        {/* Field Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Fields to Export</label>
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {fields.every((field) => field.checked) ? "Deselect All" : "Select All"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {fields.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox id={field.id} checked={field.checked} onCheckedChange={() => handleFieldToggle(field.id)} />
                <label
                  htmlFor={field.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {field.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <Button onClick={handleExport} disabled={isExporting} className="w-full">
          {getFormatIcon(format)}
          {isExporting ? "Exporting..." : `Export as ${format.toUpperCase()}`}
        </Button>
      </CardContent>
    </Card>
  )
}
