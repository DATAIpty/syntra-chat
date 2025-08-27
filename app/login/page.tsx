"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // For demo purposes, redirect to chat
      window.location.href = "/chat"
    } catch (err) {
      setError("Invalid credentials. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen syntra-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-syntra-dark-800 border-syntra-dark-600 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Image src="/syntra-logo.png" alt="Syntra" width={64} height={64} className="syntra-glow" />
            </div>
            <div>
              <CardTitle className="text-2xl font-heading font-bold text-syntra-text-primary">
                Welcome to Syntra
              </CardTitle>
              <CardDescription className="text-syntra-text-secondary mt-2">
                Sign in to access your enterprise AI assistant
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-syntra-text-primary font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-syntra-dark-700 border-syntra-dark-600 text-syntra-text-primary placeholder:text-syntra-text-muted focus:border-syntra-primary focus:ring-syntra-primary/20"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-syntra-text-primary font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-syntra-dark-700 border-syntra-dark-600 text-syntra-text-primary placeholder:text-syntra-text-muted focus:border-syntra-primary focus:ring-syntra-primary/20 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4 text-syntra-text-muted" />
                    ) : (
                      <Eye className="size-4 text-syntra-text-muted" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert className="bg-syntra-danger/10 border-syntra-danger/30">
                  <AlertDescription className="text-syntra-danger text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" variant="syntra" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="space-y-4 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-syntra-dark-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-syntra-dark-800 px-2 text-syntra-text-muted">Need access?</span>
                </div>
              </div>

              <p className="text-sm text-syntra-text-muted">
                Don't have an account? <span className="font-medium">Contact your organization administrator</span> to
                get access to Syntra.
              </p>

              <Link
                href="https://syntra.com"
                className="inline-flex items-center text-sm text-syntra-electric hover:text-syntra-electric/80 transition-colors font-medium"
              >
                Visit Syntra Platform →
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-syntra-text-muted">Powered by Syntra Enterprise AI Platform</p>
        </div>
      </div>
    </div>
  )
}
