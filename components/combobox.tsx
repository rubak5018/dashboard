"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxFieldProps {
  options: string | ComboboxOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  allowCustom?: boolean
  disabled?: boolean
}

export function ComboboxField({
  options,
  value,
  onValueChange,
  placeholder = "Оберіть...",
  searchPlaceholder = "Пошук...",
  emptyText = "Не знайдено",
  allowCustom = true,
  disabled = false,
}: ComboboxFieldProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  // Знаходимо label для вибраного значення
  const selectedOption = options.find((option) => option.value === value)
  const displayValue = selectedOption?.label || value

  // Фільтруємо опції
  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options
    
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [options, searchValue])

  // Перевірка чи є точний збіг
  const exactMatch = filteredOptions.some(
    (option) => option.label.toLowerCase() === searchValue.toLowerCase()
  )

  const handleSelect = (currentValue: string) => {
    onValueChange(currentValue === value ? "" : currentValue)
    setOpen(false)
    setSearchValue("")
  }

  const handleCustomValue = () => {
    if (searchValue.trim()) {
      onValueChange(searchValue.trim())
      setOpen(false)
      setSearchValue("")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between bg-background hover:bg-muted"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value ? displayValue : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                {emptyText}
                {allowCustom && searchValue && !exactMatch && (
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCustomValue}
                      className="text-primary hover:text-primary"
                    >
                      + Додати "{searchValue}"
                    </Button>
                  </div>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
              {/* Опція для додавання власного значення */}
              {allowCustom && searchValue && !exactMatch && filteredOptions.length > 0 && (
                <CommandItem
                  value={searchValue}
                  onSelect={() => handleCustomValue()}
                  className="border-t"
                >
                  <span className="text-primary">+ Додати "{searchValue}"</span>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}