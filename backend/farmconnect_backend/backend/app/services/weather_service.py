"""
Weather service for fetching weather data.
"""
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from ..core.config import settings
from ..core.logging import log
from ..schemas.weather import WeatherAlertResponse


class WeatherService:
    """Weather service for fetching and processing weather data."""
    
    def __init__(self):
        """Initialize weather service."""
        self.api_key = settings.WEATHER_API_KEY
        self.base_url = settings.WEATHER_API_URL
        
    async def get_current_weather(self, location: str) -> Dict[str, Any]:
        """
        Get current weather for a location.
        
        Args:
            location: Location string (e.g., "Delhi,IN")
            
        Returns:
            Weather data dictionary
        """
        if not self.api_key:
            log.warning("Weather API key not configured, returning mock data")
            return self._get_mock_weather(location)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/weather",
                    params={
                        "q": location,
                        "appid": self.api_key,
                        "units": "metric"
                    },
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                
                return {
                    "location": data["name"],
                    "temperature": data["main"]["temp"],
                    "feels_like": data["main"]["feels_like"],
                    "humidity": data["main"]["humidity"],
                    "wind_speed": data["wind"]["speed"],
                    "description": data["weather"][0]["description"],
                    "icon": data["weather"][0]["icon"],
                }
        except Exception as e:
            log.error(f"Error fetching weather data: {e}")
            return self._get_mock_weather(location)
    
    async def get_weather_forecast(self, location: str, days: int = 5) -> List[Dict[str, Any]]:
        """
        Get weather forecast for a location.
        
        Args:
            location: Location string
            days: Number of days to forecast
            
        Returns:
            List of forecast data
        """
        if not self.api_key:
            log.warning("Weather API key not configured, returning mock forecast")
            return self._get_mock_forecast(location, days)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/forecast",
                    params={
                        "q": location,
                        "appid": self.api_key,
                        "units": "metric",
                        "cnt": days * 8  # 8 forecasts per day (3-hour intervals)
                    },
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                
                # Process forecast data
                forecasts = []
                for item in data.get("list", [])[:days * 8]:
                    forecasts.append({
                        "datetime": item["dt_txt"],
                        "temperature": item["main"]["temp"],
                        "humidity": item["main"]["humidity"],
                        "wind_speed": item["wind"]["speed"],
                        "description": item["weather"][0]["description"],
                        "rain": item.get("rain", {}).get("3h", 0),
                    })
                
                return forecasts
                
        except Exception as e:
            log.error(f"Error fetching forecast data: {e}")
            return self._get_mock_forecast(location, days)
    
    async def generate_weather_alerts(
        self,
        location: str,
        language: str = "en"
    ) -> List[WeatherAlertResponse]:
        """
        Generate weather alerts based on current weather and forecast.
        
        Args:
            location: Location string
            language: Language code
            
        Returns:
            List of weather alerts
        """
        alerts = []
        
        try:
            # Get current weather and forecast
            current = await self.get_current_weather(location)
            forecast = await self.get_weather_forecast(location, days=2)
            
            # Analyze weather conditions and generate alerts
            
            # Check for rain
            rain_forecast = [f for f in forecast if f.get("rain", 0) > 2]
            if rain_forecast:
                alerts.append(self._create_alert(
                    location=location,
                    severity="high",
                    alert_type="rain",
                    icon="CloudRain",
                    temperature=current.get("temperature"),
                    humidity=current.get("humidity"),
                    wind_speed=current.get("wind_speed"),
                    rainfall=sum(f.get("rain", 0) for f in rain_forecast),
                    language=language
                ))
            
            # Check for high winds
            if current.get("wind_speed", 0) > 15:
                alerts.append(self._create_alert(
                    location=location,
                    severity="medium",
                    alert_type="wind",
                    icon="AlertTriangle",
                    temperature=current.get("temperature"),
                    humidity=current.get("humidity"),
                    wind_speed=current.get("wind_speed"),
                    language=language
                ))
            
            # Check for good weather
            if not rain_forecast and current.get("wind_speed", 0) < 10:
                alerts.append(self._create_alert(
                    location=location,
                    severity="low",
                    alert_type="sunny",
                    icon="Sun",
                    temperature=current.get("temperature"),
                    humidity=current.get("humidity"),
                    wind_speed=current.get("wind_speed"),
                    language=language
                ))
            
            return alerts
            
        except Exception as e:
            log.error(f"Error generating weather alerts: {e}")
            # Return default alerts
            return self._get_default_alerts(location, language)
    
    def _create_alert(
        self,
        location: str,
        severity: str,
        alert_type: str,
        icon: str,
        temperature: Optional[float] = None,
        humidity: Optional[float] = None,
        wind_speed: Optional[float] = None,
        rainfall: Optional[float] = None,
        language: str = "en"
    ) -> WeatherAlertResponse:
        """Create a weather alert."""
        
        messages = {
            "rain": {
                "en": "Heavy rainfall expected in next 48 hours",
                "hi": "अगले 48 घंटों में भारी बारिश की उम्मीद",
                "gu": "આગામી 48 કલાકમાં ભારે વરસાદની અપેક્ષા"
            },
            "wind": {
                "en": "Strong winds warning for tomorrow",
                "hi": "कल तेज हवाओं की चेतावनी",
                "gu": "આવતીકાલ માટે તેજ પવનની ચેતવણી"
            },
            "sunny": {
                "en": "Sunny weather for next 5 days",
                "hi": "अगले 5 दिनों के लिए धूप का मौसम",
                "gu": "આગામી 5 દિવસ માટે સની હવામાન"
            }
        }
        
        alert_messages = messages.get(alert_type, messages["sunny"])
        
        return WeatherAlertResponse(
            location=location,
            severity=severity,
            message_en=alert_messages["en"],
            message_hi=alert_messages["hi"],
            message_gu=alert_messages["gu"],
            alert_type=alert_type,
            icon=icon,
            temperature=temperature,
            humidity=humidity,
            wind_speed=wind_speed,
            rainfall=rainfall,
            valid_from=datetime.utcnow(),
            valid_until=datetime.utcnow() + timedelta(days=2)
        )
    
    def _get_mock_weather(self, location: str) -> Dict[str, Any]:
        """Get mock weather data."""
        return {
            "location": location.split(",")[0],
            "temperature": 28.5,
            "feels_like": 30.2,
            "humidity": 65,
            "wind_speed": 12.5,
            "description": "partly cloudy",
            "icon": "02d",
        }
    
    def _get_mock_forecast(self, location: str, days: int) -> List[Dict[str, Any]]:
        """Get mock forecast data."""
        forecasts = []
        for i in range(days * 8):
            forecasts.append({
                "datetime": (datetime.utcnow() + timedelta(hours=i * 3)).isoformat(),
                "temperature": 28 + (i % 8),
                "humidity": 60 + (i % 20),
                "wind_speed": 10 + (i % 10),
                "description": "partly cloudy",
                "rain": 0.5 if i % 5 == 0 else 0,
            })
        return forecasts
    
    def _get_default_alerts(self, location: str, language: str) -> List[WeatherAlertResponse]:
        """Get default weather alerts."""
        return [
            self._create_alert(location, "high", "rain", "CloudRain", 28, 70, 15, 25, language),
            self._create_alert(location, "medium", "wind", "AlertTriangle", 28, 65, 18, 0, language),
            self._create_alert(location, "low", "sunny", "Sun", 30, 55, 8, 0, language),
        ]


# Create singleton instance
weather_service = WeatherService()
