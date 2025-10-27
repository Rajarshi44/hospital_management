"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Save,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { PatientSearchSelect, DoctorTimeSlotPicker, PrescriptionBuilder, VitalsCalculator } from "@/components/opd";
import { opdService } from "@/lib/opd-service";
import { generateVisitId } from "@/lib/opd-mock-data";
import type { OPDVisitForm as OPDVisitFormType, Gender, BloodGroup, IdProofType, VisitType, ReferralSource, AppointmentMode, VisitPriority, VisitStatus, PaymentMode, PaymentStatus, InvestigationUrgency, Department } from "@/lib/opd-types";
import type { Patient } from "@/lib/patient-service";

// Zod validation schema
const opdVisitSchema = z.object({
  registration: z.object({
    patientId: z.string().min(1, "Patient ID is required"),
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().max(100).optional(),
    age: z.number().min(0).max(150),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    phone: z.string().regex(/^[0-9]{10,15}$/, "Phone must be 10-15 digits"),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().max(1000).optional(),
    guardianName: z.string().optional(),
    guardianRelation: z.string().optional(),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
    knownAllergies: z.string().max(1000).optional(),
    patientType: z.enum(["NEW", "RETURNING"]),
    occupation: z.string().optional(),
    idProofType: z.enum(["Aadhaar", "PAN", "Passport", "DriverLicense", "Other"]).optional(),
    idProofNumber: z.string().max(50).optional(),
  }),
  visit: z.object({
    visitId: z.string(),
    visitDate: z.string(),
    department: z.string(),
    consultingDoctor: z.string().min(1, "Consulting doctor is required"),
    doctorSpecialization: z.string().optional(),
    visitType: z.enum(["OPD", "EMERGENCY", "REVIEW"]),
    referralSource: z.enum(["Self", "Internal Doctor", "External Doctor", "Hospital", "Organization", "Other"]).optional(),
    appointmentMode: z.enum(["Walk-in", "Online", "Phone"]),
    tokenNumber: z.string().optional(),
    appointmentSlot: z.string().optional(),
    visitPriority: z.enum(["Normal", "Urgent", "Emergency"]),
    visitStatus: z.enum(["Pending", "In-Progress", "Completed", "Cancelled"]),
    followUpSuggestedDays: z.number().min(0).max(365).optional(),
  }),
  vitals: z.object({
    heightCm: z.number().min(20).max(300).optional(),
    weightKg: z.number().min(0.5).max(500).optional(),
    bmi: z.number().min(0).max(200).optional(),
    temperature: z.number().min(30).max(45),
    bloodPressure: z.string().regex(/^[0-9]{2,3}\/[0-9]{2,3}$/, "Invalid BP format (e.g., 120/80)"),
    pulseRate: z.number().min(30).max(220),
    respiratoryRate: z.number().min(6).max(60).optional(),
    spo2: z.number().min(50).max(100),
    weightNote: z.string().optional(),
  }),
  clinical: z.object({
    chiefComplaint: z.string().min(1, "Chief complaint is required").max(200),
    durationOfSymptoms: z.string().optional(),
    historyOfPresentIllness: z.string().min(1, "History of present illness is required").max(2000),
    pastMedicalHistory: z.string().max(2000).optional(),
    familyHistory: z.string().optional(),
    personalHistory: z.string().optional(),
    generalExamination: z.string().optional(),
    systemicExamination: z.string().optional(),
    allergiesDetailed: z.string().optional(),
  }),
  diagnosis: z.object({
    provisionalDiagnosis: z.string().max(1000).optional(),
    finalDiagnosis: z.string().max(1000).optional(),
    icd10Codes: z.array(z.string().max(20)).optional(),
  }),
  treatment: z.object({
    prescriptionList: z.array(
      z.object({
        drugName: z.string().min(1, "Drug name is required"),
        strength: z.string().min(1, "Strength is required"),
        route: z.enum(["Oral", "IV", "IM", "Subcutaneous", "Topical", "Inhalation", "Other"]),
        frequency: z.string().min(1, "Frequency is required"),
        dose: z.string().min(1, "Dose is required"),
        duration: z.string().min(1, "Duration is required"),
        instructions: z.string().max(500).optional(),
        notes: z.string().optional(),
        prescribingDoctor: z.string().optional(),
      })
    ).min(1, "At least one prescription is required"),
    proceduresDone: z.array(z.string()).optional(),
    treatmentNotes: z.string().optional(),
  }),
  investigations: z.object({
    recommendedLabTests: z.array(z.string()).optional(),
    radiologyTests: z.array(z.string()).optional(),
    investigationUrgency: z.enum(["Routine", "Urgent", "STAT"]).optional(),
  }).optional(),
  billing: z.object({
    consultationFee: z.number().min(0).multipleOf(0.01),
    investigationEstimate: z.number().min(0).multipleOf(0.01).optional(),
    procedureCharges: z.number().min(0).multipleOf(0.01).optional(),
    discountAmount: z.number().min(0).multipleOf(0.01).optional(),
    totalPayable: z.number().min(0).multipleOf(0.01),
    paymentMode: z.enum(["Cash", "Card", "UPI", "Insurance", "TPA", "Other"]).optional(),
    paymentStatus: z.enum(["Paid", "Pending", "Refunded"]),
    insuranceCompany: z.string().optional(),
    insurancePolicyNumber: z.string().optional(),
    insurancePreAuthRequired: z.boolean().optional(),
  }),
  followUp: z.object({
    followUpDate: z.string().optional(),
    followUpInstructions: z.string().max(2000).optional(),
    referToIPD: z.boolean().optional(),
    referralNote: z.string().optional(),
  }).optional(),
  metadata: z.object({
    createdBy: z.string().optional(),
    modifiedBy: z.string().optional(),
    createdAt: z.string().optional(),
    modifiedAt: z.string().optional(),
  }).optional(),
}).refine(
  (data) => {
    // If payment mode is Insurance, require insurance fields
    if (data.billing.paymentMode === "Insurance") {
      return data.billing.insuranceCompany && data.billing.insurancePolicyNumber;
    }
    return true;
  },
  {
    message: "Insurance company and policy number are required when payment mode is Insurance",
    path: ["billing", "insuranceCompany"],
  }
).refine(
  (data) => {
    // If referToIPD is true, require referralNote
    if (data.followUp?.referToIPD === true) {
      return data.followUp.referralNote && data.followUp.referralNote.length >= 5;
    }
    return true;
  },
  {
    message: "Referral note is required when referring to IPD (min 5 characters)",
    path: ["followUp", "referralNote"],
  }
);

