import type { Metadata } from "next"
import { FileUpload } from "@/components/file-management/file-upload"
import { DataExport } from "@/components/advanced/data-export"
import { AdvancedSearch } from "@/components/advanced/advanced-search"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Upload, Download, Search } from "lucide-react"

export const metadata: Metadata = {
  title: "Document Management | Hospital Management System",
  description: "Manage patient documents, medical records, and file uploads",
}

// Mock data for demonstration
const exportFields = [
  { id: "patient_name", label: "Patient Name", checked: true },
  { id: "document_type", label: "Document Type", checked: true },
  { id: "upload_date", label: "Upload Date", checked: true },
  { id: "file_size", label: "File Size", checked: false },
  { id: "uploaded_by", label: "Uploaded By", checked: false },
]

const searchFields = [
  { id: "patient_name", label: "Patient Name", type: "text" as const },
  {
    id: "document_type",
    label: "Document Type",
    type: "select" as const,
    options: [
      { value: "medical_record", label: "Medical Record" },
      { value: "lab_result", label: "Lab Result" },
      { value: "prescription", label: "Prescription" },
      { value: "insurance", label: "Insurance Document" },
    ],
  },
  { id: "upload_date", label: "Upload Date", type: "date" as const },
  { id: "file_size", label: "File Size (MB)", type: "number" as const },
]

export default function DocumentsPage() {
  const handleFileUpload = (files: any[]) => {
    console.log("Files uploaded:", files)
  }

  const handleExport = async (format: string, fields: string[], dateRange?: any) => {
    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log("Exporting:", { format, fields, dateRange })
  }

  const handleSearch = (query: string, filters: any[]) => {
    console.log("Searching:", { query, filters })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Document Management</h1>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Documents
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search & Filter
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Patient Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                multiple={true}
                maxSize={25}
                onFilesChange={handleFileUpload}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Document Search</CardTitle>
            </CardHeader>
            <CardContent>
              <AdvancedSearch
                fields={searchFields}
                onSearch={handleSearch}
                placeholder="Search documents by patient name, type, or content..."
              />
            </CardContent>
          </Card>

          {/* Mock search results would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">Use the search filters above to find documents</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataExport title="Document Records" fields={exportFields} onExport={handleExport} />

            <Card>
              <CardHeader>
                <CardTitle>Export Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">CSV Format</h4>
                  <p className="text-sm text-muted-foreground">
                    Exports data in comma-separated values format, suitable for spreadsheet applications.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Excel Format</h4>
                  <p className="text-sm text-muted-foreground">
                    Creates a formatted Excel workbook with proper column headers and data types.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">PDF Report</h4>
                  <p className="text-sm text-muted-foreground">
                    Generates a professional PDF report with charts and formatted tables.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
