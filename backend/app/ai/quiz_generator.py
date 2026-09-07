"""
Quiz Generator Service

For the MVP, uses a deterministic mock generator with a pre-built question bank.
The interface is designed so a real LLM can replace the mock logic later.

Future flow:
  extracted text → RAG chunks → LLM prompt → MCQ generation → validation → quiz
"""

import random
import hashlib


# Pre-built question bank organized by competency area
QUESTION_BANK: dict[str, list[dict]] = {
    "Data Analysis": [
        {
            "question_text": "Which of the following is a measure of central tendency?",
            "option_a": "Standard Deviation",
            "option_b": "Mean",
            "option_c": "Variance",
            "option_d": "Range",
            "correct_option": "B",
            "explanation": "Mean (average) is a measure of central tendency, along with median and mode. Standard deviation, variance, and range are measures of dispersion.",
        },
        {
            "question_text": "What does a p-value less than 0.05 typically indicate in hypothesis testing?",
            "option_a": "The null hypothesis is true",
            "option_b": "The result is statistically significant",
            "option_c": "The sample size is too small",
            "option_d": "The data is normally distributed",
            "correct_option": "B",
            "explanation": "A p-value < 0.05 means there is less than a 5% probability that the observed result occurred by chance, indicating statistical significance.",
        },
        {
            "question_text": "Which type of chart is best for showing trends over time?",
            "option_a": "Pie chart",
            "option_b": "Bar chart",
            "option_c": "Line chart",
            "option_d": "Scatter plot",
            "correct_option": "C",
            "explanation": "Line charts are ideal for displaying trends and changes over continuous time periods.",
        },
        {
            "question_text": "What is the primary purpose of data normalization?",
            "option_a": "To increase dataset size",
            "option_b": "To bring values to a common scale",
            "option_c": "To remove all outliers",
            "option_d": "To encrypt sensitive data",
            "correct_option": "B",
            "explanation": "Normalization scales data to a common range (e.g., 0-1), making features comparable in analysis and machine learning.",
        },
        {
            "question_text": "Which SQL clause is used to filter grouped data?",
            "option_a": "WHERE",
            "option_b": "GROUP BY",
            "option_c": "HAVING",
            "option_d": "ORDER BY",
            "correct_option": "C",
            "explanation": "HAVING filters groups after GROUP BY is applied. WHERE filters individual rows before grouping.",
        },
        {
            "question_text": "What does ETL stand for in data processing?",
            "option_a": "Extract, Transform, Load",
            "option_b": "Evaluate, Test, Launch",
            "option_c": "Encode, Transfer, Log",
            "option_d": "Edit, Tabulate, List",
            "correct_option": "A",
            "explanation": "ETL (Extract, Transform, Load) is a process of extracting data from sources, transforming it, and loading it into a target system.",
        },
    ],
    "AI & ML": [
        {
            "question_text": "What is supervised learning?",
            "option_a": "Learning without any data",
            "option_b": "Learning from labeled training data",
            "option_c": "Learning by trial and error",
            "option_d": "Learning from unlabeled data only",
            "correct_option": "B",
            "explanation": "Supervised learning uses labeled data (input-output pairs) to train models that can predict outputs for new inputs.",
        },
        {
            "question_text": "Which algorithm is commonly used for classification tasks?",
            "option_a": "Linear Regression",
            "option_b": "K-Means Clustering",
            "option_c": "Decision Tree",
            "option_d": "Principal Component Analysis",
            "correct_option": "C",
            "explanation": "Decision Trees are commonly used for classification by splitting data based on feature values to predict categories.",
        },
        {
            "question_text": "What is overfitting in machine learning?",
            "option_a": "Model performs well on both training and test data",
            "option_b": "Model performs well on training data but poorly on new data",
            "option_c": "Model is too simple to capture patterns",
            "option_d": "Model has too few parameters",
            "correct_option": "B",
            "explanation": "Overfitting occurs when a model memorizes training data patterns (including noise) and fails to generalize to unseen data.",
        },
        {
            "question_text": "What does NLP stand for in AI?",
            "option_a": "Neural Learning Process",
            "option_b": "Natural Language Processing",
            "option_c": "Network Layer Protocol",
            "option_d": "Numeric Linear Programming",
            "correct_option": "B",
            "explanation": "NLP (Natural Language Processing) is a branch of AI that enables computers to understand, interpret, and generate human language.",
        },
        {
            "question_text": "Which metric is used to evaluate classification models?",
            "option_a": "Mean Squared Error",
            "option_b": "R-squared",
            "option_c": "F1 Score",
            "option_d": "Mean Absolute Error",
            "correct_option": "C",
            "explanation": "F1 Score balances precision and recall, making it suitable for evaluating classification model performance.",
        },
    ],
    "Data Visualization": [
        {
            "question_text": "Which visualization tool is developed by Tableau Software?",
            "option_a": "Power BI",
            "option_b": "Tableau",
            "option_c": "QlikView",
            "option_d": "Looker",
            "correct_option": "B",
            "explanation": "Tableau is a leading data visualization platform developed by Tableau Software (now part of Salesforce).",
        },
        {
            "question_text": "What is a heat map best used for?",
            "option_a": "Showing proportions of a whole",
            "option_b": "Displaying correlation or density patterns",
            "option_c": "Tracking trends over time",
            "option_d": "Comparing categories",
            "correct_option": "B",
            "explanation": "Heat maps use color intensity to represent data density or correlation strength across two dimensions.",
        },
        {
            "question_text": "Which principle states that visualizations should maximize the data-ink ratio?",
            "option_a": "Gestalt Principles",
            "option_b": "Tufte's Data-Ink Ratio",
            "option_c": "Shneiderman's Mantra",
            "option_d": "Nielsen's Heuristics",
            "correct_option": "B",
            "explanation": "Edward Tufte's data-ink ratio principle advocates for minimizing non-data elements to maximize the proportion of ink used for actual data representation.",
        },
        {
            "question_text": "What type of chart is best for comparing parts to a whole?",
            "option_a": "Line chart",
            "option_b": "Scatter plot",
            "option_c": "Pie chart",
            "option_d": "Box plot",
            "correct_option": "C",
            "explanation": "Pie charts display proportional data showing how parts relate to the whole. However, bar charts are often more readable.",
        },
        {
            "question_text": "What does the 'Overview first, zoom and filter, details on demand' mantra describe?",
            "option_a": "Database query optimization",
            "option_b": "Visual information-seeking strategy",
            "option_c": "Machine learning pipeline",
            "option_d": "Software testing approach",
            "correct_option": "B",
            "explanation": "This is Shneiderman's Visual Information-Seeking Mantra, a fundamental principle for interactive data visualization design.",
        },
    ],
    "Statistics": [
        {
            "question_text": "What is the median of the dataset: 3, 7, 8, 12, 14?",
            "option_a": "7",
            "option_b": "8",
            "option_c": "8.8",
            "option_d": "12",
            "correct_option": "B",
            "explanation": "For an ordered dataset with odd number of values, the median is the middle value. Here, 8 is the 3rd value in the sorted set.",
        },
        {
            "question_text": "What type of probability distribution is used for binary outcomes?",
            "option_a": "Normal distribution",
            "option_b": "Binomial distribution",
            "option_c": "Poisson distribution",
            "option_d": "Exponential distribution",
            "correct_option": "B",
            "explanation": "The binomial distribution models the number of successes in a fixed number of independent binary (yes/no) trials.",
        },
        {
            "question_text": "What does a correlation coefficient of -0.9 indicate?",
            "option_a": "Strong positive correlation",
            "option_b": "No correlation",
            "option_c": "Strong negative correlation",
            "option_d": "Weak negative correlation",
            "correct_option": "C",
            "explanation": "A correlation coefficient near -1 indicates a strong negative linear relationship: as one variable increases, the other decreases.",
        },
        {
            "question_text": "Which sampling method gives every member of the population an equal chance of selection?",
            "option_a": "Convenience sampling",
            "option_b": "Stratified sampling",
            "option_c": "Simple random sampling",
            "option_d": "Quota sampling",
            "correct_option": "C",
            "explanation": "Simple random sampling ensures every individual has an equal probability of being selected, reducing selection bias.",
        },
        {
            "question_text": "What is a Type I error in hypothesis testing?",
            "option_a": "Failing to reject a false null hypothesis",
            "option_b": "Rejecting a true null hypothesis",
            "option_c": "Accepting the alternative hypothesis correctly",
            "option_d": "Having insufficient sample size",
            "correct_option": "B",
            "explanation": "A Type I error (false positive) occurs when we reject the null hypothesis when it is actually true.",
        },
    ],
    "Cybersecurity": [
        {
            "question_text": "What does the CIA triad stand for in cybersecurity?",
            "option_a": "Computer, Internet, Application",
            "option_b": "Confidentiality, Integrity, Availability",
            "option_c": "Control, Identity, Authentication",
            "option_d": "Compliance, Infrastructure, Architecture",
            "correct_option": "B",
            "explanation": "The CIA triad represents the three pillars of information security: Confidentiality, Integrity, and Availability.",
        },
        {
            "question_text": "What is phishing?",
            "option_a": "A type of malware",
            "option_b": "A social engineering attack using deceptive communications",
            "option_c": "A network scanning technique",
            "option_d": "A firewall configuration",
            "correct_option": "B",
            "explanation": "Phishing uses fraudulent emails/messages to trick users into revealing sensitive information or clicking malicious links.",
        },
        {
            "question_text": "What is two-factor authentication (2FA)?",
            "option_a": "Using two different passwords",
            "option_b": "Verifying identity using two different methods",
            "option_c": "Encrypting data twice",
            "option_d": "Logging in from two devices",
            "correct_option": "B",
            "explanation": "2FA requires two different verification factors (e.g., password + OTP) to confirm identity, adding an extra security layer.",
        },
        {
            "question_text": "Which protocol provides encrypted web communication?",
            "option_a": "HTTP",
            "option_b": "FTP",
            "option_c": "HTTPS",
            "option_d": "SMTP",
            "correct_option": "C",
            "explanation": "HTTPS uses TLS/SSL encryption to secure data transmitted between web browsers and servers.",
        },
        {
            "question_text": "What is a firewall's primary function?",
            "option_a": "Antivirus scanning",
            "option_b": "Monitoring and controlling network traffic",
            "option_c": "Data backup",
            "option_d": "Password management",
            "correct_option": "B",
            "explanation": "Firewalls monitor incoming and outgoing network traffic based on security rules, acting as a barrier between trusted and untrusted networks.",
        },
    ],
    "Project Management": [
        {
            "question_text": "What does the Agile methodology emphasize?",
            "option_a": "Comprehensive documentation over working software",
            "option_b": "Iterative development and customer collaboration",
            "option_c": "Strict sequential phases",
            "option_d": "Minimal stakeholder involvement",
            "correct_option": "B",
            "explanation": "Agile prioritizes iterative development, customer collaboration, and responding to change over rigid planning.",
        },
        {
            "question_text": "What is a Gantt chart used for?",
            "option_a": "Budget tracking",
            "option_b": "Scheduling and tracking project tasks over time",
            "option_c": "Risk assessment",
            "option_d": "Team performance evaluation",
            "correct_option": "B",
            "explanation": "Gantt charts visually display project tasks, their durations, and dependencies along a timeline.",
        },
        {
            "question_text": "What is the critical path in project management?",
            "option_a": "The shortest path through a project",
            "option_b": "The longest sequence of dependent tasks determining project duration",
            "option_c": "The most expensive set of tasks",
            "option_d": "The set of optional tasks",
            "correct_option": "B",
            "explanation": "The critical path is the longest sequence of dependent tasks that determines the minimum project duration. Delays here delay the entire project.",
        },
        {
            "question_text": "What does RACI stand for?",
            "option_a": "Risk, Assessment, Control, Implementation",
            "option_b": "Responsible, Accountable, Consulted, Informed",
            "option_c": "Requirements, Analysis, Coding, Integration",
            "option_d": "Review, Approve, Coordinate, Implement",
            "correct_option": "B",
            "explanation": "RACI is a responsibility matrix that clarifies roles: who is Responsible, Accountable, Consulted, and Informed for each task.",
        },
        {
            "question_text": "What is a project milestone?",
            "option_a": "A task with the longest duration",
            "option_b": "A significant checkpoint or achievement in a project",
            "option_c": "A daily team meeting",
            "option_d": "A budget review point",
            "correct_option": "B",
            "explanation": "Milestones mark key achievements or decision points in a project timeline, helping track progress.",
        },
    ],
}

