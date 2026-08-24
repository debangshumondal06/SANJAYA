# tests/test_priority.py
from services.priority import calculate_priority


def test_school_crossing_with_related_reports_is_high_priority():
    result = calculate_priority(
        "pothole",
        "high",
        "Deep pothole near a school crossing with heavy traffic.",
        duplicate_count=3,
    )
    assert result.score >= 80
    assert result.label in {"High", "Critical"}
    assert any("related citizen reports" in reason for reason in result.reasons)