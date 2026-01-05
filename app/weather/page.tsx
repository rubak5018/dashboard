'use client'

import { useState, useEffect, ReactNode } from 'react';
import { Cloud, Wind, Droplets, Eye, AlertTriangle, CheckCircle, XCircle, Plane, Calendar, Clock, RefreshCw, Loader2, Activity, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeatherAPIService } from '../services/weatherApiService';
import { MeteosourceService } from '../services/meteoSourceAPIService';

// Інтерфейси
interface DroneType {
    name: string;
    maxWind: number;
    maxRain: number;
    minVisibility: number;
    minTemp: number;
    maxTemp: number;
    range: string;
    altitude: string;
}

interface WeatherData {
    temp: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    windGusts: number;
    cloudCover: number;
    source: string;
}

interface HourlyForecast {
    time: Date;
    temp: number;
    precipitation: number;
    windSpeed: number;
    cloudCover: number;
}

interface DailyForecast {
    date: Date;
    tempMax: number;
    tempMin: number;
    precipitation: number;
    windSpeed: number;
}

interface ForecastData {
    hourly: HourlyForecast[];
    daily: DailyForecast[];
}

interface Condition {
    status: 'good' | 'warning' | 'bad';
    message: string;
}

interface Analysis {
    canFly: boolean;
    conditions: Condition[];
}

interface WeatherSource {
    name: string;
    description: string;
    color: string;
}

type ViewMode = 'current' | 'hourly' | 'daily';

