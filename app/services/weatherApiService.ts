interface WeatherAPIResponse {
    current: {
        temp_c: number;
        humidity: number;
        precip_mm: number;
        wind_kph: number;
        gust_kph: number;
        cloud: number;
    };
    forecast: {
        forecastday: Array<{
            date: string;
            date_epoch: number;
            day: {
                maxtemp_c: number;
                mintemp_c: number;
                totalprecip_mm: number;
                maxwind_kph: number;
            };
            hour: Array<{
                time: string;
                time_epoch: number;
                temp_c: number;
                precip_mm: number;
                wind_kph: number;
                cloud: number;
            }>;
        }>;
    };
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

export class WeatherAPIService {
    private apiKey: string;
    private baseUrl = 'https://api.weatherapi.com/v1';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Конвертує км/год у м/с
     */
    private kphToMs(kph: number): number {
        return kph / 3.6;
    }

    /**
     * Отримує поточну погоду та прогноз
     */
    async fetchWeather(lat: number, lon: number, days: number = 7): Promise<{
        current: WeatherData;
        forecast: ForecastData;
    }> {
        try {
            const response = await fetch(
                `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${lat},${lon}&days=${days}&aqi=no&alerts=no`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`WeatherAPI error: ${response.status} ${response.statusText}`);
            }

            const data: WeatherAPIResponse = await response.json();

            // Поточна погода
            const current: WeatherData = {
                temp: data.current.temp_c,
                humidity: data.current.humidity,
                precipitation: data.current.precip_mm,
                windSpeed: this.kphToMs(data.current.wind_kph),
                windGusts: this.kphToMs(data.current.gust_kph),
                cloudCover: data.current.cloud,
                source: 'weatherapi'
            };

            // Погодинний прогноз (48 годин)
            const hourly: HourlyForecast[] = [];
            for (let dayIndex = 0; dayIndex < Math.min(2, data.forecast.forecastday.length); dayIndex++) {
                const day = data.forecast.forecastday[dayIndex];
                for (const hour of day.hour) {
                    if (hourly.length >= 48) break;
                    hourly.push({
                        time: new Date(hour.time_epoch * 1000),
                        temp: hour.temp_c,
                        precipitation: hour.precip_mm,
                        windSpeed: this.kphToMs(hour.wind_kph),
                        cloudCover: hour.cloud
                    });
                }
                if (hourly.length >= 48) break;
            }

            // Денний прогноз
            const daily: DailyForecast[] = data.forecast.forecastday.map(day => ({
                date: new Date(day.date_epoch * 1000),
                tempMax: day.day.maxtemp_c,
                tempMin: day.day.mintemp_c,
                precipitation: day.day.totalprecip_mm,
                windSpeed: this.kphToMs(day.day.maxwind_kph)
            }));

            return { current, forecast: { hourly, daily } };
        } catch (error) {
            console.error('Error fetching WeatherAPI data:', error);
            throw error;
        }
    }

    /**
     * Перевіряє валідність API ключа
     */
    async validateApiKey(): Promise<boolean> {
        try {
            const response = await fetch(
                `${this.baseUrl}/current.json?key=${this.apiKey}&q=London&aqi=no`,
                { method: 'HEAD' }
            );
            return response.ok;
        } catch {
            return false;
        }
    }
}
