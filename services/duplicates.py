from math import asin, cos, radians, sin, sqrt


def distance_in_metres(lat_a: float, lon_a: float, lat_b: float, lon_b: float) -> float:
    earth_radius = 6_371_000
    delta_lat = radians(lat_b - lat_a)
    delta_lon = radians(lon_b - lon_a)
    a = sin(delta_lat / 2) ** 2 + cos(radians(lat_a)) * cos(radians(lat_b)) * sin(delta_lon / 2) ** 2
    return earth_radius * 2 * asin(sqrt(a))


def is_probable_duplicate(existing: dict, incoming: dict) -> bool:
    if existing["category"] != incoming["category"]:
        return False
    distance = distance_in_metres(
        existing["latitude"], existing["longitude"], incoming["latitude"], incoming["longitude"]
    )
    return distance <= 120