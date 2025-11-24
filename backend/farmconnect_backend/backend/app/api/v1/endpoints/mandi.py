"""
Mandi (Market) Prices API endpoints.
Fetches live data from official data.gov.in AGMARKNET API.
"""
import httpx
from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Dict
from ....core.config import settings
from ....core.logging import log

router = APIRouter()

# Official data.gov.in AGMARKNET endpoint
AGMARKNET_BASE_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

@router.get("/", response_model=List[Dict])
async def get_mandi_prices(
    commodity: str = Query("Wheat", description="Commodity to fetch prices for")
):
    """
    Get live Mandi prices for a specific commodity, prioritizing Gujarat.
    Uses official AGMARKNET data from data.gov.in.
    """
    if not settings.DATA_GOV_IN_API_KEY:
        log.error("DATA_GOV_IN_API_KEY is not set in .env file.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Add DATA_GOV_IN_API_KEY to .env"
        )

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            all_prices = []
            
            # Strategy 1: Try Gujarat + commodity
            params_gujarat = {
                "api-key": settings.DATA_GOV_IN_API_KEY,
                "format": "json",
                "limit": 50,
                "offset": 0,
                "filters[state]": "Gujarat",
                "filters[commodity]": commodity
            }
            
            log.info(f"Fetching Mandi data for {commodity} in Gujarat...")
            response = await client.get(AGMARKNET_BASE_URL, params=params_gujarat)
            response.raise_for_status()
            data = response.json()
            
            gujarat_records = data.get("records", [])
            log.info(f"Found {len(gujarat_records)} Gujarat records for {commodity}")
            
            # Strategy 2: If no Gujarat data, try all India
            if not gujarat_records:
                log.info(f"No Gujarat data, trying all India for {commodity}...")
                params_all = {
                    "api-key": settings.DATA_GOV_IN_API_KEY,
                    "format": "json",
                    "limit": 30,
                    "offset": 0,
                    "filters[commodity]": commodity
                }
                
                response = await client.get(AGMARKNET_BASE_URL, params=params_all)
                response.raise_for_status()
                data = response.json()
                gujarat_records = data.get("records", [])
                log.info(f"Found {len(gujarat_records)} all-India records for {commodity}")
            
            if not gujarat_records:
                log.warning(f"No Mandi data found for commodity: {commodity}")
                return []
            
            # Process records
            seen_markets = set()
            for i, record in enumerate(gujarat_records):
                try:
                    # Extract and clean price data
                    modal_str = str(record.get("modal_price", "0")).replace(",", "").strip()
                    min_str = str(record.get("min_price", "0")).replace(",", "").strip()
                    max_str = str(record.get("max_price", "0")).replace(",", "").strip()
                    
                    # Convert to integers
                    modal = int(float(modal_str)) if modal_str and modal_str != "0" else 0
                    min_price = int(float(min_str)) if min_str and min_str != "0" else modal
                    max_price = int(float(max_str)) if max_str and max_str != "0" else modal
                    
                    # Skip invalid prices
                    if modal == 0 or modal > 100000:
                        continue
                    
                    # Extract market and commodity info
                    market_name = str(record.get("market", "Unknown")).strip()
                    commodity_name = str(record.get("commodity", commodity)).strip()
                    state_name = str(record.get("state", "")).strip()
                    district_name = str(record.get("district", "")).strip()
                    
                    # Create unique market identifier
                    market_key = f"{state_name}-{market_name}-{commodity_name}"
                    if market_key in seen_markets:
                        continue
                    seen_markets.add(market_key)
                    
                    # Build clean record
                    display_market = market_name
                    if district_name and district_name.lower() not in market_name.lower():
                        display_market = f"{market_name}, {district_name}"
                    
                    clean_record = {
                        "id": f"{market_name}-{commodity_name}-{i}",
                        "market": display_market,
                        "commodity": commodity_name,
                        "min_price": min_price,
                        "max_price": max_price,
                        "modal_price": modal,
                        "date": str(record.get("arrival_date", "N/A")).strip(),
                    }
                    all_prices.append(clean_record)
                    
                except Exception as parse_err:
                    log.warning(f"Error parsing record {i}: {parse_err}")
                    continue
            
            # Sort by modal price (highest first)
            all_prices.sort(key=lambda x: x["modal_price"], reverse=True)
            
            # Return top 20
            result = all_prices[:20]
            log.info(f"Returning {len(result)} Mandi prices for {commodity}")
            return result

    except httpx.HTTPStatusError as e:
        log.error(f"HTTP error: {e.response.status_code} - {e.response.text[:300]}")
        raise HTTPException(
            status_code=502,
            detail=f"API unavailable: {e.response.status_code}"
        )
    except httpx.TimeoutException:
        log.error("Request timeout to data.gov.in")
        raise HTTPException(
            status_code=504,
            detail="Request timeout. Please try again."
        )
    except Exception as e:
        log.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Processing error: {str(e)}"
        )
