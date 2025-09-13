import { useEffect, useState } from "react";
import { Calendar, Clock, LocateFixed, MapPin, Search, X, XCircle } from "lucide-react";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

import cloud from "./assets/img/clouds.png";
import clear from "./assets/img/clear.png";
import rain from "./assets/img/rain.png";
import drizzle from "./assets/img/drizzle.png";
import climate from "./assets/img/climate.png";
import humidity from "./assets/img/humidity.png";
import wind from "./assets/img/wind.png";
import snow from "./assets/img/snow.png";
import Haze from "./assets/img/haze.png";
import thunderIcon from "./assets/img/thunderIcon.png";
import sunny from "./assets/img/sunny.jpeg";
import cloudy from "./assets/img/cloudy.jpg";
import rainy from "./assets/img/rainy.jpg";
import driz from "./assets/img/driz.jpg";
import misty from "./assets/img/misty.webp";
import snowy from "./assets/img/snowy.jpg";
import tornado from "./assets/img/tornado.jpg";
import tornadoIcon from "./assets/img/tornadoIcon.png";
import thunderStorm from "./assets/img/thunderStorm.jpg";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "a923e64e462bd65bcab66f24fda8f46b";

const weatherConfig = {
  Clear: { icon: clear, bg: sunny, name: "Sunny" },
  Clouds: { icon: cloud, bg: cloudy, name: "Cloudy" },
  Rain: { icon: rain, bg: rainy, name: "Rainy" },
  Drizzle: { icon: drizzle, bg: driz, name: "Drizzle" },
  Snow: { icon: snow, bg: snowy, name: "Snowy" },
  Thunderstorm: { icon: thunderIcon, bg: thunderStorm, name: "Thunderstorm" },
  Tornado: { icon: tornadoIcon, bg: tornado, name: "Tornado" },
  Mist: { icon: Haze, bg: misty, name: "Misty" },
  Fog: { icon: Haze, bg: misty, name: "Foggy" },
  Haze: { icon: Haze, bg: misty, name: "Hazy" },
  Smoke: { icon: Haze, bg: misty, name: "Smoky" },
};

const getWeatherIcon = (c) => weatherConfig[c]?.icon || clear;
const getBackground = (c) => `url(${weatherConfig[c]?.bg || climate})`;
const friendlyName = (c) => weatherConfig[c]?.name || c;
function getAlpha3(cc) {
  if (!cc) return "";
  return countries.alpha2ToAlpha3(cc) || cc;
}

function getCityDateObjFromTimezone(timezoneSeconds) {
  if (typeof timezoneSeconds !== "number") return null;
  return new Date(Date.now() + timezoneSeconds * 1000);
}
function formatRailwayTime(dateObj) {
  if (!dateObj) return { time: "", date: "" };
  const time = dateObj.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  const date = dateObj.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return { time, date };
}

export default function WeatherApp() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [railTime, setRailTime] = useState({ time: "", date: "" });

  useEffect(() => {
    if (!weather?.timezone) {
      setRailTime({ time: "", date: "" });
      return;
    }
    const update = () => {
      const d = getCityDateObjFromTimezone(weather.timezone);
      setRailTime(formatRailwayTime(d));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [weather?.timezone]);

  async function checkWeather(e) {
    if (e?.preventDefault) e.preventDefault();
    const q = query.trim();
    if (!q) {
      setError("Enter a city or village");
      setWeather(null);
      return;
    }
    try {
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${API_KEY}`
      );
      const geoData = await geoRes.json();
      if (!geoData.length) {
        setError("Place not found");
        setWeather(null);
        return;
      }
      const { lat, lon, name, country } = geoData[0];
      const wRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      const data = await wRes.json();
      setWeather({
        name: `${name}, ${getAlpha3(country)}`,
        temp: Math.round(data.main.temp),
        humidity: data.main.humidity,
        wind: data.wind.speed,
        condition: data.weather[0].main,
        timezone: data.timezone,
      });
      setError("");
    } catch (err) {
      setError("Unable to fetch weather");
      setWeather(null);
    }
  }

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const wRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
        );
        const data = await wRes.json();
        setWeather({
          name: `${data.name}, ${getAlpha3(data.sys?.country || "")}`,
          temp: Math.round(data.main.temp),
          humidity: data.main.humidity,
          wind: data.wind.speed,
          condition: data.weather[0].main,
          timezone: data.timezone,
        });
      },
      () => setError("Location access denied.")
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-6"
      style={{
        backgroundImage: weather ? getBackground(weather.condition) : `url(${climate})`,
      }}
    >
      <div className="w-full max-w-sm text-white rounded-2xl p-6">
     
        <form onSubmit={checkWeather} className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <input
            type="search"
            placeholder="Enter a City"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full flex-1 p-3 rounded-full text-white placeholder-gray-200 bg-white/20 outline-none"
          />
          <div className="flex gap-2">
            <button type="submit" className="p-3 rounded-full bg-white/20 hover:bg-white/30">
              <Search className="w-6" />
            </button>
            <button type="button" onClick={useMyLocation} className="p-3 rounded-full bg-white/20 hover:bg-white/30">
              <LocateFixed className="w-6 h-6" />
            </button>
          </div>
        </form>

        {error && (
          <div className="flex items-center justify-between text-red-700 bg-red-50/40 px-3 py-2 rounded-md mb-3 text-sm">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
            <button onClick={() => setError("")} className="ml-2 text-red-600 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {weather ? (
          <div className="text-center">
            <img src={getWeatherIcon(weather.condition)} alt="weather" className="w-24 sm:w-32 mx-auto" />
            <h1 className="text-4xl sm:text-5xl font-bold mt-2">{weather.temp}°C</h1>
            <h2 className="text-lg sm:text-2xl mt-1 flex justify-center gap-2 items-center">
              <MapPin /> {weather.name}
            </h2>
            <p className="text-base sm:text-lg font-medium capitalize text-gray-200 mt-1">
              {friendlyName(weather.condition)}
            </p>
            <p className="text-xs sm:text-sm text-white mt-2 flex flex-wrap justify-center items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {railTime.time}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {railTime.date}
              </span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg p-3">
                <img src={humidity} alt="humidity" className="w-6 sm:w-8" />
                <div>
                  <p className="text-lg">{weather.humidity}%</p>
                  <p className="text-sm">Humidity</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg p-3">
                <img src={wind} alt="wind" className="w-6 sm:w-8" />
                <div>
                  <p className="text-lg">{weather.wind} km/h</p>
                  <p className="text-sm">Wind Speed</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-white text-sm sm:text-base">
            <p className="mb-2">Type a City</p>
            <p>Or tap the location button to use your current location</p>
          </div>
        )}
      </div>
    </div>
  );
}
