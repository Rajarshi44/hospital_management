"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { type Doctor } from "@/hooks/doctor/use-doctor"
import { format } from "date-fns"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Award,
  Stethoscope,
  Building,
  User,
  Heart
} from "lucide-react"

interface DoctorDetailsModalProps {
  doctor: Doctor | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DoctorDetailsModal({ doctor, open, onOpenChange }: DoctorDetailsModalProps) {
  if (!doctor) return null

  const parseWorkingHours = (workingHours?: string) => {
    if (!workingHours) return null
    try {
      return JSON.parse(workingHours)
    } catch {
      return null
    }
  }

  const workingHoursData = parseWorkingHours(doctor.workingHours)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={doctor.avatar || ""} alt={`${doctor.firstName} ${doctor.lastName}`} />
              <AvatarFallback>
                {doctor.firstName[0]}
                {doctor.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-semibold">
                Dr. {doctor.firstName} {doctor.lastName}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Badge variant={doctor.isActive ? "default" : "secondary"}>
                  {doctor.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">ID: {doctor.doctorId}</Badge>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete profile and professional information
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{doctor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Phone:</span>
                    <span>{doctor.phone}</span>
                  </div>
                  {doctor.gender && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Gender:</span>
                      <span>{doctor.gender}</span>
                    </div>
                  )}
                  {doctor.dateOfBirth && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Date of Birth:</span>
                      <span>{format(new Date(doctor.dateOfBirth), "PPP")}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {doctor.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="font-medium">Address:</span>
                        <div className="text-muted-foreground">
                          {doctor.address}
                          {doctor.city && `, ${doctor.city}`}
                          {doctor.state && `, ${doctor.state}`}
                          {doctor.zipCode && ` ${doctor.zipCode}`}
                        </div>
                      </div>
                    </div>
                  )}
                  {doctor.bloodGroup && (
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Blood Group:</span>
                      <span>{doctor.bloodGroup}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              {doctor.emergencyContactName && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Emergency Contact</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {doctor.emergencyContactName}
                      </div>
                      {doctor.emergencyContactPhone && (
                        <div>
                          <span className="font-medium">Phone:</span> {doctor.emergencyContactPhone}
                        </div>
                      )}
                      {doctor.emergencyContactRelationship && (
                        <div className="col-span-2">
                          <span className="font-medium">Relationship:</span> {doctor.emergencyContactRelationship}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Specialization:</span>
                    <Badge variant="outline">{doctor.specialization}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Qualification:</span>
                    <span>{doctor.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">License Number:</span>
                    <span>{doctor.licenseNumber}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Experience:</span>
                    <span>{doctor.experience} years</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Consultation Fee:</span>
                    <span>₹{doctor.consultationFee}</span>
                  </div>
                  {doctor.department && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Department:</span>
                      <span>{doctor.department}</span>
                    </div>
                  )}
                </div>
              </div>

              {doctor.joiningDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Joining Date:</span>
                  <span>{format(new Date(doctor.joiningDate), "PPP")}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Availability & Schedule */}
          {workingHoursData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Availability & Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Consultation Type:</span>
                      <Badge variant="outline">{workingHoursData.consultationType}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">OPD Hours:</span>
                      <span>{workingHoursData.startTime} - {workingHoursData.endTime}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Max Patients/Day:</span>
                      <span>{workingHoursData.maxPatients}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Available:</span>
                      <Badge variant={doctor.isAvailable ? "default" : "secondary"}>
                        {doctor.isAvailable ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {workingHoursData.days && workingHoursData.days.length > 0 && (
                  <div>
                    <span className="font-medium text-sm">Working Days:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {workingHoursData.days.map((day: string) => (
                        <Badge key={day} variant="outline">
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Notes */}
          {doctor.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{doctor.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Created:</span> {format(new Date(doctor.createdAt), "PPP")}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {format(new Date(doctor.updatedAt), "PPP")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}