<<<<<<< HEAD
# SAMARTHYA AI — AI-Powered Personalized Learning Platform

**Smart India Hackathon 2026**

SAMARTHYA AI is a competency-based learning platform for government officials in India's Official Statistical System. It identifies competency gaps, recommends personalized learning from the iGOT Karmayogi catalogue, and generates quizzes from uploaded learning materials using an AI-ready RAG + LLM architecture.

---

## Tech Stack

| Layer          | Technology                                |
|----------------|-------------------------------------------|
| Frontend       | React 18 + TypeScript + Tailwind CSS v3   |
| Charts         | Recharts                                  |
| Icons          | Lucide React                              |
| Backend        | Python 3.11 + FastAPI + SQLAlchemy        |
| Database       | MySQL 8.0                                 |
| Authentication | JWT + bcrypt + RBAC                       |
| AI Architecture| RAG + LLM-ready (mock for demo)           |
| Deployment     | Docker + docker-compose                   |

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.10+
- **MySQL** 8.0 (or Docker)
- **Docker** (optional, for containerized setup)

### Option 1: Docker (Recommended)

```bash
# Clone and navigate
cd samarthya-ai

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up --build

# In another terminal, seed the database
docker exec samarthya-backend python seed_data.py
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs

### Option 2: Manual Setup

#### 1. MySQL Database

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS samarthya_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'samarthya_user'@'localhost' IDENTIFIED BY 'samarthya_pass';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON samarthya_db.* TO 'samarthya_user'@'localhost'; FLUSH PRIVILEGES;"
```

#### 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set environment variables (or create .env file in backend/)
# DATABASE_URL=mysql+pymysql://samarthya_user:samarthya_pass@localhost:3306/samarthya_db

# Run seed script
python seed_data.py

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Demo Credentials

| Role     | Email                         | Password    |
|----------|-------------------------------|-------------|
| Admin    | admin@samarthya.demo          | admin123    |
| Official | rajesh.kumar@samarthya.demo   | official123 |
| Official | priya.sharma@samarthya.demo   | official123 |
| Official | amit.patel@samarthya.demo     | official123 |
| Official | sneha.reddy@samarthya.demo    | official123 |
| Official | vikram.singh@samarthya.demo   | official123 |

---

## Project Architecture

```
samarthya-ai/
├── frontend/                    # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── contexts/            # Auth context
│   │   ├── layouts/             # Dashboard layout (sidebar + header)
│   │   ├── pages/
│   │   │   ├── official/        # Official portal pages
│   │   │   └── admin/           # Admin portal pages
│   │   ├── services/            # API client (Axios)
│   │   └── types/               # TypeScript interfaces
│   └── ...
├── backend/                     # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── ai/                  # AI/ML services (mock + future LLM)
│   │   │   ├── rag_service.py
│   │   │   ├── quiz_generator.py
│   │   │   ├── competency_engine.py
│   │   │   └── course_matcher.py
│   │   ├── auth/                # JWT + RBAC
│   │   ├── integrations/        # iGOT adapter (mock → real)
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── routers/             # API route handlers
│   │   └── schemas/             # Pydantic request/response schemas
│   └── seed_data.py             # Sample data seeder
├── database/
│   └── init.sql                 # MySQL initialization
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Application Flow

```
User Login (JWT)
    │
    ├── Official Portal
    │   ├── Dashboard ─────────── competency overview, recommendations
    │   ├── Profile ───────────── view/edit official profile
    │   ├── Competency Analysis ── gap analysis (current vs required)
    │   ├── Learning Path ─────── personalized course sequence
    │   ├── iGOT Courses ──────── browse courses (mock iGOT API)
    │   ├── Materials ─────────── upload PDF/PPTX → generate quiz
    │   ├── Quiz ──────────────── take quizzes, view scores
    │   ├── Results ───────────── assessment history
    │   └── Progress ──────────── learning journey tracking
    │
    └── Admin Portal
        ├── Dashboard ─────────── platform statistics
        ├── Officials ─────────── manage all officials
        ├── Competencies ──────── competency framework
        ├── Courses ───────────── course catalogue
        └── Analytics ─────────── platform insights
