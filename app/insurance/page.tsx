"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AppLayout } from "@/components/app-shell/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { FileText, Upload, Calendar as CalendarIcon, Building2, Shield, Users } from "lucide-react"

// Mock data for dropdowns
const insuranceProviders = [
  "Star Health Insurance",
  "ICICI Lombard",
  "HDFC ERGO",
  "Bajaj Allianz",
  "New India Assurance",
  "National Insurance",
  "United India Insurance",
  "Oriental Insurance",
  "Max Bupa",
  "Care Health Insurance",
]

const tpaProviders = [
  "Medi Assist",
  "MD India Healthcare",
  "Paramount Health",
  "Vidal Health",
  "Raksha TPA",
  "Heritage Health",
  "East West Assist",
  "Family Health Plan",
  "Good Health TPA",
  "Anmol Medicare",
]

// Form Schema
const insuranceFormSchema = z
  .object({
    // Insurance Details
    insuranceProvider: z.string().min(1, "Insurance provider is required"),
    insuranceType: z.enum(["Cashless", "Reimbursement", "Corporate"]),
    policyNumber: z.string().min(1, "Policy number is required"),
    policyStartDate: z.date().optional(),
    policyEndDate: z.date().optional(),
    sumInsured: z.number().min(0).optional(),
    coveragePercent: z.number().min(0).max(100).optional(),
    preAuthRequired: z.boolean().default(false),
    preAuthNumber: z.string().optional(),
    preAuthDate: z.date().optional(),
    claimNumber: z.string().optional(),
    claimStatus: z.enum(["Pending", "Approved", "Rejected", "Settled", "In Progress"]).optional(),
    approvalAmount: z.number().min(0).optional(),
    claimSettlementDate: z.date().optional(),

    // TPA Details
    tpaName: z.string().optional(),
    tpaContactPerson: z.string().optional(),
    tpaPhone: z.string().optional(),
    tpaEmail: z.string().email().optional().or(z.literal("")),
    tpaAddress: z.string().optional(),
    tpaReferenceNumber: z.string().optional(),
    claimSubmissionDate: z.date().optional(),
    tpaResponseDate: z.date().optional(),
    tpaRemarks: z.string().optional(),

    // Corporate Info
    corporateName: z.string().optional(),
    corporateCode: z.string().optional(),
    employeeId: z.string().optional(),
    relationToEmployee: z.enum(["Self", "Spouse", "Child", "Parent"]).optional(),
  })
  .refine(
    data => {
      if (data.policyStartDate && data.policyEndDate) {
        return data.policyEndDate >= data.policyStartDate
      }
      return true
    },
    {
      message: "Policy end date must be after start date",
      path: ["policyEndDate"],
    }
  )

type InsuranceFormValues = z.infer<typeof insuranceFormSchema>

