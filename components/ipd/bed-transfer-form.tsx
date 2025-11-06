"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Bed, ArrowRight, Save, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Admission } from "@/lib/ipd-types"
import { 
  createBedTransfer, 
  getAvailableBedsForTransfer, 
  transformTransferFormToDTO 
} from "@/lib/services/ipd-bed-transfer-service"

const transferSchema = z.object({
  toWardId: z.string().min(1, "Please select a ward"),
  toBedId: z.string().min(1, "Please select a bed"),
  reason: z.string().min(10, "Please provide reason for transfer (minimum 10 characters)"),
})

interface BedTransferFormProps {
  admission: Admission
}

export function BedTransferForm({ admission }: BedTransferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedWard, setSelectedWard] = useState("")
  const [availableBeds, setAvailableBeds] = useState<any[]>([])
  const [availableWards, setAvailableWards] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const { toast } = useToast()

  // Load available beds and wards on mount
  useEffect(() => {
    const loadTransferData = async () => {
      setIsLoadingData(true)
      try {
        // Get available beds (excluding current bed)
        const beds = await getAvailableBedsForTransfer(admission.bedId)
        setAvailableBeds(beds)

        // Extract unique wards from available beds
        const uniqueWards = beds.reduce((wards: any[], bed: any) => {
          const ward = bed.ward
          if (ward && !wards.find(w => w.id === ward.id)) {
            // Exclude current ward
            if (ward.id !== admission.wardId) {
              wards.push(ward)
            }
          }
          return wards
        }, [])
        setAvailableWards(uniqueWards)

      } catch (error) {
        console.error('Error loading transfer data:', error)
        toast({
          title: "Error Loading Data",
          description: "Failed to load available beds and wards.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadTransferData()
  }, [admission.bedId, admission.wardId, toast])

  const form = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      toWardId: "",
      toBedId: "",
      reason: "",
    },
  })

  const handleWardChange = (wardId: string) => {
    setSelectedWard(wardId)
    form.setValue("toBedId", "") // Reset bed selection
  }

  const onSubmit = async (data: z.infer<typeof transferSchema>) => {
    setIsSubmitting(true)
    try {
      // Get current user/doctor ID from auth context (placeholder)
      const currentUserId = "current-user-id" // This would come from auth context
      
      // Transform form data to backend DTO format
      const transferDTO = transformTransferFormToDTO(data, admission.admissionId, currentUserId)

      console.log("Transfer DTO:", transferDTO)

      // Call real backend API
      const response = await createBedTransfer(transferDTO)

      toast({
        title: "Transfer Successful",
        description: `Patient ${admission.patientName} has been transferred successfully.`,
      })

      // Reset form
      form.reset()
      setSelectedWard("")

      console.log("Bed transfer completed:", response)
      
    } catch (error) {
      console.error("Transfer failed:", error)
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "There was an error processing the transfer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Find current ward/bed and target ward/bed from the loaded data
  const currentWard = { id: admission.wardId, name: admission.wardName || 'Current Ward' }
  const currentBed = { id: admission.bedId, bedNumber: admission.bedNumber || 'Current Bed' }
  const targetWard = availableWards.find((w: any) => w.id === selectedWard)
  const targetBed = availableBeds.find((b: any) => b.id === form.watch("toBedId"))

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg text-slate-600">Loading transfer options...</span>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Current Location */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Current Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Patient:</span>
                <span>{admission.patientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Ward:</span>
                <Badge variant="outline">{admission.wardName}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Bed:</span>
                <Badge variant="outline">Bed {admission.bedNumber}</Badge>
              </div>
              {currentWard && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Daily Charges:</span>
                  <span>Current Ward</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transfer Direction */}
        <div className="flex items-center justify-center">
          <ArrowRight className="h-8 w-8 text-muted-foreground" />
        </div>

        {/* New Location Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Select New Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="toWardId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Ward *</FormLabel>
                    <Select
                      onValueChange={value => {
                        field.onChange(value)
                        handleWardChange(value)
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new ward" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableWards.map(ward => (
                          <SelectItem key={ward.id} value={ward.id}>
                            <div className="flex flex-col items-start">
                              <span>{ward.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {ward.totalBeds - ward.occupiedBeds} available • ${ward.chargesPerDay}/day
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toBedId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Bed *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedWard}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedWard ? "Select new bed" : "Select ward first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableBeds
                          .filter(bed => bed.wardId === selectedWard)
                          .map(bed => (
                            <SelectItem key={bed.id} value={bed.id}>
                              <div className="flex flex-col items-start">
                                <span>Bed {bed.bedNumber}</span>
                                <span className="text-xs text-muted-foreground">
                                  ${bed.chargesPerDay}/day • {bed.amenities.join(", ")}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {targetWard && targetBed && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div>
                      <strong>New Location:</strong> {targetWard.name} - Bed {targetBed.bedNumber}
                    </div>
                    <div>
                      <strong>New Ward:</strong> {targetWard?.name || 'Selected Ward'}
                    </div>
                    <div>
                      <strong>Amenities:</strong> {targetBed.amenities.join(", ")}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Transfer Reason */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Transfer *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed reason for transfer (e.g., medical condition improvement, patient request, bed availability...)"
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

        {/* Transfer Summary */}
        {targetWard && targetBed && currentWard && currentBed && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Transfer Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Patient:</span>
                  <span className="font-medium">{admission.patientName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>From:</span>
                  <Badge variant="outline">
                    {currentWard.name} - Bed {currentBed.bedNumber}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>To:</span>
                  <Badge variant="default">
                    {targetWard.name} - Bed {targetBed.bedNumber}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Transfer Type:</span>
                  <span className="text-blue-600 font-medium">
                    Bed Transfer
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Transfer Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !targetWard || !targetBed}>
            {isSubmitting ? (
              <>
                <ArrowRight className="mr-2 h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Confirm Transfer
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
