"use client"

import { useState, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Bed as BedIcon, Users, CheckCircle, Clock, Wrench, Plus, Filter,
  RefreshCw, Droplet, Wind, Activity, Shield, Baby, AlertCircle,
  ChevronDown, ChevronUp, X, Loader2
} from "lucide-react"
import { mockWards, mockBeds, getAvailableBeds, getBedsByWard } from "@/lib/ipd-mock-data"
import { Bed, Ward } from "@/lib/ipd-types"
import { useToast } from "@/hooks/use-toast"

type BedStatusFilter = "all" | "Available" | "Occupied" | "Cleaning" | "Maintenance"

// Ward Setup Schema
const roomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  roomType: z.enum(["General", "Twin Sharing", "Private", "Suite", "ICU"]),
  noOfBeds: z.number().min(1, "At least 1 bed required"),
  billingClass: z.enum(["Economy", "Standard", "Deluxe", "Suite", "ICU Tariff"]),
})

const bedFeatureSchema = z.object({
  bedIdentifier: z.string().min(1, "Bed ID is required"),
  features: z.array(z.string()),
  nurseCall: z.boolean().default(false),
  isEmergencyBay: z.boolean().default(false),
})

const wardSetupSchema = z.object({
  wardName: z.string().min(2, "Ward name is required"),
  wardCode: z.string().min(2, "Ward code is required"),
  floor: z.number().min(0, "Floor number is required"),
  wing: z.string().optional(),
  wardType: z.enum(["General", "Semi-Private", "Private", "ICU", "PICU", "NICU"]),
  totalRooms: z.number().min(1, "At least 1 room required"),
  rooms: z.array(roomSchema).min(1, "Add at least one room"),
  bedFeatures: z.array(bedFeatureSchema).min(1, "Configure at least one bed"),
  nurseStation: z.string().optional(),
  nursePatientRatio: z.string().optional(),
})

type WardSetupFormData = z.infer<typeof wardSetupSchema>

