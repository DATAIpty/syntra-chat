"use client"

import React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Bell, Shield, Palette, Upload } from "lucide-react"
import type { User as UserType } from "@/types"

interface UserSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserType
  onUpdateUser: (user: Partial<UserType>) => void
}

export function UserSettingsModal({ open, onOpenChange, user, onUpdateUser }: UserSettingsModalProps) {
  const [name, setName] = React.useState(user.name)
  const [email, setEmail] = React.useState(user.email)
  const [notifications, setNotifications] = React.useState(true)
  const [soundEnabled, setSoundEnabled] = React.useState(true)
  const [theme, setTheme] = React.useState("dark")
  const [language, setLanguage] = React.useState("en")

  const handleSave = () => {
    onUpdateUser({
      name: name.trim(),
      email: email.trim(),
    })
    onOpenChange(false)
  }

  const handleAvatarUpload = () => {
    // Placeholder for avatar upload functionality
    console.log("Avatar upload clicked")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-syntra-dark-800 border-syntra-dark-600 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-syntra-text-primary font-heading text-xl">User Settings</DialogTitle>
          <DialogDescription className="text-syntra-text-secondary">
            Manage your profile and application preferences.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-syntra-dark-700">
            <TabsTrigger value="profile" className="data-[state=active]:bg-syntra-primary">
              <User className="size-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-syntra-primary">
              <Bell className="size-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-syntra-primary">
              <Shield className="size-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-syntra-primary">
              <Palette className="size-4 mr-2" />
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card className="bg-syntra-dark-700 border-syntra-dark-600">
              <CardHeader>
                <CardTitle className="text-syntra-text-primary">Profile Information</CardTitle>
                <CardDescription className="text-syntra-text-secondary">
                  Update your personal information and avatar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="size-20 border-2 border-syntra-electric">
                    <div className="size-full bg-syntra-primary rounded-full flex items-center justify-center text-2xl font-bold text-syntra-text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </Avatar>
                  <Button
                    variant="outline"
                    onClick={handleAvatarUpload}
                    className="bg-syntra-dark-600 border-syntra-dark-500 hover:bg-syntra-dark-500"
                  >
                    <Upload className="size-4 mr-2" />
                    Upload Avatar
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-syntra-text-primary font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-syntra-dark-600 border-syntra-dark-500 text-syntra-text-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-syntra-text-primary font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-syntra-dark-600 border-syntra-dark-500 text-syntra-text-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-syntra-text-primary font-medium">Organization</Label>
                  <Input
                    value={user.organization}
                    disabled
                    className="bg-syntra-dark-600 border-syntra-dark-500 text-syntra-text-muted"
                  />
                  <p className="text-xs text-syntra-text-muted">
                    Contact your administrator to change organization settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card className="bg-syntra-dark-700 border-syntra-dark-600">
              <CardHeader>
                <CardTitle className="text-syntra-text-primary">Notification Preferences</CardTitle>
                <CardDescription className="text-syntra-text-secondary">
                  Choose how you want to be notified about conversations and updates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-syntra-text-primary font-medium">Push Notifications</Label>
                    <p className="text-sm text-syntra-text-muted">Receive notifications for new messages</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-syntra-text-primary font-medium">Sound Effects</Label>
                    <p className="text-sm text-syntra-text-muted">Play sounds for message notifications</p>
                  </div>
                  <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6 mt-6">
            <Card className="bg-syntra-dark-700 border-syntra-dark-600">
              <CardHeader>
                <CardTitle className="text-syntra-text-primary">Privacy & Security</CardTitle>
                <CardDescription className="text-syntra-text-secondary">
                  Manage your privacy settings and data preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-syntra-text-primary font-medium">Data Collection</Label>
                      <p className="text-sm text-syntra-text-muted">Allow usage analytics to improve the service</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-syntra-text-primary font-medium">Conversation History</Label>
                      <p className="text-sm text-syntra-text-muted">Save conversation history for future reference</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="pt-4 border-t border-syntra-dark-600">
                  <Button variant="destructive" className="w-full">
                    Delete All Conversation Data
                  </Button>
                  <p className="text-xs text-syntra-text-muted mt-2 text-center">
                    This action cannot be undone. All your conversations will be permanently deleted.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6 mt-6">
            <Card className="bg-syntra-dark-700 border-syntra-dark-600">
              <CardHeader>
                <CardTitle className="text-syntra-text-primary">Appearance Settings</CardTitle>
                <CardDescription className="text-syntra-text-secondary">
                  Customize the look and feel of your chat interface.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-syntra-text-primary font-medium">Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="bg-syntra-dark-600 border-syntra-dark-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-syntra-dark-800 border-syntra-dark-600">
                      <SelectItem value="dark" className="text-syntra-text-primary hover:bg-syntra-dark-700">
                        Dark Theme
                      </SelectItem>
                      <SelectItem value="light" className="text-syntra-text-primary hover:bg-syntra-dark-700" disabled>
                        Light Theme (Coming Soon)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-syntra-text-primary font-medium">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="bg-syntra-dark-600 border-syntra-dark-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-syntra-dark-800 border-syntra-dark-600">
                      <SelectItem value="en" className="text-syntra-text-primary hover:bg-syntra-dark-700">
                        English
                      </SelectItem>
                      <SelectItem value="es" className="text-syntra-text-primary hover:bg-syntra-dark-700" disabled>
                        Spanish (Coming Soon)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-6 border-t border-syntra-dark-600">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 hover:bg-syntra-dark-700">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="syntra" className="flex-1">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
