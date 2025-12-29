'use client'

import React, { useState, useEffect } from 'react';
import { AlertCircle, Target, TrendingUp, Shield, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalFlights: number;
  successfulHits: number;
  droneLosses: number;
  successRate: number;
}

export default function RubakDashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
    fetchStats();

    // Оновлення кожні 30 секунд
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_STATS_URL;
      
      if (!SCRIPT_URL) {
        console.error('Google Script Stats URL not configured');
        return [];
      }
  
      const response = await fetch(SCRIPT_URL, {
        cache: 'no-store',
        next: { revalidate: 300 }
      });
  
      if (!response.ok) {
        console.error(`Fetch error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Формуємо дані для карток з реальної статистики
  const statCards = stats ? [
    { 
      id: 1, 
      label: 'Вильоти', 
      value: stats.totalFlights.toString(), 
      icon: Target, 
      change: stats.totalFlights > 0 ? '+' + stats.totalFlights : '0', 
      color: 'from-amber-500 to-orange-600' 
    },
    { 
      id: 2, 
      label: 'Втрати', 
      value: stats.droneLosses.toString(), 
      icon: AlertCircle, 
      change: stats.droneLosses > 0 ? '-' + stats.droneLosses : '0', 
      color: 'from-red-500 to-red-700' 
    },
    { 
      id: 3, 
      label: 'Ураження', 
      value: stats.successfulHits.toString(), 
      icon: Shield, 
      change: stats.successfulHits > 0 ? '+' + stats.successfulHits : '0', 
      color: 'from-amber-400 to-yellow-500' 
    },
    { 
      id: 4, 
      label: 'Ефективність', 
      value: stats.successRate + '%', 
      icon: TrendingUp, 
      change: stats.successRate > 0 ? '+' + stats.successRate + '%' : '0%', 
      color: 'from-green-500 to-emerald-600' 
    }
  ] : [
    { id: 1, label: 'Вильоти', value: '—', icon: Target, change: '—', color: 'from-amber-500 to-orange-600' },
    { id: 2, label: 'Втрати', value: '—', icon: AlertCircle, change: '—', color: 'from-red-500 to-red-700' },
    { id: 3, label: 'Ураження', value: '—', icon: Shield, change: '—', color: 'from-amber-400 to-yellow-500' },
    { id: 4, label: 'Ефективність', value: '—', icon: TrendingUp, change: '—', color: 'from-green-500 to-emerald-600' }
  ];

  return (
    <div className="min-h-screen text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className={`text-center mb-20 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-6xl lg:text-8xl font-black mb-6 bg-linear-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
            ОПЕРАЦІЙНИЙ ЦЕНТР
          </h2>
          <p className="text-zinc-400 md:text-lg max-w-2xl mx-auto">
            Зведена оперативна інформація в режимі реального часу
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                onMouseEnter={() => setActiveCard(stat.id)}
                onMouseLeave={() => setActiveCard(null)}
                className={`group relative bg-linear-to-br from-zinc-900/50 to-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 hover:border-amber-500/50 transition-all duration-500 cursor-pointer ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${400 + index * 100}ms` }}
              >
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-linear-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500 blur-xl`} />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-linear-to-br ${stat.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      stat.change.startsWith('+') 
                        ? 'bg-green-500/20 text-green-400' 
                        : stat.change.startsWith('-')
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-zinc-500/20 text-zinc-400'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  
                  <h3 className="text-4xl font-black mb-2 group-hover:scale-105 transition-transform duration-300">
                    {loading && stat.value === '—' ? (
                      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    ) : (
                      stat.value
                    )}
                  </h3>
                  <p className="text-zinc-500 uppercase text-xs tracking-wider font-semibold">
                    {stat.label}
                  </p>
                  
                  {/* Animated underline */}
                  <div className={`h-1 bg-linear-to-br ${stat.color} rounded-full mt-4 transition-all duration-500 ${
                    activeCard === stat.id ? 'w-full' : 'w-0'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Link href="/dashboard">
            <div className="group relative bg-linear-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 hover:border-amber-500/50 transition-all duration-500 overflow-hidden cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-2xl font-black mb-3 relative z-10">Оперативна статистика</h3>
              <p className="text-zinc-400 mb-4 relative z-10">
                Детальна статистика вильотів за сьогодні
              </p>
              <div className="flex items-center space-x-2 text-amber-500 font-bold group-hover:translate-x-2 transition-transform duration-300 relative z-10">
                <span>Переглянути</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </Link>

          <Link href="/reports/new">
            <div className="group relative bg-linear-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 hover:border-amber-500/50 transition-all duration-500 overflow-hidden cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-orange-600/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-2xl font-black mb-3 relative z-10">Новий звіт</h3>
              <p className="text-zinc-400 mb-4 relative z-10">
                Створити звіт про виліт FPV-дрону
              </p>
              <div className="flex items-center space-x-2 text-amber-500 font-bold group-hover:translate-x-2 transition-transform duration-300 relative z-10">
                <span>Заповнити форму</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </div>

        {/* Stats summary for today */}
        {stats && stats.totalFlights > 0 && (
          <div className={`mt-12 text-center transition-all duration-1000 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex md:inline-flex flex-col md:flex-row items-center justify-center gap-6 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl px-8 py-4">
              <div className="text-center md:text-left">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">За сьогодні</p>
                <p className="text-2xl font-black text-amber-500">{stats.totalFlights} операцій</p>
              </div>
              <div className="w-1/2 h-px md:w-px md:h-12 bg-zinc-800" />
              <div className="text-center md:text-left">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Ефективність</p>
                <p className="text-2xl font-black text-green-500">{stats.successRate}%</p>
              </div>
              <div className="w-1/2 h-px md:w-px md:h-12 bg-zinc-800" />
              <div className="text-center md:text-left">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Статус</p>
                <p className="text-sm font-bold text-green-500 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" ></span>
                  Активний
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