# Default questions when no competency match is found
DEFAULT_QUESTIONS = [
    {
        "question_text": "What is the primary purpose of e-governance?",
        "option_a": "Replacing all government employees with AI",
        "option_b": "Improving government service delivery through technology",
        "option_c": "Collecting taxes online only",
        "option_d": "Reducing government departments",
        "correct_option": "B",
        "explanation": "E-governance uses ICT to improve efficiency, transparency, and accessibility of government services for citizens.",
    },
    {
        "question_text": "What does the Digital India initiative primarily aim to achieve?",
        "option_a": "Ban physical documents",
        "option_b": "Transform India into a digitally empowered society",
        "option_c": "Replace teachers with computers",
        "option_d": "Eliminate cash transactions",
        "correct_option": "B",
        "explanation": "Digital India aims to transform India into a digitally empowered society and knowledge economy through digital infrastructure and services.",
    },
    {
        "question_text": "What is the purpose of the iGOT Karmayogi platform?",
        "option_a": "Online shopping for government employees",
        "option_b": "Competency-based learning for civil servants",
        "option_c": "Social media for bureaucrats",
        "option_d": "Government recruitment portal",
        "correct_option": "B",
        "explanation": "iGOT Karmayogi is an integrated government online training platform for capacity building and competency-based learning for civil servants.",
    },
    {
        "question_text": "What is capacity building in the context of government?",
        "option_a": "Constructing more government buildings",
        "option_b": "Developing skills and abilities of government employees",
        "option_c": "Increasing the number of employees",
        "option_d": "Expanding office space",
        "correct_option": "B",
        "explanation": "Capacity building strengthens the skills, abilities, and resources of government employees to perform their duties effectively.",
    },
    {
        "question_text": "Which of these is a key component of good governance?",
        "option_a": "Opacity in decision-making",
        "option_b": "Accountability and transparency",
        "option_c": "Centralized power with no oversight",
        "option_d": "Limited citizen participation",
        "correct_option": "B",
        "explanation": "Good governance requires accountability, transparency, responsiveness, and the rule of law to serve public interest.",
    },
]


