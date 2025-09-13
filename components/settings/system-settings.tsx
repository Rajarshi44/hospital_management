"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building, Globe, Shield, Bell, Database, Palette, Clock, Save, RefreshCw } from "lucide-react"
import { mockSystemSettings } from "@/lib/settings"
import { useToast } from "@/hooks/use-toast"

export function SystemSettingsComponent() {
  const [settings, setSettings] = useState(mockSystemSettings)
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const updatePasswordPolicy = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      passwordPolicy: { ...prev.passwordPolicy, [key]: value },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log("Saving settings:", settings)
    setHasChanges(false)
    toast({
      title: "Settings Saved",
      description: "System settings have been successfully updated",
    })
  }

  const handleReset = () => {
    setSettings(mockSystemSettings)
    setHasChanges(false)
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to default values",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="mr-2">
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Hospital Information
              </CardTitle>
              <CardDescription>Basic information about your healthcare facility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hospitalName">Hospital Name</Label>
                  <Input
                    id="hospitalName"
                    value={settings.hospitalName}
                    onChange={(e) => updateSetting("hospitalName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hospitalPhone">Phone Number</Label>
                  <Input
                    id="hospitalPhone"
                    value={settings.hospitalPhone}
                    onChange={(e) => updateSetting("hospitalPhone", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="hospitalEmail">Email Address</Label>
                <Input
                  id="hospitalEmail"
                  type="email"
                  value={settings.hospitalEmail}
                  onChange={(e) => updateSetting("hospitalEmail", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hospitalAddress">Address</Label>
                <Textarea
                  id="hospitalAddress"
                  value={settings.hospitalAddress}
                  onChange={(e) => updateSetting("hospitalAddress", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Regional Settings
              </CardTitle>
              <CardDescription>Configure timezone, date format, and currency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => updateSetting("timezone", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={settings.dateFormat} onValueChange={(value) => updateSetting("dateFormat", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => updateSetting("currency", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme & Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select value={settings.theme} onValueChange={(value) => updateSetting("theme", value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">Choose your preferred theme or use system setting</p>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={settings.language} onValueChange={(value) => updateSetting("language", value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure how and when notifications are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send notifications via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => updateSetting("smsNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security policies and session management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting("sessionTimeout", Number.parseInt(e.target.value))}
                  className="w-32"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Automatically log out users after this period of inactivity
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Password Policy</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="minLength">Minimum Length</Label>
                    <Input
                      id="minLength"
                      type="number"
                      value={settings.passwordPolicy.minLength}
                      onChange={(e) => updatePasswordPolicy("minLength", Number.parseInt(e.target.value))}
                      className="w-32"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Require Uppercase Letters</Label>
                      <Switch
                        checked={settings.passwordPolicy.requireUppercase}
                        onCheckedChange={(checked) => updatePasswordPolicy("requireUppercase", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Require Lowercase Letters</Label>
                      <Switch
                        checked={settings.passwordPolicy.requireLowercase}
                        onCheckedChange={(checked) => updatePasswordPolicy("requireLowercase", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Require Numbers</Label>
                      <Switch
                        checked={settings.passwordPolicy.requireNumbers}
                        onCheckedChange={(checked) => updatePasswordPolicy("requireNumbers", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Require Special Characters</Label>
                      <Switch
                        checked={settings.passwordPolicy.requireSpecialChars}
                        onCheckedChange={(checked) => updatePasswordPolicy("requireSpecialChars", checked)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="expirationDays">Password Expiration (days)</Label>
                    <Input
                      id="expirationDays"
                      type="number"
                      value={settings.passwordPolicy.expirationDays}
                      onChange={(e) => updatePasswordPolicy("expirationDays", Number.parseInt(e.target.value))}
                      className="w-32"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup Settings
              </CardTitle>
              <CardDescription>Configure automatic backups and data retention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Backup</Label>
                  <p className="text-sm text-muted-foreground">Enable automatic system backups</p>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => updateSetting("autoBackup", checked)}
                />
              </div>
              {settings.autoBackup && (
                <div>
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select
                    value={settings.backupFrequency}
                    onValueChange={(value) => updateSetting("backupFrequency", value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>Advanced system configuration options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium">Advanced Configuration</h3>
                <p className="text-sm text-muted-foreground">Additional system settings and maintenance tools</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { SystemSettingsComponent as SystemSettings }
