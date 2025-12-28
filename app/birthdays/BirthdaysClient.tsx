"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Cake, Search, Sparkles, PartyPopper } from "lucide-react";

export type BirthdayPerson = {
  id: string;
  name: string;
  birthDate: string; // ISO формат: YYYY-MM-DD
};

/* ================== DATE HELPERS ================== */

function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function isToday(birthDate: string) {
  const today = new Date();
  const date = parseISODate(birthDate);

  return (
    today.getDate() === date.getDate() &&
    today.getMonth() === date.getMonth()
  );
}

function isThisMonth(birthDate: string) {
  const today = new Date();
  const date = parseISODate(birthDate);
  return today.getMonth() === date.getMonth();
}

// function getCurrentMonthName() {
//   return new Intl.DateTimeFormat("uk-UA", {
//     month: "long"
//   }).format(new Date());
// }

function formatBirthDate(birthDate: string) {
  const date = parseISODate(birthDate);

  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
  }).format(date);
}

function formatDayMonth(birthDate: string) {
  const date = parseISODate(birthDate);
  
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function generateICS(name: string, birthDate: string) {
  const date = parseISODate(birthDate);
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

  // Фільтруємо по пошуку (шукаємо по ВСІХ людях)
  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    return data.filter(person =>
      person.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, data]);

  // Іменинники сьогодні
  const todayBirthdays = useMemo(() => {
    return data.filter(person => isToday(person.birthDate));
  }, [data]);

  // Іменинники цього місяця (без сьогоднішніх)
  const thisMonthBirthdays = useMemo(() => {
    return data
      .filter(person => isThisMonth(person.birthDate) && !isToday(person.birthDate))
      .sort((a, b) => {
        // Сортуємо по дню місяця
        const dayA = parseISODate(a.birthDate).getDate();
        const dayB = parseISODate(b.birthDate).getDate();
        return dayA - dayB;
      });
  }, [data]);

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

  const showSearchResults = query.trim().length > 0;

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in-50 duration-500">
        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Пошук по ПІБ..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-zinc-800 focus-visible:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Cake className="w-4 h-4" />
            <span>Всього: {data.length} осіб</span>
          </div>
        </div>

        {/* Якщо є пошуковий запит - показуємо результати пошуку */}
        {showSearchResults ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              Результати пошуку ({filtered.length})
            </h2>
            
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map(person => (
                  <Card
                    key={person.id}
                    className="border-muted bg-gradient-to-br from-card to-muted/20 hover:border-primary/50 transition-all duration-300"
                  >
                    <CardContent className="flex flex-col items-center justify-center min-h-[200px] text-center gap-3 p-6">
                      <Avatar className="w-16 h-16 border-2 border-border">
                        <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                          {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-1">
                        <p className="font-bold">{person.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
                          <Cake className="w-3 h-3" />
                          {formatBirthDate(person.birthDate)}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToCalendar(person)}
                        className="mt-2"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        В календар
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Нічого не знайдено</h3>
                <p className="text-muted-foreground">
                  Спробуйте змінити запит пошуку
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Today's birthdays */}
            {todayBirthdays.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                    Святкують сьогодні
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {todayBirthdays.map(person => (
                    <Card
                      key={person.id}
                      className="relative overflow-hidden border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-orange-500/10 animate-in fade-in-50 slide-in-from-bottom-5 duration-500"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-50 blur-2xl" />
                      
                      <CardContent className="relative flex flex-col items-center justify-center min-h-[240px] text-center gap-4 p-6">
                        <div className="absolute top-4 right-4">
                          <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 rounded-full">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span className="text-xs font-semibold text-amber-500">Сьогодні</span>
                          </div>
                        </div>

                        <Avatar className="w-20 h-20 border-2 border-amber-500 shadow-lg shadow-amber-500/20">
                          <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                            {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                          <p className="text-lg font-bold">{person.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
                            <Cake className="w-3 h-3" />
                            {formatBirthDate(person.birthDate)}
                          </p>
                        </div>

                        <div className="mt-2 px-4 py-2 bg-amber-500/20 rounded-lg">
                          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                            🎉 З Днем народження!
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* This month birthdays */}
            {thisMonthBirthdays.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <PartyPopper className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-bold">
                    Іменинники місяця
                  </h2>
                </div>

                {/* Список у вигляді компактних карток */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {thisMonthBirthdays.map((person) => (
                    <Card
                      key={person.id}
                      className="group border-muted hover:border-primary/50 transition-all duration-300 hover:shadow-md"
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <Avatar className="w-12 h-12 border-2 border-border group-hover:border-primary/50 transition-colors">
                          <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                            {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{person.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDayMonth(person.birthDate)}
                          </p>
                        </div>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddToCalendar(person)}
                              className="shrink-0"
                            >
                              <Calendar className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            Додати в календар
                          </TooltipContent>
                        </Tooltip>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state - коли немає ні сьогоднішніх, ні місячних */}
            {todayBirthdays.length === 0 && thisMonthBirthdays.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Cake className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Цього місяця немає іменинників
                </h3>
                <p className="text-muted-foreground">
                  Використовуйте пошук для перегляду всіх днів народження
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </TooltipProvider>
  );
}