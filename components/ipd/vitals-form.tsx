"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Activity, Heart, Thermometer, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const vitalsSchema = z.object({
  temperature: z.number().min(90).max(110, "Temperature must be between 90-110°F"),
  systolic: z.number().min(70).max(250, "Systolic BP must be between 70-250 mmHg"),
  diastolic: z.number().min(40).max(150, "Diastolic BP must be between 40-150 mmHg"),
  heartRate: z.number().min(40).max(200, "Heart rate must be between 40-200 bpm"),
  respiratoryRate: z.number().min(8).max(40, "Respiratory rate must be between 8-40 breaths/min"),
  oxygenSaturation: z.number().min(70).max(100, "Oxygen saturation must be between 70-100%"),
  bloodSugar: z.number().min(30).max(500, "Blood sugar must be between 30-500 mg/dL").optional(),
  weight: z.number().min(1).max(300, "Weight must be between 1-300 kg").optional(),
  height: z.number().min(30).max(250, "Height must be between 30-250 cm").optional(),
  nursingNotes: z.string().optional(),
})

interface VitalsFormProps {
  admissionId: string
}

export function VitalsForm({ admissionId }: VitalsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof vitalsSchema>>({
    resolver: zodResolver(vitalsSchema),
    defaultValues: {
      temperature: 98.6,
      systolic: 120,
      diastolic: 80,
      heartRate: 72,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      bloodSugar: undefined,
      weight: undefined,
      height: undefined,
      nursingNotes: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof vitalsSchema>) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log("Vitals recorded:", {
        admissionId,
        ...data,
        recordedAt: new Date().toISOString(),
        recordedBy: "Current User", // This would come from auth context
      })

      alert("Vitals recorded successfully!")
      form.reset()
    } catch (error) {
      console.error("Failed to record vitals:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getVitalStatus = (value: number, ranges: { normal: [number, number]; warning: [number, number] }) => {
    if (value >= ranges.normal[0] && value <= ranges.normal[1]) return "normal"
    if (value >= ranges.warning[0] && value <= ranges.warning[1]) return "warning"
    return "critical"
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "normal":
        return "default"
      case "warning":
        return "secondary"
      case "critical":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Vital Signs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Temperature (°F) *
                    </FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="98.6"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <Badge
                        variant={getBadgeVariant(
                          getVitalStatus(field.value, { normal: [97, 99.5], warning: [96, 101] })
                        )}
                      >
                        {getVitalStatus(field.value, { normal: [97, 99.5], warning: [96, 101] })}
                      </Badge>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="heartRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Heart Rate (bpm) *
                    </FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="72"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <Badge
                        variant={getBadgeVariant(
                          getVitalStatus(field.value, { normal: [60, 100], warning: [50, 120] })
                        )}
                      >
                        {getVitalStatus(field.value, { normal: [60, 100], warning: [50, 120] })}
                      </Badge>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Blood Pressure (mmHg) *</Label>
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="systolic"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="120"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span className="text-muted-foreground">/</span>
                  <FormField
                    control={form.control}
                    name="diastolic"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="80"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Badge
                    variant={getBadgeVariant(
                      getVitalStatus(form.watch("systolic"), { normal: [110, 140], warning: [90, 160] })
                    )}
                  >
                    {getVitalStatus(form.watch("systolic"), { normal: [110, 140], warning: [90, 160] })}
                  </Badge>
                </div>
              </div>

              <FormField
                control={form.control}
                name="respiratoryRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Respiratory Rate (breaths/min) *</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="16"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <Badge
                        variant={getBadgeVariant(getVitalStatus(field.value, { normal: [12, 20], warning: [8, 25] }))}
                      >
                        {getVitalStatus(field.value, { normal: [12, 20], warning: [8, 25] })}
                      </Badge>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="oxygenSaturation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oxygen Saturation (%) *</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="98"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <Badge
                        variant={getBadgeVariant(getVitalStatus(field.value, { normal: [95, 100], warning: [90, 94] }))}
                      >
                        {getVitalStatus(field.value, { normal: [95, 100], warning: [90, 94] })}
                      </Badge>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bloodSugar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Sugar (mg/dL)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Physical Measurements */}
        <Card>
          <CardHeader>
            <CardTitle>Physical Measurements (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="70.0"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="170"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Nursing Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Nursing Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="nursingNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observations & Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Patient observations, behavior, response to treatment..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Activity className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Record Vitals
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