```

---

## API Endpoints

| Method | Endpoint                    | Description                      |
|--------|-----------------------------|----------------------------------|
| POST   | /api/auth/login             | Login and get JWT token          |
| POST   | /api/auth/register          | Register new user                |
| GET    | /api/auth/me                | Get current user                 |
| GET    | /api/official/profile       | Get official profile             |
| PUT    | /api/official/profile       | Update official profile          |
| GET    | /api/competencies           | List all competencies            |
| GET    | /api/competencies/gaps      | Get competency gaps              |
| GET    | /api/courses                | List all courses                 |
| GET    | /api/courses/recommended    | Get recommended courses          |
| GET    | /api/learning-path          | Get learning path                |
| POST   | /api/materials/upload       | Upload PDF/PPTX                  |
| GET    | /api/materials              | List uploaded materials           |
| GET    | /api/quizzes                | List available quizzes           |
| GET    | /api/quizzes/{id}           | Get quiz with questions          |
| POST   | /api/quizzes/{id}/submit    | Submit quiz answers              |
| POST   | /api/quizzes/generate       | Generate quiz from material      |
| GET    | /api/progress               | Get learning progress            |
| GET    | /api/results                | Get assessment results           |
| GET    | /api/admin/statistics       | Admin platform stats             |
| GET    | /api/admin/officials        | Admin list all officials         |

---

## Future Integration

### iGOT Karmayogi
Replace `backend/app/integrations/igot_adapter.py` with real API calls. The adapter pattern ensures zero changes to the rest of the codebase.

### LLM / RAG Pipeline
1. Add your LLM API key to `.env` (`LLM_API_KEY`)
2. Update `backend/app/ai/rag_service.py` with real embeddings and vector store
3. Update `backend/app/ai/quiz_generator.py` with LLM-based generation
4. The quiz generation API (`POST /api/quizzes/generate`) automatically uses the real generator when an API key is present

**Future AI Flow:**
```
PDF/PPT Upload → Text Extraction → Chunking → Embeddings → Vector Store
    ↓
Query → Retrieve Relevant Chunks → LLM Prompt → MCQ Generation → Validation → Quiz
```

---

## License

Built for Smart India Hackathon 2026.
=======
# SAMARTHYA AI

## AI-Powered Personalized Learning Platform for Officials

> **Turning Competency Gaps into Personalized Learning Paths.**

SAMARTHYA AI is an **Adaptive Intelligence learning platform** designed
to support competency-based capacity building for government officials.

The platform identifies competency gaps based on an official's role and
skills, recommends relevant learning paths and iGOT Karmayogi courses,
and enables officials to practice through AI-assisted MCQs and quizzes
generated from uploaded learning materials.

------------------------------------------------------------------------

## 🚀 Prototype

SAMARTHYA AI prototype demonstrates the complete learning and competency
workflow through a web-based portal.

### Prototype Modules

-   👤 Official Profile
-   📊 Competency Gap Analysis
-   🎯 Personalized Learning Path
-   📚 iGOT Course Discovery
-   📄 Learning Material Upload
-   🧠 AI-Assisted MCQ / Quiz Generation
-   📝 Quiz Assessment
-   🏆 Results
-   📈 Progress Tracking
-   🛡️ Role-Based Admin Dashboard
-   ⚙️ Competency Framework Management
-   📊 Administrative Analytics

### Prototype Screens

The prototype includes:

1.  **Competency Gap Analysis**\
    Compares current and required competency scores across technical,
    functional and behavioral competencies.

2.  **Quiz Module**\
    Provides auto-generated assessments for knowledge practice and
    improvement.

3.  **Competency Framework**\
    Allows administrators to organize competencies into categories and
    define competency requirements.

4.  **Learning & Progress Workflow**\
    Supports personalized learning and progress tracking.

------------------------------------------------------------------------

## 🎯 Problem

Government officials need continuous skill development as technologies,
tools and statistical practices evolve.

However:

-   Officials have different competency requirements based on their
    roles.
-   Finding the most relevant learning course for a particular
    competency gap can be difficult.
-   Learning materials require an efficient way to become
    practice-oriented assessments.
-   A common learning path may not address individual competency needs.
-   Training administrators need data-driven visibility into competency
    and learning progress.

SAMARTHYA AI addresses these challenges through an adaptive,
competency-driven learning workflow.

------------------------------------------------------------------------

## 💡 Solution

SAMARTHYA AI follows:

``` text
ASSESS
   ↓
