from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    course_code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    competency_area = Column(String(255), default="")
    difficulty = Column(String(50), default="Beginner")  # Beginner | Intermediate | Advanced
    duration_hours = Column(Float, default=1.0)
    description = Column(Text, default="")
    provider = Column(String(255), default="iGOT Karmayogi")
    is_igot = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class LearningPath(Base):
    __tablename__ = "learning_paths"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="active")  # active | completed
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    path_courses = relationship("LearningPathCourse", back_populates="learning_path", cascade="all, delete-orphan")


class LearningPathCourse(Base):
    __tablename__ = "learning_path_courses"

    id = Column(Integer, primary_key=True, index=True)
    learning_path_id = Column(Integer, ForeignKey("learning_paths.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    order = Column(Integer, default=0)
    status = Column(String(50), default="not_started")  # not_started | in_progress | completed
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    learning_path = relationship("LearningPath", back_populates="path_courses")
    course = relationship("Course")


class LearningMaterial(Base):
    __tablename__ = "learning_materials"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf | pptx
    file_size = Column(Integer, default=0)
    extracted_text = Column(Text, default="")
    status = Column(String(50), default="uploaded")  # uploaded | processing | processed | failed
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
