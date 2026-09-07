"""
Seed script — populates the database with realistic sample data.

Usage:
  cd backend
  python seed_data.py

This script is idempotent: it checks for existing data before inserting.
"""

import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.config import settings
from app.database import engine, SessionLocal, Base
from app.models.user import User, OfficialProfile, UserProgress
from app.models.competency import Competency, OfficialCompetency
from app.models.learning import Course, LearningPath, LearningPathCourse
from app.models.quiz import Quiz, Question
from app.auth.security import hash_password


def seed():
    # Create tables
    import app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).first():
            print("Database already has data. Skipping seed.")
            return

        print("Seeding database...")

        # ── Users ──────────────────────────────────────────
        admin_user = User(
            email="admin@samarthya.demo",
            full_name="Dr. Meera Krishnan",
            password_hash=hash_password("admin123"),
            role="ADMIN",
        )
        db.add(admin_user)

        officials_data = [
            {
                "email": "rajesh.kumar@samarthya.demo",
                "full_name": "Rajesh Kumar",
                "password": "official123",
                "employee_id": "GOV2024001",
                "department": "IT & Digital Services",
                "job_role": "Data Analyst",
                "years_of_experience": 8,
                "skills": ["Python", "SQL", "Excel", "Power BI"],
                "completed_training": ["Basic Data Analytics", "SQL Fundamentals", "Government IT Policy"],
                "bio": "Senior Data Analyst working on digital governance initiatives.",
            },
            {
                "email": "priya.sharma@samarthya.demo",
                "full_name": "Priya Sharma",
                "password": "official123",
                "employee_id": "GOV2024002",
                "department": "Finance & Statistics",
                "job_role": "Statistical Officer",
                "years_of_experience": 12,
                "skills": ["R Programming", "SPSS", "Statistical Analysis", "Report Writing"],
                "completed_training": ["Advanced Statistics", "Economic Indicators", "Census Data Analysis"],
                "bio": "Experienced statistical officer specializing in economic indicators and census data.",
            },
            {
                "email": "amit.patel@samarthya.demo",
                "full_name": "Amit Patel",
                "password": "official123",
                "employee_id": "GOV2024003",
                "department": "Human Resources",
                "job_role": "HR Manager",
                "years_of_experience": 15,
                "skills": ["HR Management", "Policy Drafting", "Training Design"],
                "completed_training": ["Leadership Development", "HR Analytics Basics"],
                "bio": "HR Manager responsible for capacity building and training programs.",
            },
            {
                "email": "sneha.reddy@samarthya.demo",
                "full_name": "Sneha Reddy",
                "password": "official123",
                "employee_id": "GOV2024004",
                "department": "Urban Development",
                "job_role": "Urban Planner",
                "years_of_experience": 6,
                "skills": ["GIS", "Data Visualization", "Urban Analytics", "Python"],
                "completed_training": ["GIS Fundamentals", "Smart Cities Mission"],
                "bio": "Urban planner leveraging data analytics for smart city planning.",
            },
            {
                "email": "vikram.singh@samarthya.demo",
                "full_name": "Vikram Singh",
                "password": "official123",
                "employee_id": "GOV2024005",
                "department": "Agriculture & Cooperation",
                "job_role": "Agriculture Extension Officer",
                "years_of_experience": 10,
                "skills": ["Field Data Collection", "Excel", "Report Writing"],
                "completed_training": ["Crop Statistics", "Soil Data Analysis Basics"],
                "bio": "Extension officer bridging field data with policy-level agricultural statistics.",
            },
        ]

        official_users = []
        for od in officials_data:
            user = User(
                email=od["email"],
                full_name=od["full_name"],
                password_hash=hash_password(od["password"]),
                role="OFFICIAL",
            )
            db.add(user)
            db.flush()

            profile = OfficialProfile(
                user_id=user.id,
                employee_id=od["employee_id"],
                department=od["department"],
                job_role=od["job_role"],
                years_of_experience=od["years_of_experience"],
                skills=json.dumps(od["skills"]),
                completed_training=json.dumps(od["completed_training"]),
                bio=od["bio"],
            )
            db.add(profile)

            progress = UserProgress(
                user_id=user.id,
                courses_completed=max(0, od["years_of_experience"] // 3),
                courses_in_progress=2,
                quizzes_taken=max(1, od["years_of_experience"] // 2),
                average_score=round(55 + od["years_of_experience"] * 2.5, 1),
                total_learning_hours=round(od["years_of_experience"] * 8.5, 1),
            )
            db.add(progress)
            official_users.append(user)

        db.flush()

        # ── Competencies ──────────────────────────────────
        competencies_data = [
            ("Data Analysis", "Technical", "Ability to analyze structured and unstructured datasets using statistical and computational tools."),
            ("AI & ML", "Technical", "Understanding of artificial intelligence and machine learning concepts and their application in governance."),
            ("Data Visualization", "Technical", "Skills in creating effective visual representations of data for communication and decision-making."),
            ("Statistics", "Technical", "Proficiency in statistical methods including probability, hypothesis testing, and regression analysis."),
            ("Cybersecurity", "Technical", "Knowledge of information security principles, threat assessment, and data protection."),
            ("Project Management", "Functional", "Ability to plan, execute, and monitor projects using established methodologies."),
            ("Communication", "Behavioral", "Effective verbal and written communication skills for reports, presentations, and stakeholder engagement."),
            ("Digital Literacy", "Functional", "Proficiency in using digital tools, platforms, and technologies for government operations."),
        ]

        competency_objs = []
        for name, category, desc in competencies_data:
            c = Competency(name=name, category=category, description=desc)
            db.add(c)
            competency_objs.append(c)
        db.flush()

        # ── Official Competency Scores ────────────────────
        # Each official gets scores for each competency (current vs required)
        score_matrix = [
            # Rajesh Kumar (Data Analyst)
            [(55, 80), (40, 75), (60, 85), (70, 80), (35, 60), (50, 70), (65, 75), (75, 80)],
            # Priya Sharma (Statistical Officer)
            [(65, 80), (30, 70), (55, 80), (80, 90), (40, 55), (55, 70), (70, 80), (60, 75)],
            # Amit Patel (HR Manager)
            [(35, 60), (20, 50), (40, 65), (45, 60), (30, 50), (70, 85), (80, 85), (55, 70)],
            # Sneha Reddy (Urban Planner)
            [(60, 75), (45, 70), (70, 85), (55, 75), (35, 55), (60, 75), (60, 75), (70, 80)],
            # Vikram Singh (Extension Officer)
            [(40, 70), (15, 50), (30, 65), (50, 70), (25, 45), (45, 65), (55, 70), (40, 65)],
        ]

        for i, user in enumerate(official_users):
            for j, comp in enumerate(competency_objs):
                current, required = score_matrix[i][j]
                oc = OfficialCompetency(
                    user_id=user.id,
                    competency_id=comp.id,
                    current_score=float(current),
                    required_score=float(required),
                )
                db.add(oc)

        # ── Courses (mock iGOT catalogue) ─────────────────
        courses_data = [
            ("IGOT-DA-101", "Data Analytics Fundamentals", "Data Analysis", "Beginner", 12, "Foundation course covering data collection, cleaning, and basic analysis using Excel and Python.", "iGOT Karmayogi"),
            ("IGOT-DA-201", "Advanced Statistical Analysis", "Statistics", "Intermediate", 20, "Advanced statistical methods including regression, ANOVA, and multivariate analysis for government data.", "iGOT Karmayogi"),
            ("IGOT-AI-101", "Introduction to AI for Government", "AI & ML", "Beginner", 15, "Overview of AI concepts, machine learning basics, and use cases in governance and public administration.", "iGOT Karmayogi"),
            ("IGOT-AI-201", "Machine Learning Applications", "AI & ML", "Intermediate", 25, "Hands-on course on applying ML algorithms to government datasets for prediction and classification.", "iGOT Karmayogi"),
            ("IGOT-DV-101", "Data Visualization with Python", "Data Visualization", "Beginner", 10, "Learn to create compelling visualizations using matplotlib, seaborn, and plotly for government reports.", "iGOT Karmayogi"),
            ("IGOT-DV-201", "Dashboard Design & BI Tools", "Data Visualization", "Intermediate", 18, "Design interactive dashboards using Power BI and Tableau for data-driven governance.", "iGOT Karmayogi"),
            ("IGOT-CS-101", "Cybersecurity Essentials", "Cybersecurity", "Beginner", 8, "Core concepts of information security, data protection policies, and threat awareness for government employees.", "iGOT Karmayogi"),
            ("IGOT-PM-101", "Project Management for Government", "Project Management", "Beginner", 14, "Project planning, execution, and monitoring using Agile and traditional methodologies in government context.", "iGOT Karmayogi"),
            ("IGOT-DL-101", "Digital Literacy Essentials", "Digital Literacy", "Beginner", 6, "Essential digital skills for government officials including cloud tools, collaboration platforms, and e-governance.", "iGOT Karmayogi"),
            ("IGOT-ST-301", "Predictive Analytics & Forecasting", "Statistics", "Advanced", 22, "Advanced forecasting techniques, time-series analysis, and predictive modeling for policy planning.", "iGOT Karmayogi"),
        ]

        course_objs = []
        for code, name, area, diff, hours, desc, provider in courses_data:
            c = Course(
                course_code=code,
                name=name,
                competency_area=area,
                difficulty=diff,
                duration_hours=float(hours),
                description=desc,
                provider=provider,
                is_igot=True,
            )
            db.add(c)
            course_objs.append(c)
        db.flush()

        # ── Learning Paths (for first official) ───────────
        lp = LearningPath(user_id=official_users[0].id, status="active")
        db.add(lp)
        db.flush()

        for i, course in enumerate(course_objs[:5]):
            status = "completed" if i < 1 else ("in_progress" if i < 3 else "not_started")
            lpc = LearningPathCourse(
                learning_path_id=lp.id,
                course_id=course.id,
                order=i + 1,
                status=status,
            )
            db.add(lpc)

        # ── Quizzes with Questions ────────────────────────
        quizzes_data = [
            {
                "title": "Data Analysis Fundamentals",
                "description": "Test your understanding of core data analysis concepts and techniques.",
                "competency_area": "Data Analysis",
                "questions": [
                    {
                        "text": "Which of the following is a measure of central tendency?",
                        "a": "Standard Deviation", "b": "Mean", "c": "Variance", "d": "Range",
                        "correct": "B",
                        "explanation": "Mean is a measure of central tendency. Standard deviation, variance, and range measure dispersion."
                    },
                    {
                        "text": "What does ETL stand for in data processing?",
                        "a": "Extract, Transform, Load", "b": "Evaluate, Test, Launch",
                        "c": "Encode, Transfer, Log", "d": "Edit, Tabulate, List",
                        "correct": "A",
                        "explanation": "ETL stands for Extract, Transform, Load — the standard data pipeline process."
                    },
                    {
                        "text": "Which SQL clause is used to filter grouped data?",
                        "a": "WHERE", "b": "GROUP BY", "c": "HAVING", "d": "ORDER BY",
                        "correct": "C",
                        "explanation": "HAVING filters groups after GROUP BY. WHERE filters individual rows before grouping."
                    },
                    {
                        "text": "What is the purpose of data normalization?",
                        "a": "To increase dataset size", "b": "To bring values to a common scale",
                        "c": "To remove all outliers", "d": "To encrypt sensitive data",
                        "correct": "B",
                        "explanation": "Normalization scales data to a common range, making features comparable."
                    },
                    {
                        "text": "Which chart type is best for showing trends over time?",
                        "a": "Pie chart", "b": "Bar chart", "c": "Line chart", "d": "Scatter plot",
                        "correct": "C",
                        "explanation": "Line charts are ideal for displaying trends over continuous time periods."
                    },
                ],
            },
            {
                "title": "AI & Machine Learning Basics",
                "description": "Assess your knowledge of fundamental AI and ML concepts.",
                "competency_area": "AI & ML",
                "questions": [
                    {
                        "text": "What is supervised learning?",
                        "a": "Learning without any data", "b": "Learning from labeled training data",
                        "c": "Learning by trial and error", "d": "Learning from unlabeled data only",
                        "correct": "B",
                        "explanation": "Supervised learning uses labeled data to train models for prediction."
                    },
                    {
                        "text": "Which algorithm is commonly used for classification?",
                        "a": "Linear Regression", "b": "K-Means Clustering",
                        "c": "Decision Tree", "d": "Principal Component Analysis",
                        "correct": "C",
                        "explanation": "Decision Trees split data based on features to predict categories."
                    },
                    {
                        "text": "What is overfitting?",
                        "a": "Good performance on all data", "b": "Good on training, poor on new data",
                        "c": "Model is too simple", "d": "Model has too few parameters",
                        "correct": "B",
                        "explanation": "Overfitting occurs when a model memorizes training data and fails to generalize."
                    },
                    {
                        "text": "What does NLP stand for?",
                        "a": "Neural Learning Process", "b": "Natural Language Processing",
                        "c": "Network Layer Protocol", "d": "Numeric Linear Programming",
                        "correct": "B",
                        "explanation": "NLP enables computers to understand and generate human language."
                    },
                    {
                        "text": "Which metric evaluates classification models effectively?",
                        "a": "Mean Squared Error", "b": "R-squared",
                        "c": "F1 Score", "d": "Mean Absolute Error",
                        "correct": "C",
                        "explanation": "F1 Score balances precision and recall for classification evaluation."
                    },
                ],
            },
            {
                "title": "Cybersecurity Awareness",
                "description": "Evaluate your understanding of cybersecurity principles and best practices.",
                "competency_area": "Cybersecurity",
                "questions": [
                    {
                        "text": "What does the CIA triad stand for?",
                        "a": "Computer, Internet, Application",
                        "b": "Confidentiality, Integrity, Availability",
                        "c": "Control, Identity, Authentication",
                        "d": "Compliance, Infrastructure, Architecture",
                        "correct": "B",
                        "explanation": "The CIA triad represents Confidentiality, Integrity, and Availability — the pillars of security."
                    },
                    {
                        "text": "What is phishing?",
                        "a": "A type of malware",
                        "b": "A social engineering attack using deceptive messages",
                        "c": "A network scanning technique",
                        "d": "A firewall configuration",
                        "correct": "B",
                        "explanation": "Phishing tricks users into revealing information through fraudulent communications."
                    },
                    {
                        "text": "What is two-factor authentication (2FA)?",
                        "a": "Using two passwords",
                        "b": "Verifying identity using two different methods",
                        "c": "Encrypting data twice",
                        "d": "Logging in from two devices",
                        "correct": "B",
                        "explanation": "2FA requires two verification factors (e.g., password + OTP) for identity confirmation."
                    },
                    {
                        "text": "Which protocol provides encrypted web communication?",
                        "a": "HTTP", "b": "FTP", "c": "HTTPS", "d": "SMTP",
                        "correct": "C",
                        "explanation": "HTTPS uses TLS/SSL encryption for secure browser-server communication."
                    },
                    {
                        "text": "What is a firewall's primary function?",
                        "a": "Antivirus scanning",
                        "b": "Monitoring and controlling network traffic",
                        "c": "Data backup",
                        "d": "Password management",
                        "correct": "B",
                        "explanation": "Firewalls monitor traffic based on security rules, acting as a barrier between networks."
                    },
                ],
            },
        ]

        for quiz_data in quizzes_data:
            quiz = Quiz(
                title=quiz_data["title"],
                description=quiz_data["description"],
                competency_area=quiz_data["competency_area"],
                total_questions=len(quiz_data["questions"]),
            )
            db.add(quiz)
            db.flush()

            for i, q in enumerate(quiz_data["questions"]):
                question = Question(
                    quiz_id=quiz.id,
                    question_text=q["text"],
                    option_a=q["a"],
                    option_b=q["b"],
                    option_c=q["c"],
                    option_d=q["d"],
                    correct_option=q["correct"],
                    explanation=q["explanation"],
                    question_order=i + 1,
                )
                db.add(question)

        db.commit()
        print("✅ Database seeded successfully!")
        print()
        print("Demo accounts:")
        print("  Admin:    admin@samarthya.demo / admin123")
        print("  Official: rajesh.kumar@samarthya.demo / official123")
        print("  Official: priya.sharma@samarthya.demo / official123")
        print("  Official: amit.patel@samarthya.demo / official123")
        print("  Official: sneha.reddy@samarthya.demo / official123")
        print("  Official: vikram.singh@samarthya.demo / official123")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