PERSONALIZE
   ↓
LEARN
   ↓
PRACTICE
   ↓
MEASURE
   ↓
ADAPT
```

### Core Workflow

``` text
Role + Experience + Skills + Previous Training + Assessment Results
                              ↓
                    Competency Profile
                              ↓
                    Skill-Gap Analysis
                              ↓
               Personalized Learning Path
                              ↓
             Relevant iGOT Course Discovery
                              ↓
               Learning Material / Courses
                              ↓
             AI-Assisted MCQs & Quizzes
                              ↓
                         Assessment
                              ↓
                    Results & Progress
                              ↓
                   Updated Learning Path
```

------------------------------------------------------------------------

# ⭐ Key Features

## 1. Competency Profile

SAMARTHYA AI builds an official's competency profile using information
such as:

-   Job role
-   Experience
-   Current skills
-   Previous training
-   Assessment results

The profile forms the basis for personalized competency analysis.

------------------------------------------------------------------------

## 2. Competency Gap Analysis

The prototype compares:

``` text
Current Competency
        VS
Required Competency
```

The dashboard provides:

-   Overall competency score
-   Total competency gap
-   Number of competencies
-   Current vs. required competency charts
-   Competency radar visualization
-   Detailed gap analysis

The prototype currently demonstrates **8 competencies** across
technical, functional and behavioral areas.

### Example competency areas

**Technical** - AI & ML - Data Analysis - Data Visualization -
Cybersecurity - Statistics

**Functional** - Project Management - Digital Literacy

**Behavioral** - Communication

------------------------------------------------------------------------

## 3. Personalized Learning Path

Based on identified competency gaps, SAMARTHYA AI can recommend relevant
learning resources and structure them into a personalized learning path.

The objective is:

> **Right Skill → Right Course → Right Learning Path**

The learning path can adapt as the official's competency and assessment
performance improve.

------------------------------------------------------------------------

## 4. iGOT Course Recommendation

SAMARTHYA AI is designed to connect with a mock iGOT Karmayogi
environment during prototyping and support future integration through an
iGOT adapter / API-based architecture.

The recommendation workflow is:

``` text
Competency Gap
      ↓
Required Skill
      ↓
Course Matching
      ↓
Relevant iGOT Course
      ↓
Personalized Learning Path
```

------------------------------------------------------------------------

## 5. AI-Assisted MCQ & Quiz Generation

Officials can upload learning materials such as:

-   PDF
-   PPT / presentation-based learning content

The planned AI pipeline uses:

``` text
Learning Material
       ↓
Document Processing
       ↓
RAG
       ↓
LLM
       ↓
Question Generation
       ↓
Question Validation
       ↓
MCQ / Quiz
       ↓
Assessment
```

The purpose is to transform learning content into competency-focused
practice assessments.

> **Note:** AI-generated questions should be validated before being
> treated as authoritative assessment content.

------------------------------------------------------------------------

## 6. Quiz & Assessment

The prototype includes a quiz interface for knowledge practice.

It supports:

-   Quiz listing
-   Topic/category information
-   Question-based assessment
-   Assessment results
-   Progress tracking

------------------------------------------------------------------------

## 7. Learner Dashboard

The official-facing portal provides navigation for:

-   Dashboard
-   Profile
-   Competency
-   Learning Path
-   iGOT Courses
-   Materials
-   Quiz
-   Results
-   Progress

This provides a single learning workflow for the official.

------------------------------------------------------------------------

## 8. Administrator Dashboard

The prototype also includes an administrator portal.

Administrators can access areas such as:

-   Officials
-   Competencies
-   Courses
-   Analytics

### Competency Framework

The administrator interface organizes competencies into categories:

``` text
Technical
├── AI & ML
├── Data Analysis
├── Data Visualization
├── Cybersecurity
└── Statistics

