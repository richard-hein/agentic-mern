export class WeatherService {

    static async fetchWeatherData(country: string): Promise<any> {
        const apiKey = process.env.WEATHER_API_KEY;
        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${country}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching weather data: ${response?.statusText}`);
        }

        const data = await response.json();

        return data;


    }
}