interface OPDVisitFormProps {
  onSuccess?: (visitId: string) => void;
  onCancel?: () => void;
  initialData?: Partial<OPDVisitFormType>;
}

export function OPDVisitForm({ onSuccess, onCancel, initialData }: OPDVisitFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  
  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    registration: true,
    visit: true,
    vitals: false,
    clinical: false,
    diagnosis: false,
    treatment: false,
    investigations: false,
    billing: false,
    followUp: false,
  });

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string | Date): number => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Initialize form with default values
  const form = useForm<OPDVisitFormType>({
    resolver: zodResolver(opdVisitSchema),
    defaultValues: initialData || {
      registration: {
        patientId: "",
        firstName: "",
        lastName: "",
        age: 0,
        gender: "MALE",
        phone: "",
        email: "",
        address: "",
        guardianName: "",
        guardianRelation: "",
        bloodGroup: undefined,
        knownAllergies: "",
        patientType: "NEW",
        occupation: "",
        idProofType: undefined,
        idProofNumber: "",
      },
      visit: {
        visitId: generateVisitId(),
        visitDate: new Date().toISOString(),
        department: "General Medicine",
        consultingDoctor: "",
        doctorSpecialization: "",
        visitType: "OPD",
        referralSource: "Self",
        appointmentMode: "Walk-in",
        tokenNumber: "",
        appointmentSlot: "",
        visitPriority: "Normal",
        visitStatus: "Pending",
        followUpSuggestedDays: undefined,
      },
      vitals: {
        heightCm: undefined,
        weightKg: undefined,
        bmi: undefined,
        temperature: 37.0,
        bloodPressure: "120/80",
        pulseRate: 72,
        respiratoryRate: 16,
        spo2: 98,
        weightNote: "",
      },
      clinical: {
        chiefComplaint: "",
        durationOfSymptoms: "",
        historyOfPresentIllness: "",
        pastMedicalHistory: "",
        familyHistory: "",
        personalHistory: "",
        generalExamination: "",
        systemicExamination: "",
        allergiesDetailed: "",
      },
      diagnosis: {
        provisionalDiagnosis: "",
        finalDiagnosis: "",
        icd10Codes: [],
      },
      treatment: {
        prescriptionList: [],
        proceduresDone: [],
        treatmentNotes: "",
      },
      investigations: {
        recommendedLabTests: [],
        radiologyTests: [],
        investigationUrgency: "Routine",
      },
      billing: {
        consultationFee: 0,
        investigationEstimate: 0,
        procedureCharges: 0,
        discountAmount: 0,
        totalPayable: 0,
        paymentMode: "Cash",
        paymentStatus: "Pending",
        insuranceCompany: "",
        insurancePolicyNumber: "",
        insurancePreAuthRequired: false,
      },
      followUp: {
        followUpDate: "",
        followUpInstructions: "",
        referToIPD: false,
        referralNote: "",
      },
      metadata: {
        createdBy: "",
        modifiedBy: "",
        createdAt: "",
        modifiedAt: "",
      },
    },
  });

  // Load draft on mount
  useEffect(() => {
    const userId = "current-user"; // Replace with actual user ID from auth
    if (opdService.hasDraft(userId)) {
      const draft = opdService.loadDraft(userId);
      if (draft && draft.formData) {
        const timestamp = new Date(draft.timestamp).toLocaleString();
        if (window.confirm(`Restore unsaved OPD visit from ${timestamp}?`)) {
          form.reset(draft.formData as OPDVisitFormType);
          toast({
            title: "Draft restored",
            description: "Your unsaved work has been restored.",
          });
        } else {
          opdService.clearDraft(userId);
        }
      }
    }
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const userId = "current-user"; // Replace with actual user ID from auth
    const interval = setInterval(() => {
      const formData = form.getValues();
      setAutoSaveStatus("saving");
      opdService.saveDraft(userId, formData);
      setTimeout(() => {
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      }, 500);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [form]);

  // Auto-calculate total payable
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("billing.")) {
        const { consultationFee = 0, investigationEstimate = 0, procedureCharges = 0, discountAmount = 0 } = value.billing || {};
        const total = consultationFee + investigationEstimate + procedureCharges - discountAmount;
        form.setValue("billing.totalPayable", Math.max(0, total));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handlePatientSelect = (patient: Patient | null) => {
    setSelectedPatient(patient);
    if (patient) {
      form.setValue("registration.patientId", patient.id);
      form.setValue("registration.firstName", patient.firstName);
      form.setValue("registration.lastName", patient.lastName);
      form.setValue("registration.age", calculateAge(patient.dateOfBirth));
      form.setValue("registration.gender", patient.gender);
      form.setValue("registration.phone", patient.phone);
      form.setValue("registration.email", patient.email || "");
      form.setValue("registration.address", patient.address || "");
      form.setValue("registration.bloodGroup", patient.bloodGroup as BloodGroup);
      form.setValue("registration.knownAllergies", patient.allergies || "");
      form.setValue("registration.patientType", "RETURNING");
    }
  };

  const handleCreateNewPatient = () => {
    setSelectedPatient(null);
    form.reset({
      ...form.getValues(),
      registration: {
        patientId: `UHID-${Date.now()}`,
        firstName: "",
        lastName: "",
        age: 0,
        gender: "MALE",
        phone: "",
        email: "",
        address: "",
        patientType: "NEW",
      },
    });
  };

  const onSubmit = async (data: OPDVisitFormType) => {
    setIsSubmitting(true);
    try {
      const result = await opdService.createVisit(data);
      
      // Clear draft after successful submission
      const userId = "current-user";
      opdService.clearDraft(userId);

      toast({
        title: "Success!",
        description: `OPD visit ${result.visit.visitId} created successfully.`,
      });

      if (onSuccess) {
        onSuccess(result.visit.visitId);
      }

      // Reset form for new visit
      form.reset();
      setSelectedPatient(null);
    } catch (error) {
      console.error("Error creating OPD visit:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create OPD visit",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const paymentMode = form.watch("billing.paymentMode");
  const referToIPD = form.watch("followUp.referToIPD");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header with auto-save status */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">OPD Patient Visit Form</h2>
            <p className="text-sm text-muted-foreground">
              Visit ID: {form.watch("visit.visitId")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {autoSaveStatus === "saving" && (
              <Badge variant="outline" className="gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </Badge>
            )}
            {autoSaveStatus === "saved" && (
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                Saved
              </Badge>
            )}
          </div>
        </div>

        {/* Section 1: Registration */}
        <Collapsible open={openSections.registration} onOpenChange={() => toggleSection("registration")}>
          <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                      1
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Registration</CardTitle>
                      <CardDescription>Patient identification and demographics</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!openSections.registration && (
                      <Badge variant="secondary" className="text-xs">
                        Click to expand
                      </Badge>
                    )}
                    {openSections.registration ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-6">
                <PatientSearchSelect
                  onSelectPatient={handlePatientSelect}
                  onCreateNew={handleCreateNewPatient}
                  selectedPatientId={form.watch("registration.patientId")}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="registration.firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registration.lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registration.age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Age" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registration.gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registration.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="10-15 digits" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registration.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registration.bloodGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Group</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                              <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registration.occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <Input placeholder="Occupation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registration.idProofType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Proof Type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ID proof" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["Aadhaar", "PAN", "Passport", "DriverLicense", "Other"].map((id) => (
                              <SelectItem key={id} value={id}>{id}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registration.idProofNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Proof Number</FormLabel>
                        <FormControl>
                          <Input placeholder="ID number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="registration.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Complete address" {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="registration.guardianName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guardian Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Guardian name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registration.guardianRelation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guardian Relation</FormLabel>
                        <FormControl>
                          <Input placeholder="Relation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="registration.knownAllergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Known Allergies</FormLabel>
                      <FormControl>
                        <Textarea placeholder="List any known allergies" {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 2: Visit & Doctor */}
        <Collapsible open={openSections.visit} onOpenChange={() => toggleSection("visit")}>
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 font-semibold">
                      2
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Visit & Doctor</CardTitle>
                      <CardDescription>Visit details and doctor assignment</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!openSections.visit && (
                      <Badge variant="secondary" className="text-xs">
                        Click to expand
                      </Badge>
                    )}
                    {openSections.visit ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-6">
                <DoctorTimeSlotPicker
                  selectedDepartment={form.watch("visit.department") as Department}
                  selectedDoctorId={form.watch("visit.consultingDoctor")}
                  selectedSlot={form.watch("visit.appointmentSlot")}
                  visitDate={form.watch("visit.visitDate")}
                  onDepartmentChange={(dept) => form.setValue("visit.department", dept)}
                  onDoctorChange={(doctorId, specialization) => {
                    form.setValue("visit.consultingDoctor", doctorId);
                    form.setValue("visit.doctorSpecialization", specialization);
                  }}
                  onSlotChange={(slot) => form.setValue("visit.appointmentSlot", slot)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="visit.visitType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visit Type *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="OPD">OPD</SelectItem>
                            <SelectItem value="EMERGENCY">Emergency</SelectItem>
                            <SelectItem value="REVIEW">Review</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="visit.appointmentMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointment Mode *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Walk-in">Walk-in</SelectItem>
                            <SelectItem value="Online">Online</SelectItem>
                            <SelectItem value="Phone">Phone</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="visit.visitPriority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="visit.tokenNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., T-045" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 3: Vitals */}
        <Collapsible open={openSections.vitals} onOpenChange={() => toggleSection("vitals")}>
          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-600 font-semibold">
                      3
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Vitals</CardTitle>
                      <CardDescription>Patient vital signs</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!openSections.vitals && (
                      <Badge variant="secondary" className="text-xs">Click to expand</Badge>
                    )}
                    {openSections.vitals ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-6">
                <VitalsCalculator form={form} />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 4: Clinical Findings */}
        <Collapsible open={openSections.clinical} onOpenChange={() => toggleSection("clinical")}>
          <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-600 font-semibold">
                      4
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Clinical Findings</CardTitle>
                      <CardDescription>Patient complaints and examination</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!openSections.clinical && (
                      <Badge variant="secondary" className="text-xs">Click to expand</Badge>
                    )}
                    {openSections.clinical ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clinical.chiefComplaint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chief Complaint *</FormLabel>
                        <FormControl>
                          <Input placeholder="Primary reason for visit" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clinical.durationOfSymptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration of Symptoms</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 3 days, 2 weeks" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="clinical.historyOfPresentIllness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>History of Present Illness *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detailed description of the present illness" {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clinical.pastMedicalHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Past Medical History</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Previous illnesses, surgeries, hospitalizations" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clinical.generalExamination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>General Examination</FormLabel>
                        <FormControl>
                          <Textarea placeholder="General physical examination findings" {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clinical.systemicExamination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Systemic Examination</FormLabel>
                        <FormControl>
                          <Textarea placeholder="CVS, RS, CNS, Abdomen findings" {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 5: Diagnosis */}
        <Collapsible open={openSections.diagnosis} onOpenChange={() => toggleSection("diagnosis")}>
          <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 font-semibold">
                      5
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Diagnosis</CardTitle>
                      <CardDescription>Provisional and final diagnosis</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!openSections.diagnosis && (
                      <Badge variant="secondary" className="text-xs">Click to expand</Badge>
                    )}
                    {openSections.diagnosis ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-6">
                <FormField
                  control={form.control}
                  name="diagnosis.provisionalDiagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provisional Diagnosis</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Initial diagnosis based on examination" {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diagnosis.finalDiagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Diagnosis</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Confirmed diagnosis (if available)" {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 6: Treatment & Prescription */}
        <Collapsible open={openSections.treatment} onOpenChange={() => toggleSection("treatment")}>
          <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/10 text-orange-600 font-semibold">
                      6
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Treatment & Prescription</CardTitle>
                      <CardDescription>Medications and treatment plan</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!openSections.treatment && (
                      <Badge variant="secondary" className="text-xs">Click to expand</Badge>
                    )}
                    {openSections.treatment ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-6">
                <PrescriptionBuilder form={form} />

                <FormField
                  control={form.control}
                  name="treatment.treatmentNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treatment Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional treatment instructions, advice" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 7: Investigations */}
        <Collapsible open={openSections.investigations} onOpenChange={() => toggleSection("investigations")}>
          <Card className="border-l-4 border-l-pink-500 shadow-sm hover:shadow-md transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-500/10 text-pink-600 font-semibold">
                      7
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Investigations</CardTitle>
                      <CardDescription>Lab tests and imaging orders</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!openSections.investigations && (
                      <Badge variant="secondary" className="text-xs">Click to expand</Badge>
                    )}
                    {openSections.investigations ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-6">
                <FormField
                  control={form.control}
                  name="investigations.investigationUrgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investigation Urgency</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Routine">Routine</SelectItem>
                          <SelectItem value="Urgent">Urgent</SelectItem>
                          <SelectItem value="STAT">STAT</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Lab and radiology orders will be integrated with the respective modules for processing.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 8: Billing & Payment */}
        <Collapsible open={openSections.billing} onOpenChange={() => toggleSection("billing")}>
          <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
                      8
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Billing & Payment</CardTitle>
                      <CardDescription>Consultation fees and payment details</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!openSections.billing && (
                      <Badge variant="secondary" className="text-xs">Click to expand</Badge>
                    )}
                    {openSections.billing ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="billing.consultationFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation Fee *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="billing.investigationEstimate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investigation Est.</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="billing.procedureCharges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Procedure Charges</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="billing.discountAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="billing.totalPayable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Payable (Auto-calculated)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          readOnly
                          className="bg-muted font-semibold text-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="billing.paymentMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Mode</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Card">Card</SelectItem>
                            <SelectItem value="UPI">UPI</SelectItem>
                            <SelectItem value="Insurance">Insurance</SelectItem>
                            <SelectItem value="TPA">TPA</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="billing.paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Refunded">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Conditional Insurance Fields */}
                {paymentMode === "Insurance" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-accent/10">
                    <FormField
                      control={form.control}
                      name="billing.insuranceCompany"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Insurance Company *</FormLabel>
                          <FormControl>
                            <Input placeholder="Insurance company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="billing.insurancePolicyNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Policy Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Policy number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="billing.insurancePreAuthRequired"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Pre-authorization Required</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 9: Follow Up */}
        <Collapsible open={openSections.followUp} onOpenChange={() => toggleSection("followUp")}>
          <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 font-semibold">
                      9
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Follow Up</CardTitle>
                      <CardDescription>Follow-up instructions and IPD referral</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!openSections.followUp && (
                      <Badge variant="secondary" className="text-xs">Click to expand</Badge>
                    )}
                    {openSections.followUp ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-6">
                <FormField
                  control={form.control}
                  name="followUp.followUpDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followUp.followUpInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Instructions</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Instructions for next visit" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followUp.referToIPD"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Refer to IPD (In-Patient Department)</FormLabel>
                    </FormItem>
                  )}
                />

                {/* Conditional Referral Note */}
                {referToIPD && (
                  <FormField
                    control={form.control}
                    name="followUp.referralNote"
                    render={({ field }) => (
                      <FormItem className="p-4 border rounded-lg bg-accent/10">
                        <FormLabel>Referral Note *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Reason for IPD admission (minimum 5 characters)" {...field} rows={3} />
                        </FormControl>
                        <FormDescription>Required when referring to IPD</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Submit Buttons */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t pt-4 -mx-6 px-6">
          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel} size="lg">
                Cancel
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => form.reset()} size="lg">
              Reset Form
            </Button>
            <Button type="submit" disabled={isSubmitting} size="lg" className="min-w-[160px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileCheck className="mr-2 h-5 w-5" />
                  Submit Visit
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