Functional
├── Project Management
└── Digital Literacy

Behavioral
└── Communication
```

This framework can support role-based competency mapping and future
training analytics.

------------------------------------------------------------------------

# 🏗️ System Architecture

``` text
                    ┌─────────────────────┐
                    │       OFFICIAL      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React + TypeScript  │
                    │    Web Frontend     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Python + FastAPI │
                    │     Backend API     │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼──────────────────┐
             │                 │                  │
             ▼                 ▼                  ▼
     ┌──────────────┐  ┌───────────────┐  ┌───────────────┐
     │ Skill-Gap    │  │ RAG + LLM     │  │ Course        │
     │ Engine       │  │ AI Pipeline   │  │ Matching      │
     └──────┬───────┘  └───────┬───────┘  └──────┬────────┘
            │                  │                  │
            └──────────────────┼──────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │       MySQL         │
                    │      Database       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    iGOT Adapter     │
                    │ / Mock API Layer    │
                    └─────────────────────┘
```

------------------------------------------------------------------------

# 🧠 AI & Algorithmic Approach

SAMARTHYA AI uses two main intelligence components.

## Skill-Gap Scoring

The system compares an official's current competency with the required
competency for their role.

Conceptually:

``` text
Skill Gap = Required Competency - Current Competency
```

The identified gaps are prioritized to support personalized learning
recommendations.

------------------------------------------------------------------------

## Semantic Course Matching

Courses can be matched with competency requirements using semantic
similarity and skill relevance.

``` text
Competency Gap
      ↓
Required Skill / Topic
      ↓
Semantic Matching
      ↓
Relevant Courses
      ↓
Personalized Recommendation
```

------------------------------------------------------------------------

## RAG + LLM

Retrieval-Augmented Generation is planned for learning-material-based
question generation.

``` text
PDF / PPT
   ↓
Extract Content
   ↓
Create Knowledge Context
   ↓
Retrieve Relevant Content
   ↓
LLM
   ↓
Generate Questions
   ↓
Validate
   ↓
MCQs / Quiz
```

RAG helps ground generated questions in the uploaded learning material
instead of relying only on general model knowledge.

------------------------------------------------------------------------

# 🛠️ Technology Stack

  Layer            Technology
  ---------------- ----------------------------------------------
  Frontend         React.js
  Language         TypeScript
  UI               Tailwind CSS
  Backend          Python
  API Framework    FastAPI
  AI               RAG + LLM
  Algorithms       Skill-gap scoring + semantic course matching
  Database         MySQL
  Authentication   SSO + JWT
  Authorization    RBAC
  Deployment       Docker + Cloud
  Integration      iGOT Adapter / Mock API

------------------------------------------------------------------------

# 🔐 Security

SAMARTHYA AI is designed with role-based access and secure API
communication in mind.

### Security Components

-   **SSO** for authentication integration
-   **JWT** for secure session/API authorization
-   **RBAC** for role-based access control
-   Secure API architecture
-   Controlled administrator access

### Example Roles

``` text
OFFICIAL
   ↓
Learning + Competency + Assessment

ADMIN
   ↓
