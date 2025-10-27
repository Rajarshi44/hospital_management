"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
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
import { getDoctors } from "@/lib/doctor-service";
import { getDoctorSlots, mockDoctorSlots } from "@/lib/opd-mock-data";
import type { TimeSlot } from "@/lib/opd-types";
import type { Department } from "@/lib/opd-types";
import type { Doctor as DoctorType } from "@/lib/types";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
}

interface DoctorTimeSlotPickerProps {
  selectedDepartment?: Department;
  selectedDoctorId?: string;
  selectedSlot?: string;
  visitDate: string;
  onDepartmentChange: (department: Department) => void;
  onDoctorChange: (doctorId: string, specialization: string) => void;
  onSlotChange: (slot: string) => void;
}

const departments: Department[] = [
  "General Medicine",
  "Pediatrics",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Dermatology",
  "ENT",
  "Ophthalmology",
  "Gynaecology",
  "Surgery",
  "Psychiatry",
  "Radiology",
  "Other",
];

export function DoctorTimeSlotPicker({
  selectedDepartment,
  selectedDoctorId,
  selectedSlot,
  visitDate,
  onDepartmentChange,
  onDoctorChange,
  onSlotChange,
}: DoctorTimeSlotPickerProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [showOverbookingWarning, setShowOverbookingWarning] = useState(false);

  // Load all doctors on mount
  useEffect(() => {
    loadDoctors();
  }, []);

  // Filter doctors by department
  useEffect(() => {
    if (selectedDepartment && doctors.length > 0) {
      const filtered = doctors.filter((doc) => doc.department === selectedDepartment);
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [selectedDepartment, doctors]);

  // Load slots when doctor is selected
  useEffect(() => {
    if (selectedDoctorId && visitDate) {
      loadDoctorSlots(selectedDoctorId, visitDate);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDoctorId, visitDate]);

  const loadDoctors = async () => {
    setIsLoadingDoctors(true);
    try {
      const allDoctors = await getDoctors();

      // Map to our Doctor interface
      const mappedDoctors: Doctor[] = allDoctors.map((doc: DoctorType) => ({
        id: doc.id,
        name: `${doc.firstName} ${doc.lastName}`,
        specialization: doc.specialization,
        department: doc.department,
      }));

      setDoctors(mappedDoctors);
    } catch (error) {
      console.error("Error loading doctors:", error);
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  const loadDoctorSlots = (doctorId: string, date: string) => {
    try {
      // Format date to YYYY-MM-DD
      const formattedDate = date.split("T")[0];
      const slots = getDoctorSlots(doctorId, formattedDate);
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Error loading slots:", error);
      setAvailableSlots([]);
    }
  };

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (doctor) {
      onDoctorChange(doctorId, doctor.specialization);
      setShowOverbookingWarning(false);
    }
  };

  const handleSlotChange = (slot: string) => {
    const selectedSlotData = availableSlots.find((s) => s.time === slot);

    if (selectedSlotData?.status === "booked") {
      setShowOverbookingWarning(true);
    } else {
      setShowOverbookingWarning(false);
    }

    onSlotChange(slot);
  };

  const getSlotBadgeVariant = (status: string) => {
    switch (status) {
      case "available":
        return "default";
      case "booked":
        return "secondary";
      case "blocked":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getSlotStatusText = (slot: TimeSlot) => {
    switch (slot.status) {
      case "available":
        return "";
      case "booked":
        return ` (Booked - ${slot.patientName})`;
      case "blocked":
        return " (Blocked)";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Department Selection */}
      <div className="space-y-2">
        <Label htmlFor="department">Department *</Label>
        <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
          <SelectTrigger id="department">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Doctor Selection */}
      <div className="space-y-2">
        <Label htmlFor="doctor">Consulting Doctor *</Label>
        <Select
          value={selectedDoctorId}
          onValueChange={handleDoctorChange}
          disabled={!selectedDepartment || filteredDoctors.length === 0}
        >
          <SelectTrigger id="doctor">
            <SelectValue placeholder="Select doctor" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingDoctors ? (
              <SelectItem value="loading" disabled>
                Loading doctors...
              </SelectItem>
            ) : filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialization}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                No doctors available in this department
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Time Slot Selection */}
      {selectedDoctorId && availableSlots.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="timeSlot">Appointment Time Slot</Label>
          <Select value={selectedSlot} onValueChange={handleSlotChange}>
            <SelectTrigger id="timeSlot">
              <SelectValue placeholder="Select time slot" />
            </SelectTrigger>
            <SelectContent>
              {availableSlots.map((slot) => (
                <SelectItem
                  key={slot.time}
                  value={slot.time}
                  disabled={slot.status === "blocked"}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{slot.time}</span>
                    {slot.status !== "available" && (
                      <Badge variant={getSlotBadgeVariant(slot.status)} className="ml-2 text-xs">
                        {slot.status}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Slot Legend */}
          <div className="flex gap-3 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <Badge variant="default" className="h-4 w-4 p-0" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="h-4 w-4 p-0" />
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="destructive" className="h-4 w-4 p-0" />
              <span>Blocked</span>
            </div>
          </div>
        </div>
      )}

      {/* Overbooking Warning */}
      {showOverbookingWarning && (
        <Alert variant="default" className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Warning:</strong> This time slot is already booked. Proceeding will result in
            overbooking. Please confirm if you want to continue.
          </AlertDescription>
        </Alert>
      )}

      {/* No slots available message */}
      {selectedDoctorId && availableSlots.length === 0 && (
        <Alert>
          <AlertDescription>
            No time slots available for the selected doctor on this date. Please try a different
            date or doctor.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
