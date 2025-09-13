"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Package, AlertTriangle, Calendar, Plus, Pill, ShoppingCart } from "lucide-react"
import { mockInventory, getInventoryAlerts, getExpiringMedications } from "@/lib/pharmacy"
import { format } from "date-fns"

export function InventoryDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredInventory, setFilteredInventory] = useState(mockInventory)

  const alerts = getInventoryAlerts()
  const expiringMeds = getExpiringMedications()

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredInventory(mockInventory)
    } else {
      const lowercaseQuery = query.toLowerCase()
      setFilteredInventory(
        mockInventory.filter(
          (item) =>
            item.medication.name.toLowerCase().includes(lowercaseQuery) ||
            item.medication.brand.toLowerCase().includes(lowercaseQuery) ||
            item.batchNumber.toLowerCase().includes(lowercaseQuery) ||
            item.location.toLowerCase().includes(lowercaseQuery),
        ),
      )
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "low-stock":
        return "bg-yellow-100 text-yellow-800"
      case "out-of-stock":
        return "bg-red-100 text-red-800"
      case "expired":
        return "bg-gray-100 text-gray-800"
      case "recalled":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStockPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100)
  }

  const totalValue = mockInventory.reduce((sum, item) => sum + item.currentStock * item.unitCost, 0)
  const lowStockCount = alerts.length
  const totalItems = mockInventory.reduce((sum, item) => sum + item.currentStock, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all medications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Units in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Items need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{expiringMeds.length}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">All Inventory</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="expiring">Expiring ({expiringMeds.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medications, batch numbers, or locations..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            <Button variant="outline">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>Manage your medication inventory and stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.medication.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.medication.strength}
                            {item.medication.unit} • {item.medication.form}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.batchNumber}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>
                              {item.currentStock} / {item.maximumStock}
                            </span>
                            <span className="text-muted-foreground">
                              {Math.round(getStockPercentage(item.currentStock, item.maximumStock))}%
                            </span>
                          </div>
                          <Progress value={getStockPercentage(item.currentStock, item.maximumStock)} className="h-2" />
                          <div className="text-xs text-muted-foreground">Min: {item.minimumStock}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(item.expiryDate, "MMM d, yyyy")}
                          <div className="text-xs text-muted-foreground">
                            {Math.ceil((item.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>${(item.currentStock * item.unitCost).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Stock Alerts
              </CardTitle>
              <CardDescription>Items that require immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No stock alerts at this time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200"
                    >
                      <div className="flex items-center gap-4">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <h4 className="font-medium">{item.medication.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Current: {item.currentStock} • Minimum: {item.minimumStock} • Location: {item.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        <Button size="sm">Reorder</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                Expiring Medications
              </CardTitle>
              <CardDescription>Items expiring within the next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {expiringMeds.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No medications expiring soon</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expiringMeds.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 border-orange-200"
                    >
                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-orange-600" />
                        <div>
                          <h4 className="font-medium">{item.medication.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Batch: {item.batchNumber} • Stock: {item.currentStock} • Location: {item.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-orange-600">{format(item.expiryDate, "MMM d, yyyy")}</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.ceil((item.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
