from dataclasses import dataclass


CATEGORY_BASE = {
    "pothole": 42,
    "garbage_overflow": 38,
    "waterlogging": 52,
}

SEVERITY_POINTS = {
    "low": 0,
    "medium": 12,
    "high": 24,
    "critical": 34,
}

EXPOSURE_KEYWORDS = {
    "school": 10,
    "hospital": 12,
    "traffic": 8,
    "crossing": 8,
    "pedestrian": 8,
    "market": 6,
    "drain": 6,
}


@dataclass(frozen=True)
class PriorityResult:
    score: int
    label: str
    reasons: list[str]


def calculate_priority(category: str, severity: str, description: str, duplicate_count: int = 1) -> PriorityResult:
    score = CATEGORY_BASE[category]
    reasons = [f"{category.replace('_', ' ').title()} base risk"]

    score += SEVERITY_POINTS[severity]
    if severity != "low":
        reasons.append(f"{severity.title()} reported severity")

    text = description.lower()
    keywords = [word for word in EXPOSURE_KEYWORDS if word in text]
    exposure_points = min(sum(EXPOSURE_KEYWORDS[word] for word in keywords), 18)
    if exposure_points:
        score += exposure_points
        reasons.append("Public-exposure indicator: " + ", ".join(keywords[:3]))

    duplicate_points = min(max(duplicate_count - 1, 0) * 4, 16)
    if duplicate_points:
        score += duplicate_points
        reasons.append(f"{duplicate_count} related citizen reports")

    score = min(score, 100)
    label = "Critical" if score >= 85 else "High" if score >= 65 else "Medium" if score >= 45 else "Routine"
    return PriorityResult(score=score, label=label, reasons=reasons)