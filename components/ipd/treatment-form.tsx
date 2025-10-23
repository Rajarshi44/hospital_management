"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Pill, Stethoscope, FlaskConical, FileText, Save, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const treatmentSchema = z.object({
  type: z.enum(['medication', 'procedure', 'lab_order', 'investigation']),
  description: z.string().min(3, "Description must be at least 3 characters"),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string().optional()
})

interface TreatmentFormProps {
  admissionId: string
}

export function TreatmentForm({ admissionId }: TreatmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [treatmentType, setTreatmentType] = useState<string>("medication")

  const form = useForm<z.infer<typeof treatmentSchema>>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      type: "medication",
      description: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: ""
    }
  })

  const onSubmit = async (data: z.infer<typeof treatmentSchema>) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log("Treatment added:", {
        admissionId,
        ...data,
        prescribedAt: new Date().toISOString(),
        prescribedBy: "Current User", // This would come from auth context
        status: "active"
      })
      
      alert("Treatment added successfully!")
      form.reset()
    } catch (error) {
      console.error("Failed to add treatment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const commonMedications = [
    "Paracetamol 500mg",
    "Amoxicillin 250mg",
    "Ibuprofen 400mg",
    "Aspirin 75mg",
    "Metformin 500mg",
    "Omeprazole 20mg",
    "Atorvastatin 20mg",
    "Amlodipine 5mg"
  ]

  const commonProcedures = [
    "Blood Pressure Monitoring",
    "Wound Dressing",
    "IV Fluid Administration",
    "Catheter Insertion",
    "Nebulization",
    "Physical Therapy",
    "Chest Physiotherapy",
    "Oxygen Therapy"
  ]

  const commonLabTests = [
    "Complete Blood Count (CBC)",
    "Basic Metabolic Panel",
    "Lipid Profile",
    "Liver Function Tests",
    "Kidney Function Tests",
    "Thyroid Function Tests",
    "Blood Sugar (Fasting)",
    "Urine Analysis"
  ]

  const commonInvestigations = [
    "Chest X-Ray",
    "ECG (Electrocardiogram)",
    "Echocardiogram",
    "CT Scan",
    "MRI Scan",
    "Ultrasound",
    "Endoscopy",
    "Colonoscopy"
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication': return <Pill className="h-4 w-4" />
      case 'procedure': return <Stethoscope className="h-4 w-4" />
      case 'lab_order': return <FlaskConical className="h-4 w-4" />
      case 'investigation': return <FileText className="h-4 w-4" />
      default: return null
    }
  }

  const getCommonOptions = (type: string) => {
    switch (type) {
      case 'medication': return commonMedications
      case 'procedure': return commonProcedures
      case 'lab_order': return commonLabTests
      case 'investigation': return commonInvestigations
      default: return []
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Treatment Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Treatment Type</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Treatment Type *</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value)
                    setTreatmentType(value)
                    form.setValue("description", "") // Reset description when type changes
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select treatment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="medication">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4" />
                          Medication
                        </div>
                      </SelectItem>
                      <SelectItem value="procedure">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4" />
                          Procedure
                        </div>
                      </SelectItem>
                      <SelectItem value="lab_order">
                        <div className="flex items-center gap-2">
                          <FlaskConical className="h-4 w-4" />
                          Lab Order
                        </div>
                      </SelectItem>
                      <SelectItem value="investigation">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Investigation
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Treatment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getTypeIcon(treatmentType)}
              {treatmentType.charAt(0).toUpperCase() + treatmentType.slice(1).replace('_', ' ')} Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="common">Common {treatmentType.replace('_', ' ')}s</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {treatmentType === 'medication' ? 'Medication Name & Strength' : 
                         treatmentType === 'procedure' ? 'Procedure Name' :
                         treatmentType === 'lab_order' ? 'Lab Tests' :
                         'Investigation Details'} *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={
                            treatmentType === 'medication' ? 'e.g., Paracetamol 500mg' :
                            treatmentType === 'procedure' ? 'e.g., Blood Pressure Monitoring' :
                            treatmentType === 'lab_order' ? 'e.g., Complete Blood Count' :
                            'e.g., Chest X-Ray'
                          }
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="common" className="space-y-4">
                <div>
                  <Label>Select from Common {treatmentType.replace('_', ' ')}s</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {getCommonOptions(treatmentType).map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto p-2 text-left"
                        onClick={() => form.setValue("description", option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Medication/Procedure Specific Fields */}
            {(treatmentType === 'medication' || treatmentType === 'procedure') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {treatmentType === 'medication' ? 'Dosage' : 'Quantity/Units'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={
                            treatmentType === 'medication' ? '1 tablet' : '1 session'
                          }
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="once_daily">Once Daily</SelectItem>
                          <SelectItem value="twice_daily">Twice Daily</SelectItem>
                          <SelectItem value="three_times_daily">Three Times Daily</SelectItem>
                          <SelectItem value="four_times_daily">Four Times Daily</SelectItem>
                          <SelectItem value="every_4_hours">Every 4 Hours</SelectItem>
                          <SelectItem value="every_6_hours">Every 6 Hours</SelectItem>
                          <SelectItem value="every_8_hours">Every 8 Hours</SelectItem>
                          <SelectItem value="as_needed">As Needed</SelectItem>
                          <SelectItem value="once">Once Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 7 days" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {treatmentType === 'medication' ? 'Instructions & Precautions' :
                     treatmentType === 'procedure' ? 'Procedure Instructions' :
                     'Special Instructions'}
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={
                        treatmentType === 'medication' ? 'e.g., Take with food, avoid alcohol' :
                        treatmentType === 'procedure' ? 'e.g., Monitor for complications' :
                        treatmentType === 'lab_order' ? 'e.g., Fasting required, collect morning sample' :
                        'e.g., Patient preparation required'
                      }
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Preview */}
        {form.watch("description") && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Treatment Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getTypeIcon(treatmentType)}
                    {treatmentType.replace('_', ' ')}
                  </Badge>
                  <span className="font-medium">{form.watch("description")}</span>
                </div>
                {form.watch("dosage") && (
                  <div className="text-sm text-green-700">
                    <strong>Dosage:</strong> {form.watch("dosage")}
                  </div>
                )}
                {form.watch("frequency") && (
                  <div className="text-sm text-green-700">
                    <strong>Frequency:</strong> {form.watch("frequency")?.replace('_', ' ')}
                  </div>
                )}
                {form.watch("duration") && (
                  <div className="text-sm text-green-700">
                    <strong>Duration:</strong> {form.watch("duration")}
                  </div>
                )}
                {form.watch("instructions") && (
                  <div className="text-sm text-green-700">
                    <strong>Instructions:</strong> {form.watch("instructions")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Plus className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Add Treatment
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}