export default function InsurancePage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("insurance")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const form = useForm<InsuranceFormValues>({
    resolver: zodResolver(insuranceFormSchema),
    defaultValues: {
      insuranceType: "Cashless",
      preAuthRequired: false,
      coveragePercent: 100,
      claimStatus: "Pending",
    },
  })

  const preAuthRequired = form.watch("preAuthRequired")

  const onSubmit = (data: InsuranceFormValues) => {
    // Auto-validate policy dates
    const today = new Date()
    if (data.policyStartDate && data.policyEndDate) {
      if (today < data.policyStartDate) {
        toast({
          title: "Policy Not Active",
          description: "Policy has not started yet",
          variant: "destructive",
        })
        return
      }
      if (today > data.policyEndDate) {
        toast({
          title: "Policy Expired",
          description: "Policy end date has passed",
          variant: "destructive",
        })
        return
      }
    }

    console.log("Insurance Data:", data)
    toast({
      title: "Insurance Details Saved",
      description: "Insurance and TPA information has been updated successfully",
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles([...uploadedFiles, ...newFiles])
      toast({
        title: "Files Uploaded",
        description: `${newFiles.length} file(s) uploaded successfully`,
      })
    }
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Insurance / TPA Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage insurance claims and Third Party Administrator (TPA) relationships
            </p>
          </div>
        </div>

        {/* Main Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="insurance" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Insurance Details
                </TabsTrigger>
                <TabsTrigger value="tpa" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  TPA Details
                </TabsTrigger>
                <TabsTrigger value="corporate" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Corporate Info
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Insurance Details */}
              <TabsContent value="insurance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Insurance Information</CardTitle>
                    <CardDescription>Complete insurance policy and claim details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="insuranceProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Provider Name *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select insurance provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {insuranceProviders.map(provider => (
                                  <SelectItem key={provider} value={provider}>
                                    {provider}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="insuranceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Cashless">Cashless</SelectItem>
                                <SelectItem value="Reimbursement">Reimbursement</SelectItem>
                                <SelectItem value="Corporate">Corporate</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="policyNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Policy Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter policy number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="policyStartDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Policy Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? format(field.value, "PPP") : "Pick a date"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={date => date > new Date() || date < new Date("1900-01-01")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="policyEndDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Policy End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? format(field.value, "PPP") : "Pick a date"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={date => date < new Date("1900-01-01")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sumInsured"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sum Insured (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="coveragePercent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coverage Percentage (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="100"
                                min="0"
                                max="100"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Pre-Authorization Section */}
                    <div className="space-y-4 pt-4 border-t">
                      <FormField
                        control={form.control}
                        name="preAuthRequired"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Pre-Authorization Required</FormLabel>
                              <FormDescription>Enable if pre-authorization is needed for this claim</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {preAuthRequired && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="preAuthNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pre-Authorization Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter pre-auth number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="preAuthDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Pre-Authorization Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? format(field.value, "PPP") : "Pick a date"}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={date => date > new Date() || date < new Date("1900-01-01")}
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {/* Claim Details Section */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold">Claim Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="claimNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Claim Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter claim number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="claimStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Claim Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Approved">Approved</SelectItem>
                                  <SelectItem value="Rejected">Rejected</SelectItem>
                                  <SelectItem value="Settled">Settled</SelectItem>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="approvalAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Approval Amount (₹)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  onChange={e => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="claimSettlementDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Claim Settlement Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? format(field.value, "PPP") : "Pick a date"}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={date => date < new Date("1900-01-01")}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Document Upload Section */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold">Documents</h3>
                      <div className="border-2 border-dashed rounded-lg p-6">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Upload insurance documents (PDF, JPG, PNG)</p>
                          <Input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            className="max-w-xs"
                          />
                        </div>
                        {uploadedFiles.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium">Uploaded Files:</p>
                            {uploadedFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4" />
                                <span>{file.name}</span>
                                <Badge variant="secondary">{(file.size / 1024).toFixed(2)} KB</Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: TPA Details */}
              <TabsContent value="tpa" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Third Party Administrator (TPA) Details</CardTitle>
                    <CardDescription>TPA contact and claim processing information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="tpaName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TPA Name</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select TPA" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {tpaProviders.map(tpa => (
                                  <SelectItem key={tpa} value={tpa}>
                                    {tpa}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tpaContactPerson"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TPA Contact Person</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter contact person name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tpaPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TPA Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tpaEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TPA Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tpaReferenceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TPA Reference Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter reference number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="claimSubmissionDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Claim Submission Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? format(field.value, "PPP") : "Pick a date"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={date => date > new Date() || date < new Date("1900-01-01")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tpaResponseDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>TPA Response Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? format(field.value, "PPP") : "Pick a date"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={date => date < new Date("1900-01-01")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="tpaAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TPA Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter TPA address" className="min-h-[100px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tpaRemarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TPA Remarks</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter any remarks or notes" className="min-h-[100px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 3: Corporate Info */}
              <TabsContent value="corporate" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Corporate / Employer Information</CardTitle>
                    <CardDescription>Details for corporate insurance policies</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="corporateName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Corporate Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter corporate/company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="corporateCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Corporate Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter corporate code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="employeeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employee ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter employee ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="relationToEmployee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relation to Employee</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select relation" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Self">Self</SelectItem>
                                <SelectItem value="Spouse">Spouse</SelectItem>
                                <SelectItem value="Child">Child</SelectItem>
                                <SelectItem value="Parent">Parent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">Save Insurance Details</Button>
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  )
}
