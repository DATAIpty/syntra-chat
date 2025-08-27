"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, X } from "lucide-react"

interface MultiSelectOption {
  value: string
  label: string
  description?: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue]
    onChange(newValue)
  }

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue))
  }

  const selectedOptions = options.filter((option) => value.includes(option.value))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-10 h-auto bg-syntra-dark-700 border-syntra-dark-600 hover:bg-syntra-dark-600",
            className,
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="bg-syntra-electric/20 text-syntra-electric border-syntra-electric/30 hover:bg-syntra-electric/30"
                >
                  {option.label}
                  <button
                    className="ml-1 hover:bg-syntra-electric/40 rounded-full"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleRemove(option.value)
                    }}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-syntra-text-muted">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-syntra-dark-800 border-syntra-dark-600">
        <div className="max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-start space-x-3 p-3 hover:bg-syntra-dark-700 cursor-pointer"
              onClick={() => handleToggle(option.value)}
            >
              <Checkbox
                checked={value.includes(option.value)}
                className="mt-0.5 border-syntra-dark-600 data-[state=checked]:bg-syntra-electric data-[state=checked]:border-syntra-electric"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-syntra-text-primary">{option.label}</div>
                {option.description && <div className="text-xs text-syntra-text-muted">{option.description}</div>}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
