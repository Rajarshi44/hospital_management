"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FileText, Download, Save, Plus, X, Calendar, DollarSign, Pill, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Admission } from "@/lib/ipd-types"

const dischargeSchema = z.object({
  finalDiagnosis: z.string().min(10, "Final diagnosis must be at least 10 characters"),
  treatmentSummary: z.string().min(20, "Treatment summary must be at least 20 characters"),
  dischargeMedications: z.array(
    z.object({
      name: z.string().min(1, "Medication name is required"),
      dosage: z.string().min(1, "Dosage is required"),
      frequency: z.string().min(1, "Frequency is required"),
      duration: z.string().min(1, "Duration is required"),
      instructions: z.string().optional(),
    })
  ),
  followUpInstructions: z.string().min(10, "Follow-up instructions must be at least 10 characters"),
  followUpDate: z.string().optional(),
  attachedDocuments: z.array(z.string()).optional(),
})

interface DischargeFormProps {
  admission: Admission
  estimatedCharges: {
    days: number
    bedCharges: number
    medicalCharges: number
    totalCharges: number
  }
}

export function DischargeForm({ admission, estimatedCharges }: DischargeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("diagnosis")

  const form = useForm<z.infer<typeof dischargeSchema>>({
    resolver: zodResolver(dischargeSchema),
    defaultValues: {
      finalDiagnosis: admission.tentativeDiagnosis || "",
      treatmentSummary: "",
      dischargeMedications: [],
      followUpInstructions: "",
      followUpDate: "",
      attachedDocuments: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "dischargeMedications",
  })

  const onSubmit = async (data: z.infer<typeof dischargeSchema>) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      const dischargeData = {
        admissionId: admission.admissionId,
        dischargeDate: new Date().toISOString().split("T")[0],
        dischargeTime: new Date().toTimeString().split(" ")[0].substring(0, 5),
        ...data,
        billingAmount: estimatedCharges.totalCharges,
        dischargedBy: "Current User", // This would come from auth context
        approvedBy: "Department Head", // This would be set based on approval workflow
        createdAt: new Date().toISOString(),
      }

      console.log("Discharge completed:", dischargeData)
      alert("Patient discharged successfully!")

      // Here you would typically:
      // 1. Update the admission status
      // 2. Free up the bed
      // 3. Generate PDF discharge summary
      // 4. Send notifications
    } catch (error) {
      console.error("Discharge failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const generatePDF = () => {
    // This would integrate with a PDF generation library
    alert("PDF discharge summary would be generated here")
  }

  const addMedication = () => {
    append({
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    })
  }

  const commonMedications = [
    { name: "Paracetamol 500mg", dosage: "1 tablet", frequency: "Twice daily", duration: "5 days" },
    { name: "Amoxicillin 250mg", dosage: "1 capsule", frequency: "Three times daily", duration: "7 days" },
    { name: "Ibuprofen 400mg", dosage: "1 tablet", frequency: "As needed", duration: "3 days" },
    { name: "Omeprazole 20mg", dosage: "1 capsule", frequency: "Once daily", duration: "14 days" },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Patient Summary */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
              <User className="h-5 w-5" />
              Discharge Summary for {admission.patientName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-blue-800">UHID</Label>
                <div className="text-blue-700">{admission.uhid}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-blue-800">Admission ID</Label>
                <div className="text-blue-700">{admission.admissionId}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-blue-800">Admission Date</Label>
                <div className="text-blue-700">{new Date(admission.admissionDate).toLocaleDateString()}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-blue-800">Length of Stay</Label>
                <div className="text-blue-700">{estimatedCharges.days} days</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-blue-800">Ward & Bed</Label>
                <div className="text-blue-700">
                  {admission.wardName} - Bed {admission.bedNumber}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-blue-800">Consulting Doctor</Label>
                <div className="text-blue-700">Dr. {admission.consultingDoctorName}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="followup">Follow-up</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="diagnosis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Final Diagnosis & Treatment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="finalDiagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Diagnosis *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide the confirmed final diagnosis..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="treatmentSummary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treatment Summary *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe all treatments provided during admission, procedures performed, response to treatment..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Discharge Medications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Pill className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>No medications added yet</p>
                    <p className="text-sm">Click "Add Medication" to add discharge medications</p>
                  </div>
                )}

                {fields.map((field, index) => (
                  <Card key={field.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="font-medium">Medication {index + 1}</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`dischargeMedications.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medication Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Paracetamol 500mg" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`dischargeMedications.${index}.dosage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dosage *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 1 tablet" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`dischargeMedications.${index}.frequency`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequency *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Twice daily" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`dischargeMedications.${index}.duration`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 7 days" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`dischargeMedications.${index}.instructions`}
                        render={({ field }) => (
                          <FormItem className="mt-3">
                            <FormLabel>Special Instructions</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="e.g., Take with food, avoid alcohol"
                                className="min-h-[60px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}

                <div className="flex items-center justify-between">
                  <Button type="button" variant="outline" onClick={addMedication}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Medication
                  </Button>

                  {commonMedications.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Quick add:
                      {commonMedications.slice(0, 2).map((med, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant="link"
                          size="sm"
                          className="ml-2 h-auto p-0"
                          onClick={() => append(med)}
                        >
                          {med.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="followup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Follow-up Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="followUpInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Instructions *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide detailed follow-up instructions, lifestyle recommendations, warning signs to watch for..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followUpDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Appointment Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Billing Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Bed Charges ({estimatedCharges.days} days):</span>
                        <span>${estimatedCharges.bedCharges.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medical Charges:</span>
                        <span>${estimatedCharges.medicalCharges.toLocaleString()}</span>
                      </div>
                      {admission.initialDeposit && (
                        <div className="flex justify-between text-green-600">
                          <span>Initial Deposit:</span>
                          <span>-${admission.initialDeposit.toLocaleString()}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Amount:</span>
                        <span>${estimatedCharges.totalCharges.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="pl-4 border-l">
                      <h4 className="font-medium mb-2">Payment Status</h4>
                      <Badge variant="secondary">Pending Payment</Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        Final billing will be processed after discharge confirmation.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center space-x-2">
            <Button type="button" variant="outline" onClick={generatePDF}>
              <Download className="mr-2 h-4 w-4" />
              Preview PDF
            </Button>
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
          </div>

          <Button type="submit" disabled={isSubmitting} className="min-w-[200px]">
            {isSubmitting ? (
              <>
                <FileText className="mr-2 h-4 w-4 animate-spin" />
                Processing Discharge...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Confirm Discharge
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
