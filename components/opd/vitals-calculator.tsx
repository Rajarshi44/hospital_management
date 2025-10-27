"use client";

import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { calculateBMI } from "@/lib/opd-mock-data";
import type { OPDVisitForm } from "@/lib/opd-types";

interface VitalsCalculatorProps {
  form: UseFormReturn<OPDVisitForm>;
}

export function VitalsCalculator({ form }: VitalsCalculatorProps) {
  const heightCm = form.watch("vitals.heightCm");
  const weightKg = form.watch("vitals.weightKg");

  // Auto-calculate BMI when height or weight changes
  useEffect(() => {
    if (heightCm && weightKg) {
      const bmi = calculateBMI(weightKg, heightCm);
      form.setValue("vitals.bmi", bmi, { shouldValidate: true });
    }
  }, [heightCm, weightKg, form]);

  const getBMICategory = (bmi: number | undefined): string => {
    if (!bmi) return "";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const bmiValue = form.watch("vitals.bmi");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Height */}
      <FormField
        control={form.control}
        name="vitals.heightCm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Height (cm)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="e.g., 175"
                step="0.1"
                min="20"
                max="300"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Weight */}
      <FormField
        control={form.control}
        name="vitals.weightKg"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Weight (kg)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="e.g., 72"
                step="0.1"
                min="0.5"
                max="500"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* BMI (Read-only, auto-calculated) */}
      <FormField
        control={form.control}
        name="vitals.bmi"
        render={({ field }) => (
          <FormItem>
            <FormLabel>BMI (Auto-calculated)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Auto"
                readOnly
                className="bg-muted"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            {bmiValue && (
              <FormDescription className="text-xs font-medium">
                Category: {getBMICategory(bmiValue)}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Temperature */}
      <FormField
        control={form.control}
        name="vitals.temperature"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Temperature (°C) *</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="e.g., 37.0"
                step="0.1"
                min="30"
                max="45"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Blood Pressure */}
      <FormField
        control={form.control}
        name="vitals.bloodPressure"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Blood Pressure (mmHg) *</FormLabel>
            <FormControl>
              <Input placeholder="e.g., 120/80" {...field} />
            </FormControl>
            <FormDescription className="text-xs">Format: systolic/diastolic</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Pulse Rate */}
      <FormField
        control={form.control}
        name="vitals.pulseRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pulse Rate (bpm) *</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="e.g., 78"
                min="30"
                max="220"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Respiratory Rate */}
      <FormField
        control={form.control}
        name="vitals.respiratoryRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Respiratory Rate (breaths/min)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="e.g., 16"
                min="6"
                max="60"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* SpO2 */}
      <FormField
        control={form.control}
        name="vitals.spo2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SpO2 (%) *</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="e.g., 98"
                min="50"
                max="100"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Weight Note */}
      <FormField
        control={form.control}
        name="vitals.weightNote"
        render={({ field }) => (
          <FormItem className="md:col-span-2 lg:col-span-3">
            <FormLabel>Weight Note</FormLabel>
            <FormControl>
              <Input placeholder="Any notes about weight measurement" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
