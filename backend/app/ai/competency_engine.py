"""
Competency Engine Service

Provides competency gap analysis and prioritization.
For the MVP, this uses simple arithmetic gap calculation.
Future: integrate ML models for predictive gap analysis and personalized recommendations.
"""


class CompetencyEngine:
    """Analyzes competency gaps and provides recommendations."""

    @staticmethod
    def calculate_gap(current_score: float, required_score: float) -> float:
        """Calculate the competency gap."""
        return max(required_score - current_score, 0)

    @staticmethod
    def prioritize_gaps(gaps: list[dict]) -> list[dict]:
        """Sort gaps by severity (highest gap first) and assign priority labels."""
        sorted_gaps = sorted(gaps, key=lambda g: g.get("gap", 0), reverse=True)
        for g in sorted_gaps:
            gap = g.get("gap", 0)
            if gap >= 25:
                g["priority"] = "High"
            elif gap >= 10:
                g["priority"] = "Medium"
            else:
                g["priority"] = "Low"
        return sorted_gaps

    @staticmethod
    def overall_competency_score(competencies: list[dict]) -> float:
        """Calculate an overall competency score as percentage of requirements met."""
        if not competencies:
            return 0.0
        total_current = sum(c.get("current_score", 0) for c in competencies)
        total_required = sum(c.get("required_score", 0) for c in competencies)
        if total_required == 0:
            return 100.0
        return round((total_current / total_required) * 100, 1)
