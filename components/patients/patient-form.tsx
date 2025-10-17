"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Save,
  X,
  User,
  FileText,
  Phone,
  Users,
  Building,
  Stethoscope,
  Calendar,
  AlertTriangle,
  Heart,
  Settings,
} from "lucide-react"
import { PatientService, type Patient, type CreatePatientDto, type UpdatePatientDto } from "@/lib/patient-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

interface PatientFormProps {
  patient?: Patient
  onSuccess: (patient: Patient) => void
  onCancel: () => void
}

export function PatientForm({ patient, onSuccess, onCancel }: PatientFormProps) {
  const isEditMode = !!patient
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("registration")
  const { toast } = useToast()
  const { user } = useAuth()
  const patientService = PatientService.getInstance()

  // Get current user from auth context
  const currentUser =
    user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || "System Admin"

  const [formData, setFormData] = useState({
    // Basic Patient Information
    regNo: (patient as any)?.regNo || "",
    firstName: patient?.firstName || "",
    lastName: patient?.lastName || "",
    patientAccount: (patient as any)?.patientAccount || "",
    dateOfBirth: patient?.dateOfBirth
      ? typeof patient.dateOfBirth === "string"
        ? patient.dateOfBirth.split("T")[0]
        : new Date(patient.dateOfBirth).toISOString().split("T")[0]
      : "",
    age: (patient as any)?.age || "",
    gender: patient?.gender || "MALE",
    phone: patient?.phone || "",
    email: patient?.email || "",
    password: "",
    confirmPassword: "",
    address: patient?.address || "",
    city: patient?.city || "",
    state: patient?.state || "",
    zipCode: patient?.zipCode || "",
    country: (patient as any)?.country || "",
    religion: (patient as any)?.religion || "",

    // Guardian Information
    guardianName: (patient as any)?.guardianName || "",
    guardianRelation: (patient as any)?.guardianRelation || "",
    guardianAddress: (patient as any)?.guardianAddress || "",
    sameAsPatientAddress: (patient as any)?.sameAsPatientAddress || false,

    // Corporate/Insurance Information
    isCorporatePatient: (patient as any)?.isCorporatePatient || false,
    insuranceCompany: (patient as any)?.insuranceCompany || "",
    insuranceAddress: (patient as any)?.insuranceAddress || "",

    // Billing Information
    billNo: (patient as any)?.billNo || "",
    estimatePackageAmount: (patient as any)?.estimatePackageAmount || "",
    estimateDoctorAmount: (patient as any)?.estimateDoctorAmount || "",
    depositAmount: (patient as any)?.depositAmount || "0.00",

    // Medical Staff Information
    doctorInCharge1: (patient as any)?.doctorInCharge1 || "",
    doctorInCharge2: (patient as any)?.doctorInCharge2 || "",
    doctorInCharge3: (patient as any)?.doctorInCharge3 || "",
    case: (patient as any)?.case || "",

    // Admission Information
    admissionDate: (patient as any)?.admissionDate
      ? typeof (patient as any).admissionDate === "string"
        ? (patient as any).admissionDate.split("T")[0]
        : new Date((patient as any).admissionDate).toISOString().split("T")[0]
      : "",
    dischargeDate: (patient as any)?.dischargeDate
      ? typeof (patient as any).dischargeDate === "string"
        ? (patient as any).dischargeDate.split("T")[0]
        : new Date((patient as any).dischargeDate).toISOString().split("T")[0]
      : "",
    transferDate: (patient as any)?.transferDate
      ? typeof (patient as any).transferDate === "string"
        ? (patient as any).transferDate.split("T")[0]
        : new Date((patient as any).transferDate).toISOString().split("T")[0]
      : "",
    discOnRiskBond: (patient as any)?.discOnRiskBond || false,
    expiredDate: (patient as any)?.expiredDate
      ? typeof (patient as any).expiredDate === "string"
        ? (patient as any).expiredDate.split("T")[0]
        : new Date((patient as any).expiredDate).toISOString().split("T")[0]
      : "",
    caseHistory: (patient as any)?.caseHistory || "",
    isBPL: (patient as any)?.isBPL || false,

    // Emergency Contact
    emergencyContactName: patient?.emergencyContactName || "",
    emergencyContactPhone: patient?.emergencyContactPhone || "",
    emergencyContactRelationship: patient?.emergencyContactRelationship || "",

    // Medical Information
    bloodGroup: patient?.bloodGroup || "",
    allergies: patient?.allergies || "",
    chronicConditions: patient?.chronicConditions || "",
    currentMedications: patient?.currentMedications || "",

    // System Information - Auto-populate with current user
    createdBy: (patient as any)?.createdBy || (isEditMode ? "" : currentUser),
    modifiedBy: currentUser,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.regNo.trim()) {
      setError("Registration Number is required")
      return
    }

    if (!formData.firstName.trim()) {
      setError("First Name is required")
      return
    }

    if (!formData.lastName.trim()) {
      setError("Last Name is required")
      return
    }

    if (!formData.guardianName.trim()) {
      setError("Guardian Name is required")
      return
    }

    // Validate password for new patients
    if (!isEditMode) {
      if (!formData.password || formData.password.length < 6) {
        setError("Password must be at least 6 characters long")
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return
      }
    }

    setIsLoading(true)

    try {
      let result: Patient

      if (isEditMode && patient) {
        const updateData: UpdatePatientDto = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender as "MALE" | "FEMALE" | "OTHER",
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          emergencyContactRelationship: formData.emergencyContactRelationship,
          bloodGroup: formData.bloodGroup || undefined,
          allergies: formData.allergies || undefined,
          chronicConditions: formData.chronicConditions || undefined,
          currentMedications: formData.currentMedications || undefined,
        }
        result = await patientService.updatePatient(patient.id, updateData)
        toast({
          title: "Patient updated",
          description: `${result.firstName} ${result.lastName}'s information has been updated.`,
        })
      } else {
        const createData: CreatePatientDto = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender as "MALE" | "FEMALE" | "OTHER",
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          emergencyContactRelationship: formData.emergencyContactRelationship,
          bloodGroup: formData.bloodGroup || undefined,
          allergies: formData.allergies || undefined,
          chronicConditions: formData.chronicConditions || undefined,
          currentMedications: formData.currentMedications || undefined,
        }
        result = await patientService.createPatient(createData)
        toast({
          title: "Patient created",
          description: `${result.firstName} ${result.lastName} has been added to the system.`,
        })
      }

      onSuccess(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === "boolean" ? value : value,
    }))
  }

  const tabs = ["registration", "personal", "medical", "system"]

  const getTabNavigation = () => {
    const currentIndex = tabs.indexOf(activeTab)
    const isFirst = currentIndex === 0
    const isLast = currentIndex === tabs.length - 1

    return (
      <>
        {!isFirst && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setActiveTab(tabs[currentIndex - 1])}
            disabled={isLoading}
          >
            Previous
          </Button>
        )}
        {!isLast && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setActiveTab(tabs[currentIndex + 1])}
            disabled={isLoading}
          >
            Next
          </Button>
        )}
      </>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit Patient Admission" : "Patient Admission Form"}</CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update patient admission information"
            : "Complete patient admission details including personal, medical, and billing information"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Progress Indicator */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>
                  Step {tabs.indexOf(activeTab) + 1} of {tabs.length}
                </span>
                <span>{Math.round(((tabs.indexOf(activeTab) + 1) / tabs.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 relative overflow-hidden">
                <div
                  className={`bg-primary h-2 rounded-full transition-all duration-300 ease-in-out absolute top-0 left-0 ${
                    tabs.indexOf(activeTab) + 1 === 1
                      ? "w-[25%]"
                      : tabs.indexOf(activeTab) + 1 === 2
                        ? "w-[50%]"
                        : tabs.indexOf(activeTab) + 1 === 3
                          ? "w-[75%]"
                          : "w-full"
                  }`}
                ></div>
              </div>
            </div>

            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="registration" className="text-xs flex flex-col sm:flex-row items-center gap-1 p-2">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Registration & Insurance</span>
                <span className="sm:hidden">Reg</span>
              </TabsTrigger>
              <TabsTrigger value="personal" className="text-xs flex flex-col sm:flex-row items-center gap-1 p-2">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Personal Info</span>
                <span className="sm:hidden">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="medical" className="text-xs flex flex-col sm:flex-row items-center gap-1 p-2">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Medical & Admission</span>
                <span className="sm:hidden">Medical</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="text-xs flex flex-col sm:flex-row items-center gap-1 p-2">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">System Info</span>
                <span className="sm:hidden">System</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="registration" className="space-y-6">
              {/* Registration Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Registration Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="regNo">Reg No. *</Label>
                    <Input
                      id="regNo"
                      placeholder="REG001"
                      value={formData.regNo}
                      onChange={e => handleChange("regNo", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientAccount">Patient A/C</Label>
                    <Input
                      id="patientAccount"
                      placeholder="Patient Account Number"
                      value={formData.patientAccount}
                      onChange={e => handleChange("patientAccount", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billNo">Bill No.</Label>
                    <Input
                      id="billNo"
                      placeholder="BILL001"
                      value={formData.billNo}
                      onChange={e => handleChange("billNo", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Corporate/Insurance Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Corporate/Insurance Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isCorporatePatient"
                      title="Corporate Patient"
                      checked={formData.isCorporatePatient}
                      onChange={e => handleChange("isCorporatePatient", e.target.checked)}
                      disabled={isLoading}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isCorporatePatient">Corporate Patient</Label>
                  </div>
                </div>

                {formData.isCorporatePatient && (
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <div className="space-y-2">
                      <Label htmlFor="insuranceCompany">Insurance Co.</Label>
                      <Input
                        id="insuranceCompany"
                        placeholder="Insurance company name"
                        value={formData.insuranceCompany}
                        onChange={e => handleChange("insuranceCompany", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insuranceAddress">Insurance Address</Label>
                      <Textarea
                        id="insuranceAddress"
                        placeholder="Insurance company address"
                        value={formData.insuranceAddress}
                        onChange={e => handleChange("insuranceAddress", e.target.value)}
                        disabled={isLoading}
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-md font-medium">Billing Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estimatePackageAmount">Estimate Package Amount (₹)</Label>
                      <Input
                        id="estimatePackageAmount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.estimatePackageAmount}
                        onChange={e => handleChange("estimatePackageAmount", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estimateDoctorAmount">Estimate Doctor Amount (₹)</Label>
                      <Input
                        id="estimateDoctorAmount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.estimateDoctorAmount}
                        onChange={e => handleChange("estimateDoctorAmount", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="depositAmount">Deposit Amount (₹)</Label>
                      <Input
                        id="depositAmount"
                        type="number"
                        step="0.01"
                        value={formData.depositAmount}
                        onChange={e => handleChange("depositAmount", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="personal" className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Patient Name (First) *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={e => handleChange("firstName", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Patient Name (Last) *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={e => handleChange("lastName", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={e => handleChange("dateOfBirth", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Patient Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={e => handleChange("age", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Sex *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={value => handleChange("gender", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="religion">Religion</Label>
                    <Input
                      id="religion"
                      placeholder="e.g., Hindu, Christian, Muslim"
                      value={formData.religion}
                      onChange={e => handleChange("religion", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Input
                      id="bloodGroup"
                      placeholder="e.g., A+, O-, B+"
                      value={formData.bloodGroup}
                      onChange={e => handleChange("bloodGroup", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone No. *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={e => handleChange("phone", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="patient@email.com"
                      value={formData.email}
                      onChange={e => handleChange("email", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {!isEditMode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={formData.password}
                        onChange={e => handleChange("password", e.target.value)}
                        required={!isEditMode}
                        disabled={isLoading}
                        minLength={6}
                      />
                      <p className="text-xs text-muted-foreground">Patient will use this to log in to their portal</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={e => handleChange("confirmPassword", e.target.value)}
                        required={!isEditMode}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Complete address"
                    value={formData.address}
                    onChange={e => handleChange("address", e.target.value)}
                    required
                    disabled={isLoading}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Springfield"
                      value={formData.city}
                      onChange={e => handleChange("city", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="IL"
                      value={formData.state}
                      onChange={e => handleChange("state", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      placeholder="USA"
                      value={formData.country}
                      onChange={e => handleChange("country", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="62701"
                    value={formData.zipCode}
                    onChange={e => handleChange("zipCode", e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isBPL"
                      title="Below Poverty Line"
                      checked={formData.isBPL}
                      onChange={e => handleChange("isBPL", e.target.checked)}
                      disabled={isLoading}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isBPL">B.P.L. (Below Poverty Line)</Label>
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">Guardian Name *</Label>
                    <Input
                      id="guardianName"
                      placeholder="Guardian's full name"
                      value={formData.guardianName}
                      onChange={e => handleChange("guardianName", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guardianRelation">Relation *</Label>
                    <Input
                      id="guardianRelation"
                      placeholder="Father, Mother, Spouse, etc."
                      value={formData.guardianRelation}
                      onChange={e => handleChange("guardianRelation", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="sameAsPatientAddress"
                      title="Same as patient address"
                      checked={formData.sameAsPatientAddress}
                      onChange={e => {
                        const isChecked = e.target.checked
                        handleChange("sameAsPatientAddress", isChecked)
                        if (isChecked) {
                          handleChange("guardianAddress", "SAME AS ABOVE")
                        } else {
                          handleChange("guardianAddress", "")
                        }
                      }}
                      disabled={isLoading}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="sameAsPatientAddress">Same as patient address</Label>
                  </div>
                  <Label htmlFor="guardianAddress">Guardian Address *</Label>
                  <Textarea
                    id="guardianAddress"
                    placeholder={formData.sameAsPatientAddress ? "SAME AS ABOVE" : "Guardian's complete address"}
                    value={formData.guardianAddress}
                    onChange={e => handleChange("guardianAddress", e.target.value)}
                    required
                    disabled={isLoading || formData.sameAsPatientAddress}
                    rows={2}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      placeholder="Jane Doe"
                      value={formData.emergencyContactName}
                      onChange={e => handleChange("emergencyContactName", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.emergencyContactPhone}
                      onChange={e => handleChange("emergencyContactPhone", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                    <Input
                      id="emergencyContactRelationship"
                      placeholder="Spouse, Parent, etc."
                      value={formData.emergencyContactRelationship}
                      onChange={e => handleChange("emergencyContactRelationship", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-6">
              {/* Medical Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Medical Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      placeholder="List any allergies (comma-separated)"
                      value={formData.allergies}
                      onChange={e => handleChange("allergies", e.target.value)}
                      disabled={isLoading}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                    <Textarea
                      id="chronicConditions"
                      placeholder="List any chronic conditions"
                      value={formData.chronicConditions}
                      onChange={e => handleChange("chronicConditions", e.target.value)}
                      disabled={isLoading}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentMedications">Current Medications</Label>
                    <Textarea
                      id="currentMedications"
                      placeholder="List current medications (comma-separated)"
                      value={formData.currentMedications}
                      onChange={e => handleChange("currentMedications", e.target.value)}
                      disabled={isLoading}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Medical Staff Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Medical Staff Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctorInCharge1">Doctor In Charge (1)</Label>
                    <Input
                      id="doctorInCharge1"
                      placeholder="Dr. John Smith"
                      value={formData.doctorInCharge1}
                      onChange={e => handleChange("doctorInCharge1", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctorInCharge2">Doctor In Charge (2)</Label>
                    <Input
                      id="doctorInCharge2"
                      placeholder="Dr. Jane Doe"
                      value={formData.doctorInCharge2}
                      onChange={e => handleChange("doctorInCharge2", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctorInCharge3">Doctor In Charge (3)</Label>
                    <Input
                      id="doctorInCharge3"
                      placeholder="Dr. Bob Johnson"
                      value={formData.doctorInCharge3}
                      onChange={e => handleChange("doctorInCharge3", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="case">Case</Label>
                  <Textarea
                    id="case"
                    placeholder="Brief description of the case"
                    value={formData.case}
                    onChange={e => handleChange("case", e.target.value)}
                    disabled={isLoading}
                    rows={2}
                  />
                </div>
              </div>

              {/* Admission Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Admission Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admissionDate">Admission Date</Label>
                    <Input
                      id="admissionDate"
                      type="date"
                      value={formData.admissionDate}
                      onChange={e => handleChange("admissionDate", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dischargeDate">Discharge Date</Label>
                    <Input
                      id="dischargeDate"
                      type="date"
                      value={formData.dischargeDate}
                      onChange={e => handleChange("dischargeDate", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transferDate">Transfer Date</Label>
                    <Input
                      id="transferDate"
                      type="date"
                      value={formData.transferDate}
                      onChange={e => handleChange("transferDate", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiredDate">Expired Date</Label>
                    <Input
                      id="expiredDate"
                      type="date"
                      value={formData.expiredDate}
                      onChange={e => handleChange("expiredDate", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="discOnRiskBond"
                      title="Discharge on Risk Bond"
                      checked={formData.discOnRiskBond}
                      onChange={e => handleChange("discOnRiskBond", e.target.checked)}
                      disabled={isLoading}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="discOnRiskBond">Disc. on Risk Bond</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caseHistory">Case History</Label>
                  <Textarea
                    id="caseHistory"
                    placeholder="Detailed case history"
                    value={formData.caseHistory}
                    onChange={e => handleChange("caseHistory", e.target.value)}
                    disabled={isLoading}
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Created By</Label>
                    <Input value={formData.createdBy} disabled className="bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <Label>Modified By</Label>
                    <Input value={formData.modifiedBy} disabled className="bg-muted" />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Date and Time: {new Date().toLocaleString()}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Tab Navigation and Form Actions */}
          <div className="flex justify-between items-center gap-4 pt-6 border-t">
            <div className="flex gap-2">{getTabNavigation()}</div>
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditMode ? "Updating..." : "Processing Admission..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditMode ? "Update Admission" : "Complete Admission"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
