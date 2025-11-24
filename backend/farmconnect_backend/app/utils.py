# # import requests
# # from supabase import create_client, Client
# # from uuid import uuid4
# # from typing import Optional, List
# # import math
# # import os
# # from dotenv import load_dotenv

# # load_dotenv()

# # SUPABASE_URL = os.getenv("SUPABASE_URL")
# # SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# # supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# # def geocode_address(address: str, city: Optional[str] = None, state: Optional[str] = None, pincode: Optional[str] = None) -> Optional[tuple[float, float]]:
# #     """Geocode address using free Nominatim API."""
# #     query = f"{address}, {city}, {state} {pincode}".strip(", ")
# #     url = f"https://nominatim.openstreetmap.org/search"
# #     params = {
# #         "q": query,
# #         "format": "json",
# #         "limit": 1
# #     }
# #     headers = {"User-Agent": "FarmingApp/1.0"}  # Required by Nominatim
    
# #     try:
# #         response = requests.get(url, params=params, headers=headers, timeout=5)
# #         response.raise_for_status()
# #         data = response.json()
# #         if data:
# #             return float(data[0]["lat"]), float(data[0]["lon"])
# #     except Exception as e:
# #         print(f"Geocoding error: {e}")
# #     return None

# # def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
# #     """Calculate distance in km using Haversine formula."""
# #     R = 6371.0  # Earth radius in km
# #     dlat = math.radians(lat2 - lat1)
# #     dlon = math.radians(lon2 - lon1)
# #     a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
# #     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
# #     return R * c

# # def upload_images(files: List['UploadFile']) -> str:
# #     """Upload multiple images to Supabase Storage, return first URL."""
# #     if not files:
# #         return ""
    
# #     bucket = "listings"  # Create in Supabase dashboard
# #     urls = []
# #     for file in files:
# #         if not file.filename:
# #             continue
# #         file_ext = file.filename.split('.')[-1]
# #         file_name = f"{uuid4()}.{file_ext}"
        
# #         try:
# #             with open(file.filename, "rb") as f:
# #                 content = f.read()
# #             response = supabase.storage.from_(bucket).upload(file_name, content)
# #             if response:
# #                 public_url = supabase.storage.from_(bucket).get_public_url(file_name)
# #                 urls.append(public_url)
# #         except Exception as e:
# #             print(f"Upload error: {e}")
    
# #     return urls[0] if urls else ""  # Return first image URL



# import requests
# from supabase import create_client, Client
# from uuid import uuid4
# from typing import Optional, List
# import math
# import os
# from dotenv import load_dotenv

# load_dotenv()

# SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# def geocode_address(address: str, city: Optional[str] = None, state: Optional[str] = None, pincode: Optional[str] = None) -> Optional[tuple[float, float]]:
#     """Geocode address using free Nominatim API."""
#     query = f"{address}, {city}, {state} {pincode}".strip(", ")
#     url = f"https://nominatim.openstreetmap.org/search"
#     params = {
#         "q": query,
#         "format": "json",
#         "limit": 1
#     }
#     headers = {"User-Agent": "FarmingApp/1.0"}  # Required by Nominatim
    
#     try:
#         response = requests.get(url, params=params, headers=headers, timeout=5)
#         response.raise_for_status()
#         data = response.json()
#         if data:
#             return float(data[0]["lat"]), float(data[0]["lon"])
#     except Exception as e:
#         print(f"Geocoding error: {e}")
#     return None

# def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
#     """Calculate distance in km using Haversine formula."""
#     R = 6371.0  # Earth radius in km
#     dlat = math.radians(lat2 - lat1)
#     dlon = math.radians(lon2 - lon1)
#     a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
#     return R * c

# def upload_images(files: List['UploadFile']) -> str:
#     """Upload multiple images to Supabase Storage, return first URL."""
#     if not files:
#         return ""
    
#     bucket = "listings"  # Create in Supabase dashboard
#     urls = []
#     for file in files:
#         if not file.filename:
#             continue
#         file_ext = file.filename.split('.')[-1]
#         file_name = f"{uuid4()}.{file_ext}"
        
#         try:
#             # Read from UploadFile stream (not disk)
#             content = file.file.read()
#             response = supabase.storage.from_(bucket).upload(file_name, content)
#             if response:
#                 public_url = supabase.storage.from_(bucket).get_public_url(file_name)
#                 urls.append(public_url)
#             # Optional: Reset stream if needed for further use
#             file.file.seek(0)
#         except Exception as e:
#             print(f"Upload error: {e}")
    
#     return urls[0] if urls else ""  # Return first image URL







import requests
from supabase import create_client, Client
from uuid import uuid4
from typing import Optional, List
import math
import os
from dotenv import load_dotenv
from fastapi import UploadFile

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def geocode_address(address: str, city: Optional[str] = None, state: Optional[str] = None, pincode: Optional[str] = None) -> Optional[tuple[float, float]]:
    """Geocode address using free Nominatim API."""
    query = f"{address}, {city}, {state} {pincode}".strip(", ")
    url = f"https://nominatim.openstreetmap.org/search"
    params = {
        "q": query,
        "format": "json",
        "limit": 1
    }
    headers = {"User-Agent": "FarmingApp/1.0"}  # Required by Nominatim
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])
    except Exception as e:
        print(f"Geocoding error: {e}")
    return None

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in km using Haversine formula."""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def upload_images(files: List[UploadFile]) -> str:
    """Upload multiple images to Supabase Storage, return first URL."""
    if not files:
        return ""
    
    bucket = "listings"  # Create in Supabase dashboard
    urls = []
    for file in files:
        if not file.filename:
            continue
        file_ext = file.filename.split('.')[-1]
        file_name = f"{uuid4()}.{file_ext}"
        
        try:
            # Read from UploadFile stream (not disk)
            content = file.file.read()
            response = supabase.storage.from_(bucket).upload(file_name, content)
            if response:
                public_url = supabase.storage.from_(bucket).get_public_url(file_name)
                urls.append(public_url)
            # Optional: Reset stream if needed for further use
            file.file.seek(0)
        except Exception as e:
            print(f"Upload error: {e}")
    
    return urls[0] if urls else ""  # Return first image URL