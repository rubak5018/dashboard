import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

type Option = {
  label: string;
  value: string;
};

interface ComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Оберіть або введіть",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes((value ?? "").toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Введіть значення..."
            value={value}
            onValueChange={onChange}
          />
          <CommandEmpty>
            Натисніть Enter, щоб використати власне значення
          </CommandEmpty>

          <CommandGroup>
            {filtered.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
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
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
