"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Printer } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OPDVisitForm } from "@/components/opd/opd-visit-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OPDPage() {
  const router = useRouter();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [visitId, setVisitId] = useState<string>("");

  const handleSuccess = (newVisitId: string) => {
    setVisitId(newVisitId);
    setShowSuccessDialog(true);
  };

  const handlePrintVisit = () => {
    // TODO: Implement print functionality
    window.print();
  };

  const handleViewVisit = () => {
    // TODO: Navigate to visit details page
    router.push(`/patients/opd/${visitId}`);
  };

  const handleNewVisit = () => {
    setShowSuccessDialog(false);
    setVisitId("");
    // Refresh the page to clear the form
    router.refresh();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/patients">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patients
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">OPD Patient Visit</h1>
          <p className="text-muted-foreground">
            Complete outpatient department patient registration and consultation form
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            New OPD Visit
          </CardTitle>
          <CardDescription>
            Fill in all required fields marked with * to complete the patient visit record.
            The form auto-saves every 30 seconds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OPDVisitForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>OPD Visit Created Successfully!</DialogTitle>
            <DialogDescription>
              Visit ID: <span className="font-mono font-semibold">{visitId}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              The OPD visit has been recorded. You can now print the visit summary, view details,
              or create a new visit.
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handlePrintVisit}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleViewVisit}>
              <FileText className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button onClick={handleNewVisit}>Create New Visit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