Competency Framework + Courses + Analytics
```

------------------------------------------------------------------------

# 📊 Prototype Competency Example

The current prototype demonstrates competency analysis using 8
competency areas.

Example dashboard fields include:

``` text
Overall Score
Total Gap
Competencies
Current vs Required Competency
Competency Radar
Detailed Gap Analysis
```

The prototype is intended to demonstrate the system workflow and user
experience. Values shown in the prototype are demonstration data unless
explicitly validated using real institutional datasets.

------------------------------------------------------------------------

# 👥 Who Benefits?

## MoSPI

-   Competency-based capacity building
-   Data-driven training decisions
-   Strengthening the Official Statistical System

## Government Officials

-   Personalized learning
-   Role- and skill-based recommendations
-   Relevant learning paths
-   AI-assisted practice assessments
-   Continuous skill development

## NSSTA

-   Targeted training and assessment
-   Competency framework support
-   Training analytics
-   Large-scale capacity-building support

## iGOT Ecosystem

-   Better course discovery
-   Personalized learning pathways
-   Improved learner engagement
-   Potential integration with competency-driven learning

------------------------------------------------------------------------

# 🌱 SDG Alignment

## SDG 4 --- Quality Education

SAMARTHYA AI supports:

-   Continuous learning
-   Personalized learning
-   Competency-based development
-   Accessible practice and assessment
-   Skill development for a future-ready workforce

------------------------------------------------------------------------

# 📈 Expected Impact

SAMARTHYA AI aims to improve:

### 🎯 Course Relevance

Help officials find learning resources aligned with their competency
gaps.

### 🧠 Assessment Readiness

Provide AI-assisted practice through quizzes and MCQs.

### 📊 Learning Efficiency

Reduce unnecessary course discovery effort through personalized learning
paths.

### 🚀 Competency Development

Enable continuous measurement and adaptation based on learning outcomes.

### 🏛️ Training Decisions

Provide administrators with competency and progress insights for better
capacity-building decisions.

------------------------------------------------------------------------

# 🔄 Scalability

The architecture is designed to follow:

``` text
PILOT
  ↓
VALIDATE
  ↓
INTEGRATE
  ↓
SCALE
```

Potential future expansion includes:

-   More government departments
-   More competency frameworks
-   More learning domains
-   Larger course catalogues
-   Expanded analytics
-   Production iGOT integration
-   More advanced adaptive learning models

------------------------------------------------------------------------

# 🧪 Validation Plan

Before production deployment, the system should be validated using
representative data and user testing.

### Suggested validation areas

-   Competency-gap accuracy
-   Course recommendation relevance
-   MCQ quality
-   Question grounding in source material
-   Assessment usefulness
-   User experience
-   Security
-   API performance
-   Scalability

AI-generated assessment content should include appropriate validation
and human oversight.

------------------------------------------------------------------------

# 🚀 Getting Started

## Prerequisites

Install the following before running the project:

-   Node.js
-   Python
-   MySQL
-   Git
-   Docker *(optional for containerized deployment)*

------------------------------------------------------------------------

## Clone the Repository

``` bash
git clone https://github.com/YOUR-USERNAME/samarthya-ai.git
cd samarthya-ai
```

Replace `YOUR-USERNAME` with the GitHub account that hosts this
repository.

------------------------------------------------------------------------

# 💻 Frontend Setup

Move into the frontend directory:

``` bash
cd frontend
```

Install dependencies:

``` bash
npm install
```

Start the development server:

``` bash
npm run dev
```

The terminal will display the local development URL.

------------------------------------------------------------------------

# ⚙️ Backend Setup

Open a second terminal.

``` bash
cd backend
```

Create a Python virtual environment:

``` bash
python -m venv .venv
```

Activate it on Windows:

``` bash
.venv\Scripts\activate
```

Activate it on Linux/macOS:

``` bash
source .venv/bin/activate
```

Install dependencies:

``` bash
pip install -r requirements.txt
```

Start the FastAPI server using the command configured by the project:

``` bash
python -m uvicorn app.main:app --reload
```

------------------------------------------------------------------------

# 🔑 Environment Variables

Do **not** commit secrets or API keys to GitHub.

Create a local `.env` file based on the variables required by your
implementation.

Example:

``` env
DATABASE_URL=your_database_connection
SECRET_KEY=your_secret_key
LLM_API_KEY=your_api_key
```

Use placeholder values in documentation.

### Never upload:

``` text
.env
API keys
Passwords
Database credentials
JWT secrets
Private tokens
```

------------------------------------------------------------------------

# 🗂️ Recommended Repository Structure

``` text
samarthya-ai/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── ...
│
├── ai/
│   ├── rag/
│   ├── mcq/
│   └── ...
│
├── docs/
│   ├── architecture/
│   ├── screenshots/
│   └── demo/
│
├── .gitignore
├── README.md
└── LICENSE
```

Adjust this structure to match the actual implementation before
publishing.

------------------------------------------------------------------------

# 📸 Prototype Screenshots

Recommended screenshots for the repository:

``` text
docs/
└── screenshots/
    ├── dashboard.png
    ├── competency-gap.png
    ├── quiz.png
    └── admin-framework.png
