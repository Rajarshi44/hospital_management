"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Doctor } from "@/lib/types"
import {
  Calendar,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Award,
  Languages,
  DollarSign,
  Clock,
  Building,
  User,
  FileText,
  Briefcase,
} from "lucide-react"
import { format } from "date-fns"

interface DoctorDetailsDialogProps {
  doctor: Doctor
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DoctorDetailsDialog({ doctor, open, onOpenChange }: DoctorDetailsDialogProps) {
  const getWorkingDays = () => {
    const workingDays = Object.entries(doctor.schedule)
      .filter(([_, schedule]) => schedule.isWorking)
      .map(([day, schedule]) => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        time: `${schedule.start} - ${schedule.end}`,
      }))
    return workingDays
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={doctor.profileImage} alt={`${doctor.firstName} ${doctor.lastName}`} />
              <AvatarFallback>
                {doctor.firstName[0]}
                {doctor.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-bold">
                Dr. {doctor.firstName} {doctor.lastName}
              </div>
              <div className="text-sm text-muted-foreground">
                {doctor.specialization} • {doctor.department}
              </div>
            </div>
            <Badge variant={doctor.isActive ? "default" : "secondary"} className="ml-auto">
              {doctor.isActive ? "Active" : "Inactive"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Detailed information about Dr. {doctor.firstName} {doctor.lastName}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{doctor.employeeId}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Born {format(new Date(doctor.dateOfBirth), "PPP")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{doctor.gender}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{doctor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{doctor.email}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="flex-1">{doctor.address}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Professional Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{doctor.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>{doctor.specialization}</span>
                      {doctor.subSpecialty && (
                        <Badge variant="secondary" className="text-xs">
                          {doctor.subSpecialty}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{doctor.experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${doctor.consultationFee} consultation fee</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined {format(new Date(doctor.joinDate), "MMM yyyy")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {doctor.biography && (
              <Card>
                <CardHeader>
                  <CardTitle>Biography</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{doctor.biography}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Languages Spoken
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {doctor.languagesSpoken.map(language => (
                    <Badge key={language} variant="outline">
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <strong>{doctor.emergencyContact.name}</strong>
                  <span className="text-muted-foreground ml-2">({doctor.emergencyContact.relationship})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor.emergencyContact.phone}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Medical License</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">License Number:</span>
                  <Badge variant="outline">{doctor.licenseNumber}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Expiry Date:</span>
                  <span className="text-sm">{format(new Date(doctor.licenseExpiry), "PPP")}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{doctor.medicalDegree}</span>
                  </div>
                  <div className="text-sm text-muted-foreground ml-6">
                    {doctor.medicalSchool} • Class of {doctor.graduationYear}
                  </div>
                </div>

                {doctor.residency && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Residency</div>
                      <div className="text-sm text-muted-foreground">
                        {doctor.residency.specialty} at {doctor.residency.hospital}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {doctor.residency.startYear} - {doctor.residency.endYear}
                      </div>
                    </div>
                  </>
                )}

                {doctor.fellowship && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Fellowship</div>
                      <div className="text-sm text-muted-foreground">
                        {doctor.fellowship.specialty} at {doctor.fellowship.hospital}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {doctor.fellowship.startYear} - {doctor.fellowship.endYear}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {doctor.boardCertifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Board Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {doctor.boardCertifications.map((cert, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{cert.specialty}</span>
                          <Badge variant="outline">{cert.board}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Certified: {format(new Date(cert.certificationDate), "MMM yyyy")} • Expires:{" "}
                          {format(new Date(cert.expiryDate), "MMM yyyy")}
                        </div>
                        {index < doctor.boardCertifications.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Weekly Schedule
                </CardTitle>
                <CardDescription>Regular working hours and availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(doctor.schedule).map(([day, schedule]) => (
                    <div key={day} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <span className="font-medium capitalize">{day}</span>
                      {schedule.isWorking ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-xs">
                            {schedule.start} - {schedule.end}
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Off
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Working Days Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {getWorkingDays().map(workDay => (
                    <div key={workDay.day} className="flex items-center justify-between text-sm">
                      <span>{workDay.day}</span>
                      <span className="text-muted-foreground">{workDay.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qualifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Professional Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Medical Degree</div>
                    <div className="text-sm text-muted-foreground">{doctor.medicalDegree}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Medical School</div>
                    <div className="text-sm text-muted-foreground">{doctor.medicalSchool}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Graduation Year</div>
                    <div className="text-sm text-muted-foreground">{doctor.graduationYear}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Years of Experience</div>
                    <div className="text-sm text-muted-foreground">{doctor.experience} years</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {doctor.publications && doctor.publications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Publications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {doctor.publications.map((publication, index) => (
                      <div key={index} className="space-y-2">
                        <div className="font-medium text-sm">{publication.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {publication.journal} • {format(new Date(publication.publicationDate), "MMM yyyy")}
                        </div>
                        {publication.doi && <div className="text-xs text-muted-foreground">DOI: {publication.doi}</div>}
                        {index < (doctor.publications?.length || 0) - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {doctor.achievements && doctor.achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Awards & Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {doctor.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Account Status:</span>
                  <Badge variant={doctor.isActive ? "default" : "secondary"}>
                    {doctor.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Join Date:</span>
                  <span>{format(new Date(doctor.joinDate), "PPP")}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Last Updated:</span>
                  <span>{format(new Date(doctor.updatedAt), "PPP")}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
