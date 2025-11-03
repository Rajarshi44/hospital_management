"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle, User, Calendar, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDepartments } from "@/hooks/doctor/use-departments";
import { useAppointments, type Doctor, type TimeSlot } from "@/hooks/useAppointments";

interface DoctorTimeSlotPickerProps {
  selectedDepartment: string;
  selectedDoctorId: string;
  selectedSlot: string;
  visitDate: string;
  onDepartmentChange: (departmentId: string, departmentName: string) => void;
  onDoctorChange: (doctorId: string, specialization: string, consultationFee: number, doctorName: string) => void;
  onSlotChange: (slot: string) => void;
}

export function DoctorTimeSlotPicker({
  selectedDepartment,
  selectedDoctorId,
  selectedSlot,
  visitDate,
  onDepartmentChange,
  onDoctorChange,
  onSlotChange,
}: DoctorTimeSlotPickerProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // Use custom hooks
  const { departments, fetchDepartments } = useDepartments();
  const { 
    departmentDoctors, 
    availableSlots, 
    isLoading, 
    getDoctorsByDepartment, 
    getAvailableSlots 
  } = useAppointments();

  // Load departments on mount
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Auto-select first department if none selected
  useEffect(() => {
    if (departments.length > 0 && (!selectedDepartment || selectedDepartment === "")) {
      const firstDepartment = departments[0];
      onDepartmentChange(firstDepartment.id, firstDepartment.name);
    }
  }, [departments, selectedDepartment, onDepartmentChange]);

  // Load doctors when department changes
  useEffect(() => {
    if (selectedDepartment && selectedDepartment !== "all") {
      getDoctorsByDepartment(selectedDepartment, visitDate);
    }
  }, [selectedDepartment, visitDate, getDoctorsByDepartment]);

  // Load slots when doctor changes
  useEffect(() => {
    if (selectedDoctorId && visitDate) {
      const formattedDate = new Date(visitDate).toISOString().split('T')[0];
      getAvailableSlots(selectedDoctorId, formattedDate);
    }
  }, [selectedDoctorId, visitDate, getAvailableSlots]);

  // Find selected doctor
  useEffect(() => {
    if (selectedDoctorId && departmentDoctors.length > 0) {
      const doctor = departmentDoctors.find((doc) => doc.id === selectedDoctorId);
      setSelectedDoctor(doctor || null);
    }
  }, [selectedDoctorId, departmentDoctors]);

  const handleDepartmentSelect = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    if (department) {
      onDepartmentChange(departmentId, department.name);
    }
  };

  const handleDoctorSelect = (doctorId: string) => {
    const doctor = departmentDoctors.find((doc) => doc.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
      onDoctorChange(
        doctorId, 
        doctor.specialization, 
        doctor.consultationFee, 
        doctor.fullName
      );
    }
  };

  const handleSlotSelect = (slot: string) => {
    onSlotChange(slot);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Department Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Department</Label>
          <Select value={selectedDepartment || ""} onValueChange={handleDepartmentSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Doctor Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Consulting Doctor</Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={selectedDoctorId}
              onValueChange={handleDoctorSelect}
              disabled={!selectedDepartment || selectedDepartment === "all" || departmentDoctors.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {departmentDoctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>
                        {doctor.fullName} - {doctor.specialization}
                      </span>
                      <Badge variant="outline" className="ml-auto">
                        {doctor.appointmentCount} today
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {departmentDoctors.length === 0 && selectedDepartment && selectedDepartment !== "all" && !isLoading && (
            <p className="text-sm text-muted-foreground">
              No doctors available for selected department
            </p>
          )}
        </div>
      </div>

      {/* Time Slot Selection */}
      {selectedDoctorId && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Available Time Slots
          </Label>
          {isLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : availableSlots && availableSlots.slots.length > 0 ? (
            <Select value={selectedSlot} onValueChange={handleSlotSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.slots.map((slot) => (
                  <SelectItem
                    key={slot.startTime}
                    value={slot.startTime}
                    disabled={!slot.available}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{slot.startTime} - {slot.endTime}</span>
                      {slot.available && (
                        <Badge variant="default" className="ml-2 text-xs">
                          Available
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : selectedDoctorId ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No available slots for selected doctor on {new Date(visitDate).toDateString()}
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      )}

      {/* Selected Doctor Info */}
      {selectedDoctor && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{selectedDoctor.fullName}</h4>
                <p className="text-sm text-muted-foreground">{selectedDoctor.specialization}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-muted-foreground">
                    Fee: ₹{selectedDoctor.consultationFee}
                  </span>
                  <Badge variant={selectedDoctor.isAvailable ? "default" : "secondary"}>
                    {selectedDoctor.isAvailable ? "Available" : "Busy"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Slot Info */}
      {selectedSlot && selectedDoctor && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Appointment Slot Selected</h4>
                <p className="text-sm text-green-700">
                  {new Date(visitDate).toDateString()} at {selectedSlot}
                </p>
                <p className="text-sm text-green-600">with {selectedDoctor.fullName}</p>
                <p className="text-sm text-green-600">Consultation Fee: ₹{selectedDoctor.consultationFee}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}