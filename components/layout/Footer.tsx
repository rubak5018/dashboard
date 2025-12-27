"use client";

export default function Footer() {
  return (
    <footer className={`relative z-10 border-t border-zinc-800/50 mt-20 transition-all duration-1000 delay-1000`}>
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} RUBAK Tactical AirForce</p>
          <p className="flex items-center gap-2">
            Оперативні дані оновлюються кожні 30 секунд
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          </p>
        </div>
      </div>
    </footer>
  );
};
