import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RefreshCw,
  Loader2,
  MapPin,
  Droplets,
  Wind,
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Thermometer
} from "lucide-react";
import { apiClient, type CurrentWeather } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";

interface WeatherSectionProps {
  language: "en" | "hi" | "gu";
}

const translations = {
  en: {
    title: "Weather Dashboard",
    refresh: "Refresh",
    feelsLike: "Feels like",
    humidity: "Humidity",
    wind: "Wind",
    pressure: "Pressure",
    loading: "Loading weather...",
    error: "Failed to fetch weather data",
    noData: "No weather data available",
  },
  hi: {
    title: "मौसम डैशबोर्ड",
    refresh: "रिफ्रेश",
    feelsLike: "महसूस होता है",
    humidity: "नमी",
    wind: "हवा",
    pressure: "दबाव",
    loading: "मौसम लोड हो रहा है...",
    error: "मौसम डेटा प्राप्त करने में विफल",
    noData: "कोई मौसम डेटा उपलब्ध नहीं",
  },
  gu: {
    title: "હવામાન ડેશબોર્ડ",
    refresh: "રિફ્રેશ",
    feelsLike: "અનુભવાય છે",
    humidity: "ભેજ",
    wind: "પવન",
    pressure: "દબાણ",
    loading: "હવામાન લોડ થઈ રહ્યું છે...",
    error: "હવામાન ડેટા મેળવવામાં નિષ્ફળ",
    noData: "કોઈ હવામાન ડેટા ઉપલબ્ધ નથી",
  },
};

// Map OpenWeather icon codes to lucide-react icons
const getWeatherIcon = (iconCode: string) => {
  if (!iconCode) return Sun;

  const code = iconCode.substring(0, 2);
  const iconMap: Record<string, any> = {
    '01': Sun,           // clear sky
    '02': CloudSun,      // few clouds
    '03': Cloud,         // scattered clouds
    '04': Cloud,         // broken clouds
    '09': CloudRain,     // shower rain
    '10': CloudRain,     // rain
    '11': CloudLightning, // thunderstorm
    '13': CloudSnow,     // snow
    '50': CloudFog,      // mist/fog
  };

  return iconMap[code] || Sun;
};

export const WeatherSection = ({ language }: WeatherSectionProps) => {
  const { user } = useApp();
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const t = translations[language];

  // Determine location from user profile or fallback
  const location = user?.city || user?.district || "Gandhinagar,IN";

  const fetchCurrentWeather = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getCurrentWeather(location);
      setCurrentWeather(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentWeather();
  }, [location, language]);

  const WeatherIcon = currentWeather ? getWeatherIcon(currentWeather.icon) : Sun;

  return (
    <Card className="h-full overflow-hidden border-none shadow-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-white">{t.title}</CardTitle>
            <p className="text-xs text-white/80 mt-0.5">
              {currentWeather?.location || location.split(',')[0]}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchCurrentWeather}
          disabled={loading}
          className="text-white hover:bg-white/20 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>

      {/* Main Content */}
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-white/80 mb-3" />
            <p className="text-sm text-white/70">{t.loading}</p>
          </div>
        ) : currentWeather ? (
          <div className="space-y-6">
            {/* Temperature & Icon Display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <WeatherIcon className="h-16 w-16 text-white" />
                </div>
                <div>
                  <div className="text-5xl font-bold tracking-tight">
                    {Math.round(currentWeather.temperature)}°C
                  </div>
                  <div className="text-sm text-white/80 mt-1 flex items-center gap-1">
                    <Thermometer className="h-3 w-3" />
                    {t.feelsLike} {Math.round(currentWeather.feels_like)}°C
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Description */}
            <div className="text-center py-3">
              <p className="text-lg font-medium capitalize text-white/90">
                {currentWeather.description}
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
              {/* Humidity */}
              <div className="text-center p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                <Droplets className="h-5 w-5 mx-auto mb-2 text-white/90" />
                <div className="text-xs text-white/70 mb-1">{t.humidity}</div>
                <div className="text-lg font-bold">{currentWeather.humidity}%</div>
              </div>

              {/* Wind Speed */}
              <div className="text-center p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                <Wind className="h-5 w-5 mx-auto mb-2 text-white/90" />
                <div className="text-xs text-white/70 mb-1">{t.wind}</div>
                <div className="text-lg font-bold">{Math.round(currentWeather.wind_speed)} km/h</div>
              </div>

              {/* Pressure (placeholder) */}
              <div className="text-center p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                <Thermometer className="h-5 w-5 mx-auto mb-2 text-white/90" />
                <div className="text-xs text-white/70 mb-1">{t.pressure}</div>
                <div className="text-lg font-bold">1013 hPa</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-white/80">
            <Sun className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm font-medium">{t.noData}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
