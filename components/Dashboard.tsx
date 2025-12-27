'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Target, 
  Users, 
  AlertTriangle, 
  MapPin, 
  Package, 
  Plane,
  Loader2,
  Activity
} from 'lucide-react';

interface DashboardStats {
  totalFlights: number;
  successfulHits: number;
  droneLosses: number;
  successRate: number;
  crewStats: {
    crew: string;
    flights: number;
    hits: number;
    losses: number;
    successRate: number;
  }[];
  pilotStats: {
    pilot: string;
    flights: number;
    hits: number;
    losses: number;
    successRate: number;
  }[];
  targetStats: {
    target: string;
    count: number;
  }[];
  settlementStats: {
    settlement: string;
    count: number;
  }[];
  droneTypeStats: {
    droneType: string;
    total: number;
    losses: number;
  }[];
  ammoStats: {
    ammo: string;
    count: number;
  }[];
  recentFlights: {
    time: string;
    pilot: string;
    crew: string;
    result: string;
    target: string;
    description: string;
    isDroneLoss: string;
  }[];
  hasHits: boolean;
  hasLosses: boolean;
  hasTargets: boolean;
  hasSettlements: boolean;
  hasCrews: boolean;
  hasPilots: boolean;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const fetchStats = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }
    
    try {
      const response = await fetch('/api/stats', {
        cache: 'no-store'
      });
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setStats(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Помилка завантаження даних');
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Оновлення кожні 30 секунд
    const interval = setInterval(() => fetchStats(), 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
            <Activity className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground font-medium">Завантаження статистики...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-background via-background to-muted/20">
        <Card className="max-w-md border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Помилка завантаження</h3>
                <p className="text-sm text-muted-foreground">{error || 'Не вдалося отримати дані'}</p>
              </div>
              <Button onClick={() => fetchStats()} variant="default">
                Спробувати знову
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
              Статистика вильотів
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Дані за сьогодні</span>
              <span>•</span>
              <span>Оновлено: {lastUpdate.toLocaleTimeString('uk-UA')}</span>
            </div>
          </div>
          <Button 
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            size="default"
            className="w-full md:w-auto"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Оновлення...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 mr-2" />
                Оновити дані
              </>
            )}
          </Button>
        </div>

        {/* Empty state */}
        {stats.totalFlights === 0 && (
          <Card className={`border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Очікування даних</h3>
                  <p className="text-muted-foreground max-w-md">
                    Сьогодні ще не було жодного вильоту. Статистика з`&apos;`явиться після першого запису.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main stats cards */}
        {stats.totalFlights > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={`border-muted bg-linear-to-br from-card to-muted/20 hover:border-primary/50 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Всього вильотів
                </CardTitle>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalFlights}</div>
                <p className="text-xs text-muted-foreground mt-1">операцій виконано</p>
              </CardContent>
            </Card>

            {stats.hasHits && (
              <Card className={`border-muted bg-linear-to-br from-card to-green-500/5 hover:border-green-500/50 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '300ms' }}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Успішних уражень
                  </CardTitle>
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.successfulHits}</div>
                  <p className="text-xs text-muted-foreground mt-1">цілей знищено</p>
                </CardContent>
              </Card>
            )}

            {stats.hasLosses && (
              <Card className={`border-muted bg-linear-to-br from-card to-destructive/5 hover:border-destructive/50 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms' }}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Витрати бортів
                  </CardTitle>
                  <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">{stats.droneLosses}</div>
                  <p className="text-xs text-muted-foreground mt-1">БпЛА використано</p>
                </CardContent>
              </Card>
            )}

            <Card className={`border-muted bg-linear-to-br from-card to-primary/5 hover:border-primary/50 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '500ms' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ефективність
                </CardTitle>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.successRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">успішність</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Crews and Pilots */}
        {(stats.hasCrews || stats.hasPilots) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats.hasCrews && (
              <Card className={`border-muted transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Статистика по екіпажах
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.crewStats.map((crew) => (
                      <div key={crew.crew} className="group relative overflow-hidden rounded-lg border border-border bg-muted/30 p-4 hover:bg-muted/50 hover:border-primary/30 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <p className="font-semibold text-foreground">{crew.crew}</p>
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
                                {crew.flights} вильотів
                              </span>
                              {crew.hits > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                                  {crew.hits} уражень
                                </span>
                              )}
                              {crew.losses > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-destructive/10 text-destructive">
                                  {crew.losses} втрат
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-primary">{crew.successRate}%</div>
                            <p className="text-xs text-muted-foreground">успішність</p>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 h-1 bg-linear-to-r from-primary to-primary/50 w-0 group-hover:w-full transition-all duration-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.hasPilots && (
              <Card className={`border-muted transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-primary" />
                    Топ пілоти
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.pilotStats.slice(0, 5).map((pilot, index) => (
                      <div key={pilot.pilot} className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all duration-300">
                        <div className="shrink-0 w-10 h-10 bg-linear-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center font-bold text-primary-foreground shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{pilot.pilot}</p>
                          <p className="text-sm text-muted-foreground">
                            {pilot.flights} вильотів • {pilot.hits} уражень
                            {pilot.losses > 0 && ` • ${pilot.losses} втрат`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600 dark:text-green-400">{pilot.hits}</div>
                          <p className="text-xs text-muted-foreground">{pilot.successRate}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Targets and Settlements */}
        {(stats.hasTargets || stats.hasSettlements) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats.hasTargets && (
              <Card className={`border-muted transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Топ уражених цілей
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.targetStats.slice(0, 8).map((target, index) => (
                      <div key={target.target} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/30 transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                            {index + 1}
                          </div>
                          <span className="font-medium">{target.target}</span>
                        </div>
                        <span className="text-lg font-bold text-primary">{target.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.hasSettlements && (
              <Card className={`border-muted transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Населені пункти
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.settlementStats.slice(0, 8).map((settlement, index) => (
                      <div key={settlement.settlement} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/30 transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                            {index + 1}
                          </div>
                          <span className="font-medium">{settlement.settlement}</span>
                        </div>
                        <span className="text-lg font-bold text-primary">{settlement.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Ammo and Drone Types */}
        {(stats.ammoStats.length > 0 || stats.droneTypeStats.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats.ammoStats.length > 0 && (
              <Card className={`border-muted transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Використання БК
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.ammoStats.slice(0, 8).map((ammo) => (
                      <div key={ammo.ammo} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/30 transition-all duration-200">
                        <span className="font-medium">{ammo.ammo}</span>
                        <span className="text-lg font-bold">{ammo.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.droneTypeStats.length > 0 && (
              <Card className={`border-muted transition-all duration-700 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-primary" />
                    Типи БпЛА
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.droneTypeStats.map((drone) => (
                      <div key={drone.droneType} className="p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all duration-200">
                        <p className="font-medium mb-2">{drone.droneType}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-primary font-semibold">
                            Всього: {drone.total}
                          </span>
                          {drone.losses > 0 && (
                            <span className="text-destructive font-semibold">
                              Втрачено: {drone.losses}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Recent flights */}
        {stats.recentFlights.length > 0 && (
          <Card className={`border-muted transition-all duration-700 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Останні вильоти
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentFlights.map((flight, index) => (
                  <div key={index} className="group flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all duration-300">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{flight.pilot}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{flight.crew}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(flight.time).toLocaleString('uk-UA', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {flight.description !== '-' && (
                        <p className="text-sm text-muted-foreground italic">{flight.description}</p>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        flight.isDroneLoss === 'Ні' 
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {flight.result}
                      </span>
                      {flight.target !== '-' && flight.target !== 'Ціль не уражено' && (
                        <p className="text-xs text-muted-foreground">{flight.target}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
