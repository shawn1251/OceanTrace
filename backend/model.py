from pydantic import BaseModel
from datetime import datetime


class VesselPosition(BaseModel):
    mmsi: str
    lon: float
    lat: float
    speed: float
    course: float
    timestamp: datetime
