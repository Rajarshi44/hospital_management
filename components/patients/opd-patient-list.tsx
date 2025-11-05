"use client";

import { useState, useEffect } from 'react';
import { usePatient, type EnhancedPatient } from '@/hooks/usePatient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Pill,
  FileText,
  Clock,
  DollarSign,
  Eye,
  Filter,
  RefreshCw,
  Download
} from 'lucide-react';
import { format } from 'date-fns';

interface OPDPatientListProps {
  onPatientSelect?: (patient: EnhancedPatient) => void;
  refreshTrigger?: number;
}

export function OPDPatientList({ onPatientSelect, refreshTrigger }: OPDPatientListProps) {
  const {
    patients,
    isLoading,
    error,
    searchQuery,
    filters,
    statistics,
    searchPatients,
    applyFilters,
    refresh,
    setSearchQuery,
    setFilters,
  } = usePatient({ autoFetch: true });

  const [selectedPatient, setSelectedPatient] = useState<EnhancedPatient | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Export OPD patient list to CSV
  const exportToCSV = () => {
    if (!patients || patients.length === 0) {
      alert('No data to export');
      return;
    }

    // Define CSV headers
    const headers = [
      'Patient ID',
      'Patient Name',
      'Age',
      'Gender',
      'Phone',
      'Email',
      'Blood Group',
      'Address',
      'City',
      'State',
      'Zip Code',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'Allergies',
      'Chronic Conditions',
      'Current Medications'
    ];

    // Map patients data to CSV rows
    const csvRows = [
      headers.join(','),
      ...patients.map(patient => {
        const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
        const allergiesStr = patient.allergies ? String(patient.allergies) : 'None';
        const chronicStr = patient.medicalHistory.chronicConditions ? String(patient.medicalHistory.chronicConditions) : 'None';
        const medsStr = patient.medicalHistory.currentMedications ? String(patient.medicalHistory.currentMedications) : 'None';
        
        return [
          patient.patientId || 'N/A',
          `"${patient.firstName} ${patient.lastName}"`,
          age,
          patient.gender,
          patient.phone || 'N/A',
          patient.email || 'N/A',
          patient.bloodGroup || 'N/A',
          `"${patient.address || 'N/A'}"`,
          patient.city || 'N/A',
          patient.state || 'N/A',
          patient.zipCode || 'N/A',
          `"${patient.emergencyContact.name || 'N/A'}"`,
          patient.emergencyContact.phone || 'N/A',
          `"${allergiesStr}"`,
          `"${chronicStr}"`,
          `"${medsStr}"`
        ].join(',');
      })
    ];

    const csvContent = csvRows.join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `opd-patients-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Refresh when trigger changes
  useEffect(() => {
    if (refreshTrigger) {
      refresh();
    }
  }, [refreshTrigger, refresh]);

  const handleSearch = (query: string) => {
    setSearchInput(query);
    if (query.length >= 2 || query.length === 0) {
      searchPatients(query);
    }
  };

  const handlePatientClick = (patient: EnhancedPatient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
    onPatientSelect?.(patient);
  };

  const handleFilterChange = (key: string, value: string) => {
    applyFilters({ [key]: value });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'stat': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'routine': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Visits</p>
                <p className="text-2xl font-bold">{statistics.withRecentVisits}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Prescriptions</p>
                <p className="text-2xl font-bold">{statistics.withActivePrescriptions}</p>
              </div>
              <Pill className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Tests</p>
                <p className="text-2xl font-bold">{statistics.withPendingInvestigations}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">₹{statistics.totalOutstandingBalance.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>OPD Patients</CardTitle>
              <CardDescription>Comprehensive patient data with OPD visit details</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, patient ID..."
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filters.department} onValueChange={(value) => handleFilterChange('department', value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="General Medicine">General Medicine</SelectItem>
                <SelectItem value="Cardiology">Cardiology</SelectItem>
                <SelectItem value="Neurology">Neurology</SelectItem>
                <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                <SelectItem value="Pediatrics">Pediatrics</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-full sm:w-48"
            />
          </div>

          {/* Patient Table */}
          {error && (
            <div className="text-center py-4 text-red-600">
              Error: {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading patient data...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No patients found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? `No patients match "${searchQuery}"` : 'No OPD patients available'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{patient.fullName}</div>
                            <Badge variant="outline" className="text-xs">
                              {patient.patientId}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {patient.age} years • {patient.gender}
                            {patient.bloodGroup && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {patient.bloodGroup}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                          </div>
                          {patient.email && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {patient.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {patient.summary.lastVisitDate ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {format(new Date(patient.summary.lastVisitDate), 'MMM dd, yyyy')}
                            </div>
                            {patient.opdData.recentVisits[0] && (
                              <div className="text-xs text-muted-foreground">
                                {patient.opdData.recentVisits[0].department}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No visits</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {patient.summary.totalVisits} visits
                          </Badge>
                          {patient.summary.activePrescriptions > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {patient.summary.activePrescriptions} Rx
                            </Badge>
                          )}
                          {patient.summary.pendingInvestigations > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {patient.summary.pendingInvestigations} tests
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {patient.summary.outstandingBalance > 0 ? (
                          <div className="text-sm font-medium text-red-600">
                            ₹{patient.summary.outstandingBalance.toLocaleString()}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Paid</Badge>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePatientClick(patient)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      <Dialog open={showPatientDetails} onOpenChange={setShowPatientDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {selectedPatient?.fullName}
            </DialogTitle>
            <DialogDescription>
              Patient ID: {selectedPatient?.patientId} • Complete OPD Records
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="visits">Visits</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="investigations">Tests</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="ipd">IPD</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Age:</span>
                          <div>{selectedPatient.age} years</div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Gender:</span>
                          <div>{selectedPatient.gender}</div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Blood Group:</span>
                          <div>{selectedPatient.bloodGroup || 'Not specified'}</div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Patient Type:</span>
                          <Badge variant="outline">{selectedPatient.patientType}</Badge>
                        </div>
                      </div>
                      
                      {selectedPatient.occupation && (
                        <div>
                          <span className="font-medium text-muted-foreground">Occupation:</span>
                          <div className="text-sm">{selectedPatient.occupation}</div>
                        </div>
                      )}
                      
                      <div>
                        <span className="font-medium text-muted-foreground">Address:</span>
                        <div className="text-sm">{selectedPatient.address}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Medical Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Medical Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{selectedPatient.summary.totalVisits}</div>
                          <div className="text-sm text-muted-foreground">Total Visits</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{selectedPatient.summary.activePrescriptions}</div>
                          <div className="text-sm text-muted-foreground">Active Rx</div>
                        </div>
                      </div>
                      
                      {selectedPatient.allergies && (
                        <div>
                          <span className="font-medium text-muted-foreground">Allergies:</span>
                          <div className="text-sm text-red-600">{selectedPatient.allergies}</div>
                        </div>
                      )}
                      
                      {selectedPatient.medicalHistory.chronicConditions && (
                        <div>
                          <span className="font-medium text-muted-foreground">Chronic Conditions:</span>
                          <div className="text-sm">{selectedPatient.medicalHistory.chronicConditions}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="visits" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Visits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPatient.opdData.recentVisits.map((visit, index) => (
                        <div key={visit.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-1">
                            <div className="font-medium">{visit.visitId}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(visit.visitDate), 'PPP')} • {visit.doctor}
                            </div>
                            <div className="text-sm">{visit.chiefComplaint}</div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(visit.status)}>{visit.status}</Badge>
                            <div className="text-sm text-muted-foreground mt-1">{visit.department}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="prescriptions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Active Prescriptions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPatient.opdData.activePrescriptions.map((prescription, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-1">
                            <div className="font-medium">{prescription.drugName}</div>
                            <div className="text-sm text-muted-foreground">
                              {prescription.dosage} • {prescription.frequency}
                            </div>
                            <div className="text-sm">Prescribed by: {prescription.prescribedBy}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(prescription.prescribedAt), 'MMM dd')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="investigations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Pending Investigations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPatient.opdData.pendingInvestigations.map((investigation, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-1">
                            <div className="font-medium">{investigation.testName}</div>
                            <div className="text-sm text-muted-foreground">{investigation.testType}</div>
                          </div>
                          <div className="text-right">
                            <Badge className={getPriorityColor(investigation.urgency)}>{investigation.urgency}</Badge>
                            <div className="text-sm text-muted-foreground mt-1">
                              {format(new Date(investigation.orderedAt), 'MMM dd')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="billing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Billing Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-4">
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        ₹{selectedPatient.summary.outstandingBalance.toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">Outstanding Balance</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="ipd" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">IPD Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-8 text-muted-foreground">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="font-semibold mb-2">IPD Integration Pending</h3>
                      <p className="text-sm">
                        {selectedPatient.ipdData.note}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}