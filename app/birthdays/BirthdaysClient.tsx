"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Cake, Search, Sparkles } from "lucide-react";

export type BirthdayPerson = {
  id: string;
  name: string;
  birthDate: string; // DD.MM.YYYY
};

/* ================== DATE HELPERS ================== */

function parseDMY(dateStr: string): Date {
  const [day, month, year] = dateStr.split('.').map(Number);
  return new Date(year, month - 1, day);
}

function isToday(birthDate: string) {
  const today = new Date();
  const date = parseDMY(birthDate);

  return (
    today.getDate() === date.getDate() &&
    today.getMonth() === date.getMonth()
  );
}

function formatBirthDate(birthDate: string) {
  const date = parseDMY(birthDate);

  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
  }).format(date);
}

function isCurrentMonth(birthDate: string) {
  const today = new Date();
  const date = parseDMY(birthDate);

  return date.getMonth() === today.getMonth();
}

function generateICS(name: string, birthDate: string) {
  const date = parseDMY(birthDate);
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

/* ================== COMPONENT ================== */

export default function BirthdaysClient({
  data = [],
}: {
  data?: BirthdayPerson[];
}) {
  const [query, setQuery] = useState("");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return data.filter(person =>
      person.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, data]);

  const todayBirthdays = useMemo(() => {
    return filtered.filter(person => isToday(person.birthDate));
  }, [filtered]);

  const currentMonthBirthdays = useMemo(() => {
    return filtered
      .filter(person => isCurrentMonth(person.birthDate))
      .sort((a, b) => {
        const d1 = parseDMY(a.birthDate).getDate();
        const d2 = parseDMY(b.birthDate).getDate();
        return d1 - d2;
      });
  }, [filtered]);


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
    <div className="space-y-8">

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Пошук по ПІБ..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Cake className="w-4 h-4" />
          <span>Всього у цьому місяці святкують: {currentMonthBirthdays.length}</span>
        </div>
      </div>

      {/* Today */}
      {todayBirthdays.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-2xl font-bold">Святкують сьогодні</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {todayBirthdays.map(person => (
              <Card key={person.id} className="border-amber-500/50">
                <CardContent className="flex flex-col items-center gap-4 p-6">
                  <Avatar className="w-20 h-20 border-2 border-amber-500">
                    <AvatarFallback className="text-xl font-bold">
                      {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-center">
                    <p className="font-bold">{person.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatBirthDate(person.birthDate)}
                    </p>
                  </div>

                  <div className="text-amber-600 font-semibold">
                    З Днем народження!
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Current month birthdays */}
      {currentMonthBirthdays.length > 0 && (
        <div className="space-y-4 pb-10">
          <h2 className="text-xl font-bold">
            Іменинники цього місяця
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentMonthBirthdays.map(person => {
              const today = isToday(person.birthDate);

              return (
                <Card
                  key={person.id}
                  className={`relative border ${today ? 'border-amber-500 bg-amber-500/10' : ''
                    }`}
                >
                  <CardContent className="flex items-center gap-4 px-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>
                        {person.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                    {today && (
                          <span className="absolute top-1 right-2 text-amber-600 font-semibold text-xs">
                            сьогодні
                          </span>
                        )}
                      <p className="font-semibold leading-tight">
                        {person.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {/* {person.birthDate} */}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All */}
      {/* <div className="space-y-4">
        <h2 className="text-xl font-bold">
          Всі
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

          {filtered.map(person => {
            if (isToday(person.birthDate)) return null;

            return (
              <Card
                key={person.id}
                onMouseEnter={() => setHoveredCard(person.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="relative"
              >
                <CardContent className="flex flex-col items-center gap-4 p-6">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback>
                      {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-center">
                    <p className="font-bold">{person.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatBirthDate(person.birthDate)}
                    </p>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToCalendar(person)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Додати в календар
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      .ics файл для календаря
                    </TooltipContent>
                  </Tooltip>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div> */}

      {filtered.length === 0 && (
        <div className="text-center text-muted-foreground py-20">
          Нічого не знайдено
        </div>
      )}
    </div>
  );
}