```

Add them to this README using:

``` markdown
![Competency Gap Analysis](docs/screenshots/competency-gap.png)
```

Use screenshots from the actual working prototype rather than
concept/mock images.

------------------------------------------------------------------------

# 🎥 Demo

## Live Prototype

> Add your deployed prototype URL here.

**Live Demo:** `ADD-LIVE-PROTOTYPE-URL`

## Demo Video

> Add your prototype demonstration video here if available.

**Demo Video:** `ADD-DEMO-VIDEO-URL`

------------------------------------------------------------------------

# 🔗 SIH 2026 Representation

This repository is intended to provide:

-   Prototype source code
-   System architecture
-   Technical implementation
-   Prototype screenshots
-   AI workflow
-   Setup instructions
-   Project documentation

### SIH PPT

The SIH presentation can direct evaluators to:

``` text
Working Prototype → Live Demo / QR Code
Source Code → GitHub Repository
```

------------------------------------------------------------------------

# 🏆 Smart India Hackathon 2026

### Problem Statement

**PS ID:** 26101

### Problem Statement

**AI-POWERED PERSONALIZED LEARNING PLATFORM FOR OFFICIALS**

### Theme

**Smart Education**

### Category

**Software**

### Proposed Solution

**SAMARTHYA AI**

> **AI-Powered Personalized Learning Platform for Officials**

------------------------------------------------------------------------

# 👨‍💻 Team

## Team SturzAlert

  Member            Role / Department
  ----------------- -----------------------
  NITHISHKUMAR S    III CSE --- Team Lead
  ROHITH S          III CSE
  SUBITCHAN L       III CSE
  SHANMUGAPRIYA S   III CSE
  SIVASRI C S       III CSE
  THIRIBUVAN KR     III AIDS

### Faculty Mentor

**Ms. Ramya --- AP/CSE**

------------------------------------------------------------------------

# 📚 References

The project documentation and concept are aligned with the project
research around:

-   iGOT Karmayogi
-   MoSPI --- Ministry of Statistics and Programme Implementation
-   NSSTA --- National Statistical Systems Training Academy
-   Responsible AI principles
-   Competency-based capacity building

Official reference links should be added here before final publication.

------------------------------------------------------------------------

# ⚠️ Prototype Disclaimer

This repository represents a **prototype / proof-of-concept for Smart
India Hackathon 2026**.

Some integrations, datasets, competency scores, course catalogues,
AI-generated content and API connections may use demonstration or mock
data during the prototype stage.

Production deployment would require appropriate institutional
integration, security review, data governance, validation and
authorization.

------------------------------------------------------------------------

# 📜 License

Add the license selected by the project team before publishing the
repository.

For example:

``` text
Copyright © 2026 Team SturzAlert
```

------------------------------------------------------------------------

## ⭐ SAMARTHYA AI

**Assess → Personalize → Learn → Practice → Measure → Adapt**

> **Turning Competency Gaps into Personalized Learning Paths.**
>>>>>>> e0c1709160a06571d9be6b77946b8e731f99d11a
