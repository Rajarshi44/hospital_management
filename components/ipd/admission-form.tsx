"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarDays, Clock, Stethoscope, Bed, User, DollarSign, Save, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { mockWards, mockBeds, getAvailableBeds } from "@/lib/ipd-mock-data"
import { mockDoctors, mockDepartments } from "@/lib/schedule-mock-data"
import { Patient, AdmissionFormData } from "@/lib/ipd-types"

const admissionSchema = z.object({
  wardId: z.string().min(1, "Please select a ward"),
  bedId: z.string().min(1, "Please select a bed"),
  consultingDoctorId: z.string().min(1, "Please select a consulting doctor"),
  departmentId: z.string().min(1, "Please select a department"),
  admissionDate: z.string().min(1, "Please select admission date"),
  admissionTime: z.string().min(1, "Please select admission time"),
  reasonForAdmission: z.string().min(10, "Please provide reason for admission (minimum 10 characters)"),
  tentativeDiagnosis: z.string().min(5, "Please provide tentative diagnosis"),
  initialDeposit: z.number().min(0, "Deposit must be positive").optional(),
  attendantName: z.string().min(1, "Attendant name is required"),
  attendantRelation: z.string().min(1, "Attendant relation is required"),
  attendantPhone: z.string().min(10, "Valid phone number is required"),
  attendantAddress: z.string().min(10, "Attendant address is required")
})

interface AdmissionFormProps {
  patient: Patient
  isNewPatient: boolean
}

export function AdmissionForm({ patient, isNewPatient }: AdmissionFormProps) {
  const [selectedWard, setSelectedWard] = useState("")
  const [availableBeds, setAvailableBeds] = useState(getAvailableBeds())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof admissionSchema>>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      wardId: "",
      bedId: "",
      consultingDoctorId: "",
      departmentId: "",
      admissionDate: new Date().toISOString().split('T')[0],
      admissionTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
      reasonForAdmission: "",
      tentativeDiagnosis: "",
      initialDeposit: 0,
      attendantName: patient.emergencyContact?.name || "",
      attendantRelation: patient.emergencyContact?.relation || "",
      attendantPhone: patient.emergencyContact?.phone || "",
      attendantAddress: patient.address || ""
    }
  })

  const handleWardChange = (wardId: string) => {
    setSelectedWard(wardId)
    setAvailableBeds(getAvailableBeds(wardId))
    form.setValue("bedId", "") // Reset bed selection
  }

  const onSubmit = async (data: z.infer<typeof admissionSchema>) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const admissionId = `ADM${Date.now().toString().slice(-6)}`
      
      console.log("Admission created:", {
        admissionId,
        patientId: patient.id,
        patientName: patient.name,
        ...data
      })
      
      // Show success message or redirect
      alert(`Admission successful! Admission ID: ${admissionId}`)
      form.reset()
    } catch (error) {
      console.error("Admission failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedWardData = mockWards.find(w => w.id === selectedWard)
  const selectedBed = mockBeds.find(b => b.id === form.watch("bedId"))

  return (
    <div className="space-y-6">
      {/* Patient Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Patient Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-blue-800">Name & UHID</Label>
              <div className="text-blue-700">
                {patient.name} (UHID: {patient.uhid})
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-blue-800">Age & Gender</Label>
              <div className="text-blue-700">
                {patient.age} years, {patient.gender}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-blue-800">Blood Group</Label>
              <div className="text-blue-700">
                {patient.bloodGroup || 'Not specified'}
              </div>
            </div>
          </div>
          {patient.allergies && patient.allergies.length > 0 && (
            <Alert className="mt-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Allergies:</span> {patient.allergies.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Department & Doctor Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Medical Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockDepartments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
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
                  name="consultingDoctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consulting Doctor *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select consulting doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockDoctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              <div className="flex flex-col items-start">
                                <span>{doctor.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {doctor.specialization} • {doctor.departmentName}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ward & Bed Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Ward & Bed Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="wardId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ward *</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value)
                        handleWardChange(value)
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ward" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockWards.map((ward) => (
                            <SelectItem key={ward.id} value={ward.id}>
                              <div className="flex flex-col items-start">
                                <span>{ward.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {ward.totalBeds - ward.occupiedBeds} available • ${ward.chargesPerDay}/day
                                </span>
                              </div>
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
                  name="bedId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bed *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedWard}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedWard ? "Select bed" : "Select ward first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableBeds.filter(bed => bed.wardId === selectedWard).map((bed) => (
                            <SelectItem key={bed.id} value={bed.id}>
                              <div className="flex flex-col items-start">
                                <span>Bed {bed.bedNumber}</span>
                                <span className="text-xs text-muted-foreground">
                                  ${bed.chargesPerDay}/day • {bed.amenities.join(', ')}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {selectedWardData && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Badge variant="outline">{selectedWardData.type}</Badge>
                  <span className="text-sm">
                    Occupancy: {selectedWardData.occupiedBeds}/{selectedWardData.totalBeds} beds
                  </span>
                  <Badge variant="secondary">
                    ${selectedWardData.chargesPerDay}/day
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admission Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Admission Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="admissionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admission Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="admissionTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admission Time *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reasonForAdmission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Admission *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the reason for admission..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tentativeDiagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tentative Diagnosis *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Initial diagnosis or suspected condition..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initialDeposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Deposit (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Attendant Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Attendant/Guardian Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="attendantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attendant Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name of attendant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="attendantRelation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relation to Patient *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="relative">Other Relative</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="guardian">Legal Guardian</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="attendantPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attendant Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="+1-555-0123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attendantAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attendant Address *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Complete address of attendant..."
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
              {isSubmitting ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Confirm Admission
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}