class MockQuizGenerator:
    """Generates quizzes using a pre-built question bank.

    This is a deterministic mock that can be replaced with an LLM-based
    generator once an API key is provided.
    """

    def generate(self, text: str = "", competency_area: str = "", num_questions: int = 5) -> dict:
        """Generate a quiz dictionary with questions.

        Args:
            text: Optional extracted text from learning material.
            competency_area: Competency area to select questions for.
            num_questions: Number of questions to generate.

        Returns:
            Dict with title, description, and list of question dicts.
        """
        # Find matching questions from the bank
        questions: list[dict] = []

        # Try exact area match first
        for area, qs in QUESTION_BANK.items():
            if area.lower() in competency_area.lower() or competency_area.lower() in area.lower():
                questions.extend(qs)

        # If we have text, try keyword matching
        if text and not questions:
            text_lower = text.lower()
            for area, qs in QUESTION_BANK.items():
                if area.lower().split()[0] in text_lower:
                    questions.extend(qs)

        # Fallback to defaults
        if not questions:
            questions = DEFAULT_QUESTIONS.copy()

        # Use a deterministic seed based on competency + text hash for reproducibility
        seed_str = competency_area + text[:100] if text else competency_area
        seed = int(hashlib.md5(seed_str.encode()).hexdigest()[:8], 16)
        rng = random.Random(seed)

        rng.shuffle(questions)
        selected = questions[:num_questions]

        title = f"{competency_area} Assessment" if competency_area else "General Assessment"
        description = f"Auto-generated quiz covering {competency_area or 'general topics'}. {len(selected)} questions."

        return {
            "title": title,
            "description": description,
            "questions": selected,
        }
