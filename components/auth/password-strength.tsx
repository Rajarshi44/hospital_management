"use client"

import React from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
  password: string
  className?: string
}

interface PasswordCriteria {
  label: string
  test: (password: string) => boolean
  weight: number
}

const passwordCriteria: PasswordCriteria[] = [
  {
    label: "At least 8 characters",
    test: (password) => password.length >= 8,
    weight: 20,
  },
  {
    label: "Contains uppercase letter",
    test: (password) => /[A-Z]/.test(password),
    weight: 20,
  },
  {
    label: "Contains lowercase letter",
    test: (password) => /[a-z]/.test(password),
    weight: 20,
  },
  {
    label: "Contains number",
    test: (password) => /[0-9]/.test(password),
    weight: 20,
  },
  {
    label: "Contains special character",
    test: (password) => /[^A-Za-z0-9]/.test(password),
    weight: 20,
  },
]

const getStrengthLevel = (score: number) => {
  if (score < 40) return { level: "Weak", color: "text-red-500", bgColor: "bg-red-500" }
  if (score < 70) return { level: "Fair", color: "text-yellow-500", bgColor: "bg-yellow-500" }
  if (score < 90) return { level: "Good", color: "text-blue-500", bgColor: "bg-blue-500" }
  return { level: "Strong", color: "text-green-500", bgColor: "bg-green-500" }
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const score = passwordCriteria.reduce((total, criteria) => {
    return total + (criteria.test(password) ? criteria.weight : 0)
  }, 0)

  const strength = getStrengthLevel(score)

  if (!password) return null

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password strength</span>
          <span className={cn("font-medium", strength.color)}>{strength.level}</span>
        </div>
        <Progress value={score} className="h-2" />
      </div>

      <div className="space-y-1">
        {passwordCriteria.map((criteria, index) => {
          const isValid = criteria.test(password)
          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                isValid ? "text-green-600" : "text-muted-foreground"
              )}
            >
              {isValid ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <X className="h-3 w-3 text-muted-foreground" />
              )}
              <span>{criteria.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function usePasswordStrength(password: string) {
  const score = passwordCriteria.reduce((total, criteria) => {
    return total + (criteria.test(password) ? criteria.weight : 0)
  }, 0)

  const strength = getStrengthLevel(score)
  const isStrong = score >= 80
  const isValid = score >= 60

  return {
    score,
    strength: strength.level,
    color: strength.color,
    isStrong,
    isValid,
    criteria: passwordCriteria.map(criteria => ({
      ...criteria,
      isValid: criteria.test(password),
    })),
  }
}