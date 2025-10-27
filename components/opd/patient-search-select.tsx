"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PatientService } from "@/lib/patient-service";
import type { Patient } from "@/lib/patient-service";

interface PatientSearchSelectProps {
  onSelectPatient: (patient: Patient | null) => void;
  onCreateNew: () => void;
  selectedPatientId?: string;
}

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth: string | Date): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function PatientSearchSelect({
  onSelectPatient,
  onCreateNew,
  selectedPatientId,
}: PatientSearchSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Load selected patient if ID is provided
  useEffect(() => {
    if (selectedPatientId) {
      loadPatient(selectedPatientId);
    }
  }, [selectedPatientId]);

  const loadPatient = async (patientId: string) => {
    try {
      const patient = await PatientService.getInstance().getPatientById(patientId);
      if (patient) {
        setSelectedPatient(patient);
        setSearchQuery(`${patient.firstName} ${patient.lastName} (${patient.id})`);
      }
    } catch (error) {
      console.error("Error loading patient:", error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      // Search by UHID, name, or phone
      const allPatients = await PatientService.getInstance().getAllPatients();
      const filtered = allPatients.filter((patient) => {
        const searchLower = query.toLowerCase();
        return (
          patient.id?.toLowerCase().includes(searchLower) ||
          patient.firstName?.toLowerCase().includes(searchLower) ||
          patient.lastName?.toLowerCase().includes(searchLower) ||
          patient.phone?.includes(query) ||
          patient.email?.toLowerCase().includes(searchLower)
        );
      });

      setSearchResults(filtered);
    } catch (error) {
      console.error("Error searching patients:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setSearchQuery(`${patient.firstName} ${patient.lastName} (${patient.id})`);
    setShowResults(false);
    onSelectPatient(patient);
  };

  const handleCreateNew = () => {
    setSelectedPatient(null);
    setSearchQuery("");
    setShowResults(false);
    onCreateNew();
  };

  const handleClearSelection = () => {
    setSelectedPatient(null);
    setSearchQuery("");
    setShowResults(false);
    onSelectPatient(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by UHID, Name, Phone..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            className="pl-9"
          />
          {selectedPatient && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-6 w-6 p-0"
              onClick={handleClearSelection}
            >
              ×
            </Button>
          )}

          {/* Search Results Dropdown */}
          {showResults && (
            <Card className="absolute z-50 mt-1 w-full max-h-80 overflow-y-auto">
              <CardContent className="p-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => handleSelectPatient(patient)}
                        className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="font-medium">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {patient.id} • Age: {calculateAge(patient.dateOfBirth)} • {patient.gender}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Phone: {patient.phone}
                            </div>
                          </div>
                          {patient.bloodGroup && (
                            <Badge variant="outline" className="ml-2">
                              {patient.bloodGroup}
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    No patients found matching &quot;{searchQuery}&quot;
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleCreateNew}
          className="whitespace-nowrap"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Patient
        </Button>
      </div>

      {selectedPatient && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h3>
                  <Badge variant="secondary">{selectedPatient.id}</Badge>
                  {selectedPatient.bloodGroup && (
                    <Badge variant="outline">{selectedPatient.bloodGroup}</Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Age:</span>{" "}
                    <span className="font-medium">{calculateAge(selectedPatient.dateOfBirth)} years</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gender:</span>{" "}
                    <span className="font-medium">{selectedPatient.gender}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    <span className="font-medium">{selectedPatient.phone}</span>
                  </div>
                  {selectedPatient.email && (
                    <div>
                      <span className="text-muted-foreground">Email:</span>{" "}
                      <span className="font-medium">{selectedPatient.email}</span>
                    </div>
                  )}
                </div>
                {selectedPatient.address && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Address:</span>{" "}
                    <span>{selectedPatient.address}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
