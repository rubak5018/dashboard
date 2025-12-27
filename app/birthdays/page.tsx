import { BIRTHDAYS } from "@/data/birthdays";
import BirthdaysClient from "./birthdays-client";

export default function BirthdaysPage() {
  const currentMonth = new Date().getMonth(); // 0–11

  const currentMonthBirthdays = BIRTHDAYS.filter(person => {
    const month = new Date(person.birthDate).getMonth();
    return month === currentMonth;
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Іменинники місяця
      </h1>

      <BirthdaysClient data={currentMonthBirthdays} />
    </div>
  );
}
