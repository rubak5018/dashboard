interface MeteosourceCurrentResponse {
    lat: string;
    lon: string;
    elevation: number;
    timezone: string;
    units: string;
    current: {
        icon: string;
        icon_num: number;
        summary: string;
        temperature: number;
        feels_like: number;
        wind_chill: number;
        dew_point: number;
        wind: {
            speed: number;
            gusts: number;
            angle: number;
            dir: string;
        };
        precipitation: {
            total: number;
            type: string;
        };
        cloud_cover: number;
        ozone: number;
        pressure: number;
        uv_index: number;
        humidity: number;
        visibility: number;
    };
}

interface MeteosourceForecastResponse {
    lat: string;
    lon: string;
    elevation: number;
    timezone: string;
    units: string;
    hourly: {
        data: Array<{
            date: string;
            weather: string;
            icon: number;
            summary: string;
            temperature: number;
            feels_like: number;
            wind_chill: number;
            dew_point: number;
            wind: {
                speed: number;
                gusts: number;
                angle: number;
                dir: string;
            };
            cloud_cover: {
                total: number;
            };
            precipitation: {
                total: number;
                type: string;
            };
            probability: {
                precipitation: number;
                storm: number;
                freeze: number;
            };
            ozone: number;
            humidity: number;
            visibility: number;
            pressure: number;
        }>;
    };
    daily: {
        data: Array<{
            day: string;
            weather: string;
            icon: number;
            summary: string;
            all_day: {
                weather: string;
                icon: number;
                temperature: number;
                temperature_min: number;
                temperature_max: number;
                wind: {
                    speed: number;
                    gusts: number;
                    dir: string;
                    angle: number;
                };
                cloud_cover: {
                    total: number;
                };
                precipitation: {
                    total: number;
                    type: string;
                };
                probability: {
                    precipitation: number;
                    storm: number;
                    freeze: number;
                };
            };
            morning?: any;
            afternoon?: any;
            evening?: any;
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

export class MeteosourceService {
    private apiKey: string;
    private baseUrl = 'https://www.meteosource.com/api/v1/free';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Отримує поточну погоду
     */
    async fetchCurrent(lat: number, lon: number): Promise<WeatherData> {
        try {
            const response = await fetch(
                `${this.baseUrl}/point?lat=${lat}&lon=${lon}&sections=current&units=metric&key=${this.apiKey}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Meteosource API error: ${response.status} ${response.statusText}`);
            }

            const data: MeteosourceCurrentResponse = await response.json();

            return {
                temp: data.current.temperature,
                humidity: data.current.humidity,
                precipitation: data.current.precipitation.total,
                windSpeed: data.current.wind.speed,
                windGusts: data.current.wind.gusts,
                cloudCover: data.current.cloud_cover,
                source: 'meteosource'
            };
        } catch (error) {
            console.error('Error fetching Meteosource current data:', error);
            throw error;
        }
    }

    /**
     * Отримує прогноз погоди
     */
    async fetchForecast(lat: number, lon: number): Promise<ForecastData> {
        try {
            const response = await fetch(
                `${this.baseUrl}/point?lat=${lat}&lon=${lon}&sections=hourly,daily&units=metric&key=${this.apiKey}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Meteosource API error: ${response.status} ${response.statusText}`);
            }

            const data: MeteosourceForecastResponse = await response.json();

            // Погодинний прогноз (48 годин)
            const hourly: HourlyForecast[] = data.hourly.data.slice(0, 48).map(hour => ({
                time: new Date(hour.date),
                temp: hour.temperature,
                precipitation: hour.precipitation.total,
                windSpeed: hour.wind.speed,
                cloudCover: hour.cloud_cover.total
            }));

            // Денний прогноз
            const daily: DailyForecast[] = data.daily.data.map(day => ({
                date: new Date(day.day),
                tempMax: day.all_day.temperature_max,
                tempMin: day.all_day.temperature_min,
                precipitation: day.all_day.precipitation.total,
                windSpeed: day.all_day.wind.speed
            }));

            return { hourly, daily };
        } catch (error) {
            console.error('Error fetching Meteosource forecast data:', error);
            throw error;
        }
    }

    /**
     * Отримує поточну погоду та прогноз одним запитом
     */
    async fetchWeather(lat: number, lon: number): Promise<{
        current: WeatherData;
        forecast: ForecastData;
    }> {
        try {
            const response = await fetch(
                `${this.baseUrl}/point?lat=${lat}&lon=${lon}&sections=current,hourly,daily&units=metric&key=${this.apiKey}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Meteosource API error: ${response.status} ${response.statusText}`);
            }

            const data: MeteosourceCurrentResponse & MeteosourceForecastResponse = await response.json();

            // Поточна погода
            const current: WeatherData = {
                temp: data.current.temperature,
                humidity: data.current.humidity,
                precipitation: data.current.precipitation.total,
                windSpeed: data.current.wind.speed,
                windGusts: data.current.wind.gusts,
                cloudCover: data.current.cloud_cover,
                source: 'meteosource'
            };

            // Погодинний прогноз (48 годин)
            const hourly: HourlyForecast[] = data.hourly.data.slice(0, 48).map(hour => ({
                time: new Date(hour.date),
                temp: hour.temperature,
                precipitation: hour.precipitation.total,
                windSpeed: hour.wind.speed,
                cloudCover: hour.cloud_cover.total
            }));

            // Денний прогноз
            const daily: DailyForecast[] = data.daily.data.map(day => ({
                date: new Date(day.day),
                tempMax: day.all_day.temperature_max,
                tempMin: day.all_day.temperature_min,
                precipitation: day.all_day.precipitation.total,
                windSpeed: day.all_day.wind.speed
            }));

            return { current, forecast: { hourly, daily } };
        } catch (error) {
            console.error('Error fetching Meteosource data:', error);
            throw error;
        }
    }

    /**
     * Перевіряє валідність API ключа
     */
    async validateApiKey(): Promise<boolean> {
        try {
            const response = await fetch(
                `${this.baseUrl}/point?lat=50.0&lon=14.0&sections=current&units=metric&key=${this.apiKey}`,
                { method: 'HEAD' }
            );
            return response.ok;
        } catch {
            return false;
        }
    }
}