"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BirthdayPerson } from "@/data/birthdays";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

function isToday(birthDate: string) {
  const today = new Date();
  const date = new Date(birthDate);

  return (
    today.getDate() === date.getDate() &&
    today.getMonth() === date.getMonth()
  );
}

function generateICS(name: string, birthDate: string) {
  const date = new Date(birthDate);
  const year = new Date().getFullYear();

  const start = new Date(year, date.getMonth(), date.getDate(), 9, 0);
  const end = new Date(year, date.getMonth(), date.getDate(), 9, 30);

  const format = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return `
BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:День народження — ${name}
DTSTART:${format(start)}
DTEND:${format(end)}
RRULE:FREQ=YEARLY
END:VEVENT
END:VCALENDAR
`.trim();
}

export default function BirthdaysClient({ data }: { data: BirthdayPerson[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return data.filter(person =>
      person.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, data]);

  const handleAddToCalendar = (person: BirthdayPerson) => {
    const ics = generateICS(person.name, person.birthDate);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${person.name}.ics`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="mb-6 max-w-sm">
        <Input
          placeholder="Пошук по ПІБ..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map(person => {
          const today = isToday(person.birthDate);

          return (
            <Card
              key={person.id}
              className={`transition-shadow ${today
                ? "border-2 border-emerald-500 shadow-lg bg-emerald-50"
                : "hover:shadow-lg"
                }`}
            >
              <CardContent className="flex flex-col items-center justify-center min-h-56 text-center gap-3">
                <Avatar className="w-20 h-20">
                  {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
                  <AvatarFallback className="font-bold">{person.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <p className="mb-auto text-lg font-bold">
                  {person.name}
                </p>

                {today && (
                  <span className="text-sm font-bold text-emerald-700">
                    🎉 Святкує сьогодні
                  </span>
                )}

                {!today && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-8"
                        onClick={() => handleAddToCalendar(person)}
                      >
                        + Додати в календар
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <span>Завантажиться безпечний .ics файл</span>
                    </TooltipContent>
                  </Tooltip>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
