"use client";

import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OPDVisitForm, MedicineRoute } from "@/lib/opd-types";

interface PrescriptionBuilderProps {
  form: UseFormReturn<OPDVisitForm>;
}

const medicineRoutes: MedicineRoute[] = [
  "Oral",
  "IV",
  "IM",
  "Subcutaneous",
  "Topical",
  "Inhalation",
  "Other",
];

const frequencies = ["OD", "BD", "TID", "QID", "SOS", "STAT", "PRN", "Q4H", "Q6H", "Q8H"];

export function PrescriptionBuilder({ form }: PrescriptionBuilderProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "treatment.prescriptionList",
  });

  const addPrescription = () => {
    append({
      drugName: "",
      strength: "",
      route: "Oral",
      frequency: "BD",
      dose: "",
      duration: "",
      instructions: "",
      notes: "",
      prescribingDoctor: "",
    });
  };

  return (
    <div className="space-y-4">
      {fields.length > 0 ? (
        fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Medicine #{index + 1}</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Drug Name */}
                <FormField
                  control={form.control}
                  name={`treatment.prescriptionList.${index}.drugName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drug Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Paracetamol" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Strength */}
                <FormField
                  control={form.control}
                  name={`treatment.prescriptionList.${index}.strength`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strength *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 500mg, 5ml" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Route */}
                <FormField
                  control={form.control}
                  name={`treatment.prescriptionList.${index}.route`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Route *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select route" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {medicineRoutes.map((route) => (
                            <SelectItem key={route} value={route}>
                              {route}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Frequency */}
                <FormField
                  control={form.control}
                  name={`treatment.prescriptionList.${index}.frequency`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {frequencies.map((freq) => (
                            <SelectItem key={freq} value={freq}>
                              {freq}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dose */}
                <FormField
                  control={form.control}
                  name={`treatment.prescriptionList.${index}.dose`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dose *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 1 tablet, 10ml" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Duration */}
                <FormField
                  control={form.control}
                  name={`treatment.prescriptionList.${index}.duration`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5 days, 2 weeks" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Instructions */}
              <FormField
                control={form.control}
                name={`treatment.prescriptionList.${index}.instructions`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., After food, Before sleep"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name={`treatment.prescriptionList.${index}.notes`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No prescriptions added yet. Click the button below to add medicine.
        </div>
      )}

      <Button type="button" variant="outline" onClick={addPrescription} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Medicine
      </Button>
    </div>
  );
}
