"""
Weather API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List

from ....schemas.weather import WeatherAlertResponse, WeatherRequest
from ....services.weather_service import weather_service
from ....core.logging import log

router = APIRouter()


@router.post("/alerts", response_model=List[WeatherAlertResponse])
async def get_weather_alerts(request: WeatherRequest):
    """
    Get weather alerts for a location.
    
    - Fetches current weather and forecast
    - Generates contextual alerts based on conditions
    - Returns multilingual alerts
    """
    try:
        alerts = await weather_service.generate_weather_alerts(
            location=request.location,
            language=request.language
        )
        
        log.info(f"Generated {len(alerts)} weather alerts for {request.location}")
        return alerts
        
    except Exception as e:
        log.error(f"Error getting weather alerts: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch weather alerts: {str(e)}"
        )


@router.get("/current")
async def get_current_weather(
    location: str = Query(default="Delhi,IN", description="Location (city,country_code)")
):
    """
    Get current weather for a location.
    
    Returns current temperature, humidity, wind speed, and conditions.
    """
    try:
        weather = await weather_service.get_current_weather(location)
        log.info(f"Fetched current weather for {location}")
        return weather
        
    except Exception as e:
        log.error(f"Error getting current weather: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch current weather: {str(e)}"
        )


@router.get("/forecast")
async def get_weather_forecast(
    location: str = Query(default="Delhi,IN", description="Location (city,country_code)"),
    days: int = Query(default=5, ge=1, le=7, description="Number of days to forecast")
):
    """
    Get weather forecast for a location.
    
    Returns forecast for specified number of days (1-7).
    """
    try:
        forecast = await weather_service.get_weather_forecast(location, days)
        log.info(f"Fetched {days}-day forecast for {location}")
        return {"location": location, "forecast": forecast}
        
    except Exception as e:
        log.error(f"Error getting forecast: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch weather forecast: {str(e)}"
        )
