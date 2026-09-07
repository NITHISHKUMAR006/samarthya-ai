"""
iGOT Karmayogi Adapter

This adapter encapsulates all interaction with the iGOT course catalogue.
Currently returns data from the local database (mock iGOT data).

To integrate with the real iGOT API later:
  1. Replace get_courses() to call the iGOT API endpoint.
  2. Map the iGOT API response to the Course model.
  3. Optionally cache results in the local database.

The rest of the application only talks through this adapter,
so swapping mock → real requires changes in this file only.
"""

from sqlalchemy.orm import Session
from app.models.learning import Course


class IGOTAdapter:
    """Adapter for the iGOT Karmayogi course catalogue."""

    def __init__(self, api_base_url: str = ""):
        self.api_base_url = api_base_url
        self.is_mock = not bool(api_base_url)

    def get_courses(self, db: Session) -> list[Course]:
        """Fetch all courses from iGOT (mock: reads from local database)."""
        if self.is_mock:
            return db.query(Course).all()

        # Future: fetch from real iGOT API
        # response = httpx.get(f"{self.api_base_url}/courses")
        # return self._map_igot_response(response.json())
        return []

    def get_course_by_id(self, db: Session, course_id: int) -> Course | None:
        """Fetch a single course by ID."""
        if self.is_mock:
            return db.query(Course).filter(Course.id == course_id).first()
        return None

    def search_courses(self, db: Session, query: str) -> list[Course]:
        """Search courses by name or competency area."""
        if self.is_mock:
            return (
                db.query(Course)
                .filter(
                    Course.name.ilike(f"%{query}%")
                    | Course.competency_area.ilike(f"%{query}%")
                )
                .all()
            )
        return []