const DroneWeatherWidget: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [location] = useState<string>('Petropavlivka');
    const [lat] = useState<number>(48.53);
    const [lon] = useState<number>(35.07);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedDrone, setSelectedDrone] = useState<string>('fpv');
    const [weatherSource, setWeatherSource] = useState<string>('openmeteo');
    const [viewMode, setViewMode] = useState<ViewMode>('current');
    const [comparison, setComparison] = useState<Record<string, WeatherData> | null>(null);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const droneTypes: Record<string, DroneType> = {
        fpv: {
            name: 'FPV дрон',
            maxWind: 15,
            maxRain: 0,
            minVisibility: 1000,
            minTemp: -10,
            maxTemp: 45,
            range: '10 км',
            altitude: '500 м'
        },
        mavic: {
            name: 'Mavic/DJI',
            maxWind: 10,
            maxRain: 0,
            minVisibility: 2000,
            minTemp: -10,
            maxTemp: 40,
            range: '8 км',
            altitude: '500 м'
        },
        heavy: {
            name: 'Важкий БПЛА',
            maxWind: 20,
            maxRain: 2,
            minVisibility: 3000,
            minTemp: -20,
            maxTemp: 50,
            range: '20 км',
            altitude: '1000 м'
        },
        recon_wing: {
            name: 'Розвідувальне крило',
            maxWind: 18,
            maxRain: 1,
            minVisibility: 3000,
            minTemp: -15,
            maxTemp: 45,
            range: '40 км',
            altitude: '1200 м'
        },
        strike_wing: {
            name: 'Ударне крило',
            maxWind: 16,
            maxRain: 1,
            minVisibility: 2500,
            minTemp: -15,
            maxTemp: 45,
            range: '30 км',
            altitude: '800 м'
        }
    };

    const weatherSources: Record<string, WeatherSource> = {
        openmeteo: {
            name: 'Open-Meteo',
            description: 'Безкоштовно, оновлення кожні 15 хв',
            color: 'blue'
        },
        weatherapi: {
            name: 'WeatherAPI',
            description: 'Високоточний прогноз до 14 днів',
            color: 'green'
        },
        meteosource: {
            name: 'Meteosource',
            description: 'Підвищена точність для України',
            color: 'purple'
        }
    };

    useEffect(() => {
        fetchWeatherData();
    }, [location, weatherSource]);

    const fetchWeatherData = async (isManualRefresh: boolean = false): Promise<void> => {
        if (isManualRefresh) {
            setIsRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            if (weatherSource === 'openmeteo') {
                await fetchOpenMeteo();
            } else if (weatherSource === 'weatherapi') {
                await fetchWeatherAPI();
            } else if (weatherSource === 'meteosource') {
                await fetchMeteosource();
            }
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Помилка завантаження погоди:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const fetchOpenMeteo = async (): Promise<void> => {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_gusts_10m,cloud_cover&hourly=temperature_2m,precipitation,wind_speed_10m,cloud_cover&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`,
            { next: { revalidate: 3600 } } as any
        );
        const data = await response.json();

        setWeather({
            temp: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            precipitation: data.current.precipitation,
            windSpeed: data.current.wind_speed_10m,
            windGusts: data.current.wind_gusts_10m,
            cloudCover: data.current.cloud_cover,
            source: 'openmeteo'
        });

        setForecast({
            hourly: data.hourly.time.slice(0, 48).map((time: string, i: number) => ({
                time: new Date(time),
                temp: data.hourly.temperature_2m[i],
                precipitation: data.hourly.precipitation[i],
                windSpeed: data.hourly.wind_speed_10m[i],
                cloudCover: data.hourly.cloud_cover[i]
            })),
            daily: data.daily.time.map((time: string, i: number) => ({
                date: new Date(time),
                tempMax: data.daily.temperature_2m_max[i],
                tempMin: data.daily.temperature_2m_min[i],
                precipitation: data.daily.precipitation_sum[i],
                windSpeed: data.daily.wind_speed_10m_max[i]
            }))
        });
    };

    const fetchWeatherAPI = async (): Promise<void> => {
        try {
            const apiKey = process.env.NEXT_PUBLIC_WEATHERAPI_KEY;
            if (!apiKey) {
                console.warn('WeatherAPI key not found');
                return;
            }

            const service = new WeatherAPIService(apiKey);
            const { current, forecast: forecastData } = await service.fetchWeather(lat, lon, 7);

            setWeather(current);
            setForecast(forecastData);
        } catch (error) {
            console.error('Failed to fetch WeatherAPI data:', error);
        }
    };

    const fetchMeteosource = async (): Promise<void> => {
        try {
            const apiKey = process.env.NEXT_PUBLIC_METEOSOURCE_KEY;
            if (!apiKey) {
                console.warn('Meteosource API key not found');
                return;
            }

            const service = new MeteosourceService(apiKey);
            const { current, forecast: forecastData } = await service.fetchWeather(lat, lon);

            setWeather(current);
            setForecast(forecastData);
        } catch (error) {
            console.error('Failed to fetch Meteosource data:', error);
        }
    };

    const compareAllSources = async (): Promise<void> => {
        setIsRefreshing(true);
        const sources = ['openmeteo', 'weatherapi', 'meteosource'];
        const results: Record<string, WeatherData> = {};

        for (const source of sources) {
            const originalSource = weatherSource;
            setWeatherSource(source);
            await new Promise(resolve => setTimeout(resolve, 500));

            if (source === 'openmeteo') await fetchOpenMeteo();
            else if (source === 'weatherapi') await fetchWeatherAPI();
            else await fetchMeteosource();

            if (weather) {
                results[source] = { ...weather };
            }
            setWeatherSource(originalSource);
        }

        setComparison(results);
        setIsRefreshing(false);
    };

    const analyzeFlightConditions = (weatherData: WeatherData | null): Analysis | null => {
        if (!weatherData) return null;

        const drone = droneTypes[selectedDrone];
        const conditions: Condition[] = [];
        let canFly = true;

        if (weatherData.windSpeed > drone.maxWind) {
            conditions.push({
                status: 'bad',
                message: `Вітер ${weatherData.windSpeed.toFixed(1)} м/с (макс: ${drone.maxWind} м/с)`
            });
            canFly = false;
        } else if (weatherData.windSpeed > drone.maxWind * 0.7) {
            conditions.push({
                status: 'warning',
                message: `Вітер ${weatherData.windSpeed.toFixed(1)} м/с (близько до межі)`
            });
        } else {
            conditions.push({
                status: 'good',
                message: `Вітер ${weatherData.windSpeed.toFixed(1)} м/с (прийнятно)`
            });
        }

        if (weatherData.precipitation > drone.maxRain) {
            conditions.push({
                status: 'bad',
                message: `Опади ${weatherData.precipitation} мм (макс: ${drone.maxRain} мм)`
            });
            canFly = false;
        } else if (weatherData.precipitation > 0) {
            conditions.push({
                status: 'warning',
                message: `Легкі опади ${weatherData.precipitation} мм`
            });
        } else {
            conditions.push({
                status: 'good',
                message: 'Без опадів'
            });
        }

        if (weatherData.temp < drone.minTemp || weatherData.temp > drone.maxTemp) {
            conditions.push({
                status: 'bad',
                message: `Температура ${weatherData.temp.toFixed(1)}°C (за межами діапазону)`
            });
            canFly = false;
        } else {
            conditions.push({
                status: 'good',
                message: `Температура ${weatherData.temp.toFixed(1)}°C (нормально)`
            });
        }

        if (weatherData.cloudCover > 80) {
            conditions.push({
                status: 'warning',
                message: `Хмарність ${weatherData.cloudCover}% (погана видимість)`
            });
        } else {
            conditions.push({
                status: 'good',
                message: `Хмарність ${weatherData.cloudCover}%`
            });
        }

        return { canFly, conditions };
    };

    const renderHourlyForecast = (): ReactNode | null => {
        if (!forecast?.hourly) return null;

        return (
            <div className={`space-y-4 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Clock className="w-6 h-6 text-primary" />
                    Погодинний прогноз (48 годин)
                </h3>
                <div className="overflow-x-auto pb-3">
                    <div className="flex gap-3">
                        {forecast.hourly.map((hour, i) => {
                            const hourAnalysis = analyzeFlightConditions({
                                temp: hour.temp,
                                precipitation: hour.precipitation,
                                windSpeed: hour.windSpeed,
                                cloudCover: hour.cloudCover,
                                humidity: 70,
                                windGusts: hour.windSpeed * 1.5,
                                source: 'forecast'
                            });

                            return (
                                <div
                                    key={i}
                                    className={`flex-shrink-0 w-48 p-4 rounded-lg border ${hourAnalysis?.canFly
                                        ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40'
                                        : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                                        }`}
                                >
                                    <div className="text-sm font-semibold mb-2">
                                        {hour.time.toLocaleString('uk-UA', {
                                            day: 'numeric',
                                            month: 'numeric',
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false
                                        })}
                                    </div>
                                    <div className="flex flex-col gap-y-1 text-sm min-h-28">
                                        <div className="flex items-center gap-1">
                                            <Cloud className="w-4 h-4 text-muted-foreground" />
                                            <span>{hour.temp.toFixed(0)}°C</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Wind className="w-4 h-4 text-primary" />
                                            <span>{hour.windSpeed.toFixed(0)} м/с</span>
                                        </div>
                                        {hour.precipitation > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Droplets className="w-4 h-4 text-blue-400" />
                                                <span>{hour.precipitation.toFixed(1)} мм</span>
                                            </div>
                                        )}
                                        <div className={`text-xs font-semibold mt-auto rounded py-1 text-center ${hourAnalysis?.canFly ? 'text-green-600 bg-green-600/10 dark:text-green-400' : 'text-red-600 bg-red-600/10 dark:text-red-400'
                                            }`}>
                                            {hourAnalysis?.canFly ? '✓ Можна' : '✗ Не можна'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderDailyForecast = (): ReactNode | null => {
        if (!forecast?.daily) return null;

        return (
            <div className={`space-y-4 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary" />
                    Денний прогноз (7 днів)
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {forecast.daily.map((day, i) => {
                        const dayAnalysis = analyzeFlightConditions({
                            temp: (day.tempMax + day.tempMin) / 2,
                            precipitation: day.precipitation,
                            windSpeed: day.windSpeed,
                            cloudCover: 50,
                            humidity: 70,
                            windGusts: day.windSpeed * 1.5,
                            source: 'forecast'
                        });

                        return (
                            <div
                                key={i}
                                className={`p-4 rounded-lg border transition-all duration-300 ${dayAnalysis?.canFly
                                    ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40'
                                    : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                                    }`}
                            >
                                <div className="font-bold mb-3">
                                    {day.date.toLocaleDateString('uk-UA', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </div>
                                <div className="flex flex-col gap-y-2 min-h-32 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Температура:</span>
                                        <span className="font-semibold">
                                            {day.tempMin.toFixed(0)}°...{day.tempMax.toFixed(0)}°C
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Вітер:</span>
                                        <span className="font-semibold">{day.windSpeed.toFixed(0)} м/с</span>
                                    </div>
                                    {day.precipitation > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Опади:</span>
                                            <span className="font-semibold">{day.precipitation.toFixed(1)} мм</span>
                                        </div>
                                    )}
                                    <div className={`text-center font-bold mt-auto p-2 rounded ${dayAnalysis?.canFly ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'
                                        }`}>
                                        {dayAnalysis?.canFly ? '✓ Сприятливо' : '✗ Несприятливо'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderComparison = (): ReactNode | null => {
        if (!comparison) return null;

        return (
            <div className={`mt-6 bg-card border rounded-lg p-6 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Порівняння джерел даних
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-2 font-semibold">Параметр</th>
                                {Object.keys(comparison).map(source => (
                                    <th key={source} className="text-center py-3 px-2 font-semibold">
                                        {weatherSources[source].name}
                                    </th>
                                ))}
                                <th className="text-center py-3 px-2 font-semibold">Різниця</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="py-3 px-2 font-medium">Температура</td>
                                {Object.values(comparison).map((data, i) => (
                                    <td key={i} className="text-center py-3 px-2 font-semibold">{data.temp?.toFixed(1) ?? 0}°C</td>
                                ))}
                                <td className="text-center py-3 px-2 text-muted-foreground">
                                    {(Math.max(...Object.values(comparison).map(d => d.temp)) -
                                        Math.min(...Object.values(comparison).map(d => d.temp))).toFixed(1)}°C
                                </td>
                            </tr>
                            <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="py-3 px-2 font-medium">Вітер</td>
                                {Object.values(comparison).map((data, i) => (
                                    <td key={i} className="text-center py-3 px-2 font-semibold">{data.windSpeed?.toFixed(1) ?? 0} м/с</td>
                                ))}
                                <td className="text-center py-3 px-2 text-muted-foreground">
                                    {(Math.max(...Object.values(comparison).map(d => d.windSpeed)) -
                                        Math.min(...Object.values(comparison).map(d => d.windSpeed))).toFixed(1)} м/с
                                </td>
                            </tr>
                            <tr className="hover:bg-muted/50 transition-colors">
                                <td className="py-3 px-2 font-medium">Хмарність</td>
                                {Object.values(comparison).map((data, i) => (
                                    <td key={i} className="text-center py-3 px-2 font-semibold">{data.cloudCover?.toFixed(0) ?? 0}%</td>
                                ))}
                                <td className="text-center py-3 px-2 text-muted-foreground">
                                    {(Math.max(...Object.values(comparison).map(d => d.cloudCover)) -
                                        Math.min(...Object.values(comparison).map(d => d.cloudCover))).toFixed(0)}%
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Loader
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950">
                <div className="text-center space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                        <Activity className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-muted-foreground font-medium">Завантаження погодних даних...</p>
                </div>
            </div>
        );
    }

    const analysis = analyzeFlightConditions(weather);

    // Головний return
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6 py-8 space-y-8">
                {/* Header */}
                <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Метео для БПЛА
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => fetchWeatherData(true)}
                            disabled={isRefreshing}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                        >
                            {isRefreshing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Оновлення...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    Оновити
                                </>
                            )}
                        </button>
                        <button
                            onClick={compareAllSources}
                            disabled={isRefreshing}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            Порівняти джерела
                        </button>
                    </div>
                </div>
                {/* Weather Source Selection */}
                <div className={`transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <label className="block text-sm font-semibold mb-3">Джерело погодних даних:</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Object.entries(weatherSources).map(([key, source]) => (
                            <button
                                key={key}
                                onClick={() => setWeatherSource(key)}
                                className={`p-4 rounded-lg border transition-all duration-300 ${weatherSource === key
                                    ? 'bg-primary/10 border-primary'
                                    : 'bg-card border-border hover:border-primary/50'
                                    }`}
                            >
                                <div className="font-semibold">{source.name}</div>
                                <div className="text-xs text-muted-foreground mt-1">{source.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comparison Table */}
                {renderComparison()}

                {/* Drone Type Selection */}
                <div className={`transition-all duration-700 delay-150 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <label className="block text-sm font-semibold mb-3">Тип БПЛА:</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {Object.entries(droneTypes).map(([key, drone]) => (
                            <Button
                                key={key}
                                onClick={() => setSelectedDrone(key)}
                                className={`p-3 rounded-lg font-medium transition-all duration-300 ${selectedDrone === key
                                    ? 'bg-primary text-primary-foreground shadow-lg'
                                    : 'bg-card text-foreground border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary/50'
                                    }`}
                            >
                                {drone.name}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Drone Characteristics */}
                <div className={`bg-primary/5 border border-primary/20 rounded-lg p-6 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Plane className="w-5 h-5 text-primary" />
                        Характеристики: {droneTypes[selectedDrone].name}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div className="space-y-1">
                            <div className="text-muted-foreground">Макс. вітер</div>
                            <div className="font-semibold text-sm">{droneTypes[selectedDrone].maxWind} м/с</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-muted-foreground">Макс. опади</div>
                            <div className="font-semibold text-sm">{droneTypes[selectedDrone].maxRain} мм</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-muted-foreground">Дальність</div>
                            <div className="font-semibold text-sm">{droneTypes[selectedDrone].range}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-muted-foreground">Висота</div>
                            <div className="font-semibold text-sm">{droneTypes[selectedDrone].altitude}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-muted-foreground">Мін. темп</div>
                            <div className="font-semibold text-sm">{droneTypes[selectedDrone].minTemp}°C</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-muted-foreground">Макс. темп</div>
                            <div className="font-semibold text-sm">{droneTypes[selectedDrone].maxTemp}°C</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-muted-foreground">Мін. видимість</div>
                            <div className="font-semibold text-sm">{droneTypes[selectedDrone].minVisibility} м</div>
                        </div>
                    </div>
                </div>

                {/* View Mode Selector */}
                <div className={`flex gap-2 bg-card p-2 rounded-lg inline-flex border transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <button
                        onClick={() => setViewMode('current')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'current'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                            }`}
                    >
                        Зараз
                    </button>
                    <button
                        onClick={() => setViewMode('hourly')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'hourly'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                            }`}
                    >
                        Погодинно
                    </button>
                    <button
                        onClick={() => setViewMode('daily')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'daily'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                            }`}
                    >
                        По днях
                    </button>
                </div>
                {/* Current Weather View */}
                {viewMode === 'current' && weather && (
                    <>
                        {/* Flight Status */}
                        <div className={`p-6 rounded-lg border-2 transition-all duration-700 delay-250 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${analysis?.canFly
                            ? 'bg-green-500/10 border-green-500'
                            : 'bg-red-500/10 border-red-500'
                            }`}>
                            <div className="flex items-center gap-3">
                                {analysis?.canFly ? (
                                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                                ) : (
                                    <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                                )}
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {analysis?.canFly ? 'ДОЗВОЛЕНО ВИЛІТ' : 'ВИЛІТ НЕ РЕКОМЕНДУЄТЬСЯ'}
                                    </h2>
                                    <p className={`text-sm ${analysis?.canFly ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {analysis?.canFly
                                            ? 'Умови прийнятні для польоту обраного типу БПЛА'
                                            : 'Погодні умови перевищують допустимі параметри'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Weather Cards */}
                        <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            {/* Wind Card */}
                            <div className="bg-card border rounded-lg p-4 hover:border-primary/50 transition-all duration-300">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Wind className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="font-semibold">Вітер</span>
                                </div>
                                <p className="text-3xl font-bold">{weather.windSpeed.toFixed(1)} м/с</p>
                                {typeof weather.windGusts == "number"
                                    ? <p className="text-sm text-muted-foreground">Пориви: {weather.windGusts.toFixed(1)} м/с</p>
                                    : <p className="text-sm text-muted-foreground">Пориви: {weather.windGusts} м/с</p>
                                }
                            </div>

                            {/* Temperature Card */}
                            <div className="bg-card border rounded-lg p-4 hover:border-primary/50 transition-all duration-300">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Cloud className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="font-semibold">Температура</span>
                                </div>
                                <p className="text-3xl font-bold">{weather.temp.toFixed(1)}°C</p>
                                <p className="text-sm text-muted-foreground">Вологість: {weather.humidity}%</p>
                            </div>

                            {/* Precipitation Card */}
                            <div className="bg-card border rounded-lg p-4 hover:border-primary/50 transition-all duration-300">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Droplets className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="font-semibold">Опади</span>
                                </div>
                                <p className="text-3xl font-bold">{weather.precipitation} мм</p>
                                <p className="text-sm text-muted-foreground">За останню годину</p>
                            </div>

                            {/* Cloud Cover Card */}
                            <div className="bg-card border rounded-lg p-4 hover:border-primary/50 transition-all duration-300">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Eye className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="font-semibold">Хмарність</span>
                                </div>
                                <p className="text-3xl font-bold">{weather.cloudCover}%</p>
                                <p className="text-sm text-muted-foreground">Покриття неба</p>
                            </div>
                        </div>

                        {/* Detailed Analysis */}
                        <div className={`bg-card border rounded-lg p-6 transition-all duration-700 delay-350 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                Детальний аналіз умов
                            </h3>
                            <div className="space-y-3">
                                {analysis?.conditions.map((condition, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-start gap-3 p-3 rounded-lg border ${condition.status === 'good' ? 'bg-green-500/5 border-green-500/20' :
                                            condition.status === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20' :
                                                'bg-red-500/5 border-red-500/20'
                                            }`}
                                    >
                                        {condition.status === 'good' && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />}
                                        {condition.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />}
                                        {condition.status === 'bad' && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />}
                                        <span>{condition.message}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Hourly and Daily Views */}
                {viewMode === 'hourly' && renderHourlyForecast()}
                {viewMode === 'daily' && renderDailyForecast()}
            </div>
        </div>
    );
};

export default DroneWeatherWidget;