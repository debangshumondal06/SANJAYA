from services.duplicates import is_probable_duplicate


def test_nearby_reports_in_same_category_are_grouped():
    existing = {"category": "pothole", "latitude": 19.06325, "longitude": 72.85110}
    incoming = {"category": "pothole", "latitude": 19.06355, "longitude": 72.85122}
    assert is_probable_duplicate(existing, incoming) is True


def test_distant_reports_are_not_grouped():
    existing = {"category": "pothole", "latitude": 19.06325, "longitude": 72.85110}
    incoming = {"category": "pothole", "latitude": 19.08325, "longitude": 72.87110}
    assert is_probable_duplicate(existing, incoming) is False