export default function WardsPage() {
  const { toast } = useToast()
  const [selectedWard, setSelectedWard] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<BedStatusFilter>("all")
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null)
  const [showBedDetails, setShowBedDetails] = useState(false)
  const [showWardSetup, setShowWardSetup] = useState(false)
  const [openSections, setOpenSections] = useState({
    ward: true,
    rooms: false,
    beds: false,
    staff: false,
  })

  const form = useForm<WardSetupFormData>({
    resolver: zodResolver(wardSetupSchema),
    defaultValues: {
      wardName: "",
      wardCode: "",
      floor: 1,
      wing: "",
      wardType: "General",
      totalRooms: 1,
      rooms: [{ roomNumber: "", roomType: "General", noOfBeds: 1, billingClass: "Economy" }],
      bedFeatures: [{ bedIdentifier: "", features: [], nurseCall: false, isEmergencyBay: false }],
      nurseStation: "",
      nursePatientRatio: "1:5",
    },
  })

  const { fields: roomFields, append: appendRoom, remove: removeRoom } = useFieldArray({
    control: form.control,
    name: "rooms",
  })

  const { fields: bedFields, append: appendBed, remove: removeBed } = useFieldArray({
    control: form.control,
    name: "bedFeatures",
  })

  const stats = useMemo(() => {
    const totalBeds = mockBeds.length
    const occupied = mockBeds.filter(b => b.isOccupied).length
    const available = mockBeds.filter(b => !b.isOccupied).length
    const underCleaning = 0
    return { totalBeds, occupied, available, underCleaning }
  }, [])

  const filteredBeds = useMemo(() => {
    let beds = mockBeds
    if (selectedWard !== "all") {
      beds = beds.filter(b => b.wardId === selectedWard)
    }
    if (statusFilter === "Available") {
      beds = beds.filter(b => !b.isOccupied)
    } else if (statusFilter === "Occupied") {
      beds = beds.filter(b => b.isOccupied)
    }
    return beds
  }, [selectedWard, statusFilter])

  const bedsByWard = useMemo(() => {
    const grouped: Record<string, Bed[]> = {}
    filteredBeds.forEach(bed => {
      if (!grouped[bed.wardId]) {
        grouped[bed.wardId] = []
      }
      grouped[bed.wardId].push(bed)
    })
    return grouped
  }, [filteredBeds])

  const handleBedClick = (bed: Bed) => {
    setSelectedBed(bed)
    setShowBedDetails(true)
  }

  const handleAssignBed = () => {
    toast({
      title: "Bed Assignment",
      description: `Bed ${selectedBed?.bedNumber} assignment dialog would open here`,
    })
  }

  const handleReleaseBed = () => {
    toast({
      title: "Bed Released",
      description: `Bed ${selectedBed?.bedNumber} has been released`,
    })
    setShowBedDetails(false)
  }

  const clearFilters = () => {
    setSelectedWard("all")
    setStatusFilter("all")
  }

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleWardSetupSubmit = async (data: WardSetupFormData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast({
        title: "Ward Setup Complete!",
        description: `Ward "${data.wardName}" has been created with ${data.rooms.length} rooms and ${data.bedFeatures.length} beds.`,
      })
      setShowWardSetup(false)
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create ward. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (bed: Bed) => {
    if (bed.isOccupied) {
      return <Badge variant="default" className="bg-blue-600"><Users className="h-3 w-3 mr-1" />Occupied</Badge>
    }
    return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Available</Badge>
  }

  const getFeatureIcons = (amenities: string[]) => {
    const iconMap: Record<string, any> = { "TV": Activity, "AC": Wind, "Fan": Wind, "Oxygen": Droplet, "Ventilator": Wind, "Monitor": Activity }
    return amenities.slice(0, 3).map((amenity, i) => {
      const Icon = iconMap[amenity] || AlertCircle
      return <Icon key={i} className="h-4 w-4 text-muted-foreground" />
    })
  }

  const bedFeatureOptions = ["Oxygen", "Ventilator", "Cardiac Monitor", "Isolation", "Negative Pressure", "Child Cot"]

  return <AuthProvider><AppLayout><div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold tracking-tight">Ward &amp; Bed Management</h1><p className="text-muted-foreground">Monitor bed occupancy and manage ward allocation</p></div><Button size="lg" onClick={() => setShowWardSetup(true)}><Plus className="h-5 w-5 mr-2" />Ward Setup</Button></div><div className="grid grid-cols-1 md:grid-cols-4 gap-4"><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Beds</CardTitle><BedIcon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalBeds}</div><p className="text-xs text-muted-foreground">Across all wards</p></CardContent></Card><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Occupied</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{stats.occupied}</div><p className="text-xs text-muted-foreground">{Math.round((stats.occupied / stats.totalBeds) * 100)}% occupancy</p></CardContent></Card><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Available</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.available}</div><p className="text-xs text-muted-foreground">Ready for admission</p></CardContent></Card><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Cleaning / Maintenance</CardTitle><Wrench className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{stats.underCleaning}</div><p className="text-xs text-muted-foreground">Under maintenance</p></CardContent></Card></div><Card><CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Filters</CardTitle><Button variant="ghost" size="sm" onClick={clearFilters}><RefreshCw className="h-4 w-4 mr-2" />Clear Filters</Button></div></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className="text-sm font-medium mb-2 block">Ward</label><Select value={selectedWard} onValueChange={setSelectedWard}><SelectTrigger><SelectValue placeholder="All Wards" /></SelectTrigger><SelectContent><SelectItem value="all">All Wards</SelectItem>{mockWards.map((ward) => <SelectItem key={ward.id} value={ward.id}>{ward.name}</SelectItem>)}</SelectContent></Select></div><div><label className="text-sm font-medium mb-2 block">Status</label><Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}><SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="Available">Available</SelectItem><SelectItem value="Occupied">Occupied</SelectItem><SelectItem value="Cleaning">Cleaning</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem></SelectContent></Select></div><div><label className="text-sm font-medium mb-2 block">Search Bed</label><Input placeholder="Bed number..." /></div></div></CardContent></Card><div className="space-y-6">{mockWards.filter(ward => selectedWard === "all" || ward.id === selectedWard).map((ward) => {const wardBeds = bedsByWard[ward.id] || [];if (wardBeds.length === 0) return null;return <Card key={ward.id}><CardHeader><div className="flex items-center justify-between"><div><CardTitle className="text-xl">{ward.name}</CardTitle><p className="text-sm text-muted-foreground mt-1">{ward.type.charAt(0).toUpperCase() + ward.type.slice(1)} Ward  Floor {Math.floor(Math.random() * 5) + 1}</p></div><Badge variant="secondary" className="text-base">{wardBeds.length} {wardBeds.length === 1 ? "bed" : "beds"}</Badge></div></CardHeader><CardContent><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{wardBeds.map((bed) => <Card key={bed.id} className={`cursor-pointer transition-all hover:shadow-lg ${bed.isOccupied ? "border-blue-200 bg-blue-50/50" : "border-green-200 bg-green-50/50"}`} onClick={() => handleBedClick(bed)}><CardContent className="p-4"><div className="space-y-3"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><BedIcon className="h-5 w-5" /><span className="font-bold">{bed.bedNumber}</span></div></div>{getStatusBadge(bed)}<div className="flex items-center gap-2 pt-2 border-t">{getFeatureIcons(bed.amenities)}</div><div className="text-xs text-muted-foreground">₹{bed.chargesPerDay}/day</div></div></CardContent></Card>)}</div></CardContent></Card>})}{filteredBeds.length === 0 && <Card><CardContent className="py-12"><div className="text-center text-muted-foreground"><BedIcon className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No beds found matching your filters</p></div></CardContent></Card>}</div></div><Dialog open={showWardSetup} onOpenChange={setShowWardSetup}><DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="text-2xl">Ward &amp; Bed Setup</DialogTitle><DialogDescription>Configure ward details, rooms, beds, and staff allocation</DialogDescription></DialogHeader><Form {...form}><form onSubmit={form.handleSubmit(handleWardSetupSubmit)} className="space-y-6">
                {/* Ward Creation */}
                <Collapsible open={openSections.ward} onOpenChange={() => toggleSection("ward")}>
                  <Card className="border-l-4 border-l-primary">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-accent/50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">1. Ward Creation</CardTitle>
                          {openSections.ward ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField control={form.control} name="wardName" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ward Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. General Ward A" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="wardCode" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Short Code *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. ICU1, GND1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="floor" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Floor Number</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="wing" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Wing / Block (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. East Wing" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="wardType" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ward Type *</FormLabel>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="General">General</SelectItem>
                                  <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                                  <SelectItem value="Private">Private</SelectItem>
                                  <SelectItem value="ICU">ICU</SelectItem>
                                  <SelectItem value="PICU">PICU</SelectItem>
                                  <SelectItem value="NICU">NICU</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="totalRooms" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of Rooms *</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Room Setup */}
                <Collapsible open={openSections.rooms} onOpenChange={() => toggleSection("rooms")}>
                  <Card className="border-l-4 border-l-blue-500">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-accent/50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">2. Room Setup ({roomFields.length} rooms)</CardTitle>
                          {openSections.rooms ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4 pt-4">
                        {roomFields.length > 1 && (
                          <div className="flex justify-end mb-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                const firstRoom = form.getValues("rooms.0")
                                if (firstRoom) {
                                  roomFields.forEach((_, index) => {
                                    if (index > 0) {
                                      form.setValue(`rooms.${index}.roomType`, firstRoom.roomType)
                                      form.setValue(`rooms.${index}.noOfBeds`, firstRoom.noOfBeds)
                                      form.setValue(`rooms.${index}.billingClass`, firstRoom.billingClass)
                                    }
                                  })
                                  toast({
                                    title: "Applied to All Rooms",
                                    description: "Room type, bed count, and billing class from Room 1 applied to all rooms",
                                  })
                                }
                              }}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Apply Room 1 Config to All
                            </Button>
                          </div>
                        )}
                        {roomFields.map((field, index) => (
                          <div key={field.id} className="p-4 border rounded-lg space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Room {index + 1}</h4>
                              {roomFields.length > 1 && (
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeRoom(index)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField control={form.control} name={`rooms.${index}.roomNumber`} render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Room Number *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. 101" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name={`rooms.${index}.roomType`} render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Room Type *</FormLabel>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="General">General</SelectItem>
                                      <SelectItem value="Twin Sharing">Twin Sharing</SelectItem>
                                      <SelectItem value="Private">Private</SelectItem>
                                      <SelectItem value="Suite">Suite</SelectItem>
                                      <SelectItem value="ICU">ICU</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name={`rooms.${index}.noOfBeds`} render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Number of Beds *</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name={`rooms.${index}.billingClass`} render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Billing Category *</FormLabel>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Economy">Economy</SelectItem>
                                      <SelectItem value="Standard">Standard</SelectItem>
                                      <SelectItem value="Deluxe">Deluxe</SelectItem>
                                      <SelectItem value="Suite">Suite</SelectItem>
                                      <SelectItem value="ICU Tariff">ICU Tariff</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )} />
                            </div>
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => appendRoom({ roomNumber: "", roomType: "General", noOfBeds: 1, billingClass: "Economy" })}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Room
                        </Button>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Bed Features */}
                <Collapsible open={openSections.beds} onOpenChange={() => toggleSection("beds")}>
                  <Card className="border-l-4 border-l-green-500">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-accent/50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">3. Bed Features ({bedFields.length} beds)</CardTitle>
                          {openSections.beds ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4 pt-4">
                        {bedFields.length > 1 && (
                          <div className="flex justify-end mb-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                const firstBed = form.getValues("bedFeatures.0")
                                if (firstBed) {
                                  bedFields.forEach((_, index) => {
                                    if (index > 0) {
                                      form.setValue(`bedFeatures.${index}.features`, [...firstBed.features])
                                      form.setValue(`bedFeatures.${index}.nurseCall`, firstBed.nurseCall)
                                      form.setValue(`bedFeatures.${index}.isEmergencyBay`, firstBed.isEmergencyBay)
                                    }
                                  })
                                  toast({
                                    title: "Applied to All Beds",
                                    description: "Features, nurse call, and emergency priority from Bed 1 applied to all beds",
                                  })
                                }
                              }}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Apply Bed 1 Config to All
                            </Button>
                          </div>
                        )}
                        {bedFields.map((field, index) => (
                          <div key={field.id} className="p-4 border rounded-lg space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Bed {index + 1}</h4>
                              {bedFields.length > 1 && (
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeBed(index)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <FormField control={form.control} name={`bedFeatures.${index}.bedIdentifier`} render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bed ID *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. A001, ICU-01" {...field} />
                                </FormControl>
                                <FormDescription>Auto-generated or manual</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name={`bedFeatures.${index}.features`} render={({ field }) => (
                              <FormItem>
                                <FormLabel>Features</FormLabel>
                                <div className="grid grid-cols-2 gap-3">
                                  {bedFeatureOptions.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                      <Checkbox
                                        checked={field.value?.includes(option)}
                                        onCheckedChange={(checked) => {
                                          const updatedFeatures = checked
                                            ? [...(field.value || []), option]
                                            : (field.value || []).filter((f) => f !== option)
                                          field.onChange(updatedFeatures)
                                        }}
                                      />
                                      <Label className="text-sm font-normal">{option}</Label>
                                    </div>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField control={form.control} name={`bedFeatures.${index}.nurseCall`} render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                  <FormLabel>Nurse Call Facility</FormLabel>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )} />
                              <FormField control={form.control} name={`bedFeatures.${index}.isEmergencyBay`} render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                  <FormLabel>Emergency Priority</FormLabel>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )} />
                            </div>
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => appendBed({ bedIdentifier: "", features: [], nurseCall: false, isEmergencyBay: false })}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Bed
                        </Button>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Staff Mapping */}
                <Collapsible open={openSections.staff} onOpenChange={() => toggleSection("staff")}>
                  <Card className="border-l-4 border-l-purple-500">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-accent/50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">4. Nurse / Staff Allocation</CardTitle>
                          {openSections.staff ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField control={form.control} name="nurseStation" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assigned Nurse Station</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Station A, ICU Desk" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="nursePatientRatio" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nurse : Patient Ratio</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 1:5, 1:2" {...field} />
                              </FormControl>
                              <FormDescription>Standard ratio for this ward</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setShowWardSetup(false)}>Cancel</Button>
                  <Button type="submit" size="lg">
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Create Ward
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form></Form></DialogContent></Dialog><Sheet open={showBedDetails} onOpenChange={setShowBedDetails}><SheetContent className="w-full sm:max-w-lg overflow-y-auto">{selectedBed && <><SheetHeader><SheetTitle className="flex items-center gap-2"><BedIcon className="h-6 w-6" />Bed {selectedBed.bedNumber}</SheetTitle><SheetDescription>{selectedBed.wardName}  {selectedBed.type.charAt(0).toUpperCase() + selectedBed.type.slice(1)}</SheetDescription></SheetHeader><div className="mt-6 space-y-6"><div><h3 className="font-semibold mb-3 flex items-center gap-2"><AlertCircle className="h-4 w-4" />Basic Information</h3><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Ward:</span><span className="font-medium">{selectedBed.wardName}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Bed Type:</span><span className="font-medium capitalize">{selectedBed.type}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Charges:</span><span className="font-medium">₹{selectedBed.chargesPerDay}/day</span></div><div className="flex justify-between"><span className="text-muted-foreground">Status:</span>{getStatusBadge(selectedBed)}</div><div className="pt-2"><span className="text-muted-foreground">Amenities:</span><div className="flex flex-wrap gap-2 mt-2">{selectedBed.amenities.map((amenity, i) => <Badge key={i} variant="outline">{amenity}</Badge>)}</div></div></div></div>{selectedBed.isOccupied ? <div className="p-4 bg-blue-50 rounded-lg"><h3 className="font-semibold mb-3 flex items-center gap-2"><Users className="h-4 w-4" />Current Occupancy</h3><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Patient:</span><span className="font-medium">John Doe</span></div><div className="flex justify-between"><span className="text-muted-foreground">UHID:</span><span className="font-medium">PAT001</span></div><div className="flex justify-between"><span className="text-muted-foreground">Admitted:</span><span className="font-medium">2 days ago</span></div><div className="flex justify-between"><span className="text-muted-foreground">Doctor:</span><span className="font-medium">Dr. Sarah Johnson</span></div></div></div> : <div className="p-4 bg-green-50 rounded-lg"><p className="text-sm text-center text-green-800">This bed is available for new admissions</p></div>}<div><h3 className="font-semibold mb-3">Actions</h3><div className="space-y-2">{!selectedBed.isOccupied ? <Button className="w-full" onClick={handleAssignBed}><Users className="h-4 w-4 mr-2" />Assign Bed to Patient</Button> : <><Button variant="outline" className="w-full"><Activity className="h-4 w-4 mr-2" />Transfer Patient</Button><Button variant="outline" className="w-full" onClick={handleReleaseBed}><CheckCircle className="h-4 w-4 mr-2" />Release Bed</Button></>}<Button variant="outline" className="w-full"><Clock className="h-4 w-4 mr-2" />Mark for Cleaning</Button><Button variant="outline" className="w-full"><Wrench className="h-4 w-4 mr-2" />Report Maintenance</Button></div></div></div></>}</SheetContent></Sheet></AppLayout></AuthProvider>
}
