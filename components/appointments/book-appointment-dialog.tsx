"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Calendar, Clock, User, Stethoscope, Video, MapPin, AlertCircle,
  MessageSquare, DollarSign, CheckCircle2, Loader2, X, Search, Plus
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { mockDoctors, mockDepartments } from "@/lib/schedule-mock-data"
import { mockOPDPatients } from "@/lib/ipd-mock-data"
import { getDoctorAvailability } from "@/lib/appointments-mock-data"
import { BookAppointmentFormData, TimeSlot } from "@/lib/appointments-types"

const appointmentSchema = z.object({
  // Patient
  patientId: z.string().min(1, "Please select a patient"),
  
  // Doctor & Department
  doctorId: z.string().min(1, "Please select a doctor"),
  departmentId: z.string().min(1, "Department is required"),
  visitType: z.enum(["First Visit", "Follow-Up", "Review"], { required_error: "Visit type is required" }),
  
  // Slot & Mode
  mode: z.enum(["Offline", "Tele/Video"], { required_error: "Mode is required" }),
  appointmentDate: z.string().min(1, "Please select a date"),
  timeSlot: z.string().min(1, "Please select a time slot"),
  
  // Additional
  priority: z.boolean().default(false),
  sendSMS: z.boolean().default(true),
  sendWhatsApp: z.boolean().default(true),
  notes: z.string().optional(),
  
  // Payment
  paymentMode: z.enum(["Cash", "UPI", "Card", "Online", "Insurance"], { required_error: "Payment mode is required" }),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

interface BookAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (data: any) => void
}

export function BookAppointmentDialog({ open, onOpenChange, onSuccess }: BookAppointmentDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showQuickPatientForm, setShowQuickPatientForm] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [consultationFee, setConsultationFee] = useState(500)

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      departmentId: "",
      visitType: "First Visit",
      mode: "Offline",
      appointmentDate: "",
      timeSlot: "",
      priority: false,
      sendSMS: true,
      sendWhatsApp: true,
      notes: "",
      paymentMode: "Cash",
    },
  })

  // Load slots when doctor and date change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if ((name === "doctorId" || name === "appointmentDate") && value.doctorId && value.appointmentDate) {
        const availability = getDoctorAvailability(value.doctorId, value.appointmentDate)
        setAvailableSlots(availability.slots)
      }
      
      // Update department when doctor changes
      if (name === "doctorId" && value.doctorId) {
        const doctor = mockDoctors.find(d => d.id === value.doctorId)
        if (doctor) {
          form.setValue("departmentId", doctor.departmentId)
          setSelectedDoctor(doctor)
          // Set consultation fee based on doctor (mock: 500-1000)
          setConsultationFee(Math.floor(Math.random() * 500) + 500)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const handleSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const patient = mockOPDPatients.find(p => p.id === data.patientId)
      const doctor = mockDoctors.find(d => d.id === data.doctorId)
      
      const appointment = {
        ...data,
        patientName: patient?.name || "",
        patientUHID: patient?.uhid || "",
        patientPhone: patient?.phone || "",
        doctorName: doctor?.name || "",
        department: doctor?.departmentName || "",
        consultationFee,
      }
      
      toast({
        title: "Success!",
        description: `Appointment booked for ${patient?.name} with Dr. ${doctor?.name}`,
      })
      
      onSuccess(appointment)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const mode = form.watch("mode")
  const selectedDate = form.watch("appointmentDate")
  const selectedSlot = form.watch("timeSlot")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Calendar className="h-6 w-6 text-primary" />
            Book New Appointment
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to schedule a new appointment
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Patient Selection */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Patient *</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={(value) => {
                          field.onChange(value)
                          const patient = mockOPDPatients.find(p => p.id === value)
                          setSelectedPatient(patient)
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Search by name, phone or UHID" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockOPDPatients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name} - {patient.uhid} - {patient.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {selectedPatient && (
                  <div className="p-3 bg-blue-50 rounded-lg space-y-1">
                    <p className="text-sm font-medium">{selectedPatient.name}</p>
                    <p className="text-xs text-muted-foreground">UHID: {selectedPatient.uhid}</p>
                    <p className="text-xs text-muted-foreground">Phone: {selectedPatient.phone}</p>
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickPatientForm(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Patient (Quick)
                </Button>
              </CardContent>
            </Card>

            {/* Doctor & Speciality */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Doctor & Speciality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Doctor *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockDoctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                Dr. {doctor.name} - {doctor.specialization}
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
                    name="departmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department *</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="bg-muted" />
                        </FormControl>
                        <FormDescription>Auto-filled from doctor</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="visitType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visit Type *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visit type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="First Visit">First Visit</SelectItem>
                            <SelectItem value="Follow-Up">Follow-Up</SelectItem>
                            <SelectItem value="Review">Review</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Slot Selection */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Slot Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consultation Mode *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Offline" id="offline" />
                            <Label htmlFor="offline" className="flex items-center gap-2 cursor-pointer">
                              <MapPin className="h-4 w-4" />
                              In-Person
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Tele/Video" id="tele" />
                            <Label htmlFor="tele" className="flex items-center gap-2 cursor-pointer">
                              <Video className="h-4 w-4" />
                              Teleconsultation
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="appointmentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointment Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} min={new Date().toISOString().split('T')[0]} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {availableSlots.length > 0 && (
                  <FormField
                    control={form.control}
                    name="timeSlot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Time Slots *</FormLabel>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot.id}
                              type="button"
                              variant={field.value === slot.time ? "default" : "outline"}
                              size="sm"
                              disabled={!slot.available}
                              onClick={() => field.onChange(slot.time)}
                              className="relative"
                            >
                              {slot.time}
                              {!slot.available && (
                                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                                  X
                                </Badge>
                              )}
                            </Button>
                          ))}
                        </div>
                        <FormDescription>
                          {availableSlots.filter(s => s.available).length} slots available
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Additional Flags */}
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Additional Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Emergency / High Priority</FormLabel>
                          <FormDescription className="text-xs">
                            Mark as urgent appointment
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sendSMS"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Send SMS Confirmation</FormLabel>
                          <FormDescription className="text-xs">
                            Send appointment details via SMS
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sendWhatsApp"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Send WhatsApp Confirmation</FormLabel>
                          <FormDescription className="text-xs">
                            Send appointment details via WhatsApp
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor Notes (Pre-Visit)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any special instructions or notes for the doctor" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Payment */}
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Consultation Fee
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Consultation Fee</p>
                  <p className="text-2xl font-bold text-emerald-600">₹{consultationFee}</p>
                </div>

                <FormField
                  control={form.control}
                  name="paymentMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Mode *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="Card">Card</SelectItem>
                          <SelectItem value="Online">Online</SelectItem>
                          <SelectItem value="Insurance">Insurance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Book Appointment
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
