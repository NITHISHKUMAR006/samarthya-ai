"""
Course Matcher Service

Matches courses to competency gaps using competency-area string matching.
Future: use embeddings and semantic similarity for smarter matching.
"""


class CourseMatcher:
    """Matches available courses to identified competency gaps."""

    @staticmethod
    def match_courses(gaps: list[dict], courses: list[dict]) -> list[dict]:
        """Match courses to competency gaps based on area overlap.

        Args:
            gaps: List of dicts with 'competency_name' and 'gap' keys.
            courses: List of dicts with 'competency_area' key.

        Returns:
            Courses sorted by relevance with match_score and reason added.
        """
        results = []
        for course in courses:
            best_score = 0.0
            reason = "General competency development"
            for gap in gaps:
                gap_name = gap.get("competency_name", "").lower()
                course_area = course.get("competency_area", "").lower()
                if gap_name in course_area or course_area in gap_name:
                    gap_val = gap.get("gap", 0)
                    score = min(gap_val / 30.0 * 100, 98)
                    if score > best_score:
                        best_score = score
                        reason = f"Addresses {gap.get('competency_name', '')} skill gap"
            results.append({
                **course,
                "match_score": round(best_score if best_score > 0 else 40.0, 1),
                "reason": reason,
            })
        results.sort(key=lambda r: r["match_score"], reverse=True)
        return results
