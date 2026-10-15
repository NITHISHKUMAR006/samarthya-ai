import json
import logging
from typing import Any, Generator, Optional
from app.config import settings

logger = logging.getLogger(__name__)


class OpenAIService:
    """Service wrapper for OpenAI and OpenAI-compatible API providers

    (Supports official OpenAI, OpenRouter, Groq, Ollama, LM Studio, Azure, vLLM, DeepSeek).
    Allows setting custom api_key, custom base_url, and custom model_id at runtime.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model_id: Optional[str] = None,
    ):
        self.api_key = (api_key or settings.OPENAI_API_KEY).strip()
        self.base_url = (base_url or settings.OPENAI_BASE_URL).strip() or "https://api.openai.com/v1"
        self.model_id = (model_id or settings.OPENAI_MODEL_ID).strip() or "gpt-4o-mini"
        self._default_client: Any = None

    def is_key_valid(self, key: Optional[str] = None) -> bool:
        """Checks if a provided or default API key is non-empty and not a placeholder."""
        k = (key if key is not None else self.api_key).strip()
        if not k:
            return False
        if "YOUR-" in k.upper() or "PLACEHOLDER" in k.upper():
            return False
        return True

    @property
    def is_available(self) -> bool:
        return self.is_key_valid(self.api_key)

    def get_client(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
    ) -> Any:
        """Instantiates an OpenAI client with provided or default credentials."""
        target_key = (api_key or self.api_key).strip()
        target_base = (base_url or self.base_url).strip() or "https://api.openai.com/v1"

        # If using default credentials and already created, reuse
        if not api_key and not base_url and self._default_client:
            return self._default_client

        if not self.is_key_valid(target_key):
            return None

        try:
            from openai import OpenAI
            client = OpenAI(
                api_key=target_key,
                base_url=target_base,
                timeout=25.0,
            )
            if not api_key and not base_url:
                self._default_client = client
            return client
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client for base_url '{target_base}': {e}")
            return None

    def _build_messages(
        self,
        user_message: str,
        conversation_history: Optional[list[dict]] = None,
        system_prompt: Optional[str] = None,
    ) -> list[dict]:
        """Constructs the message payload with system instruction and history."""
        default_system = (
            "You are Samarthya AI, the official capacity building advisor for the Government of India, "
            "Ministry of Statistics & Programme Implementation (MoSPI).\n"
            "Your role is to guide public officials in bridging competency gaps, navigating SAMARTHYA courses, "
            "understanding national statistical frameworks (NSSO, NIF, CPI, GDP estimation), and adopting ethical AI in governance.\n\n"
            "RESPONSE FORMATTING REQUIREMENTS:\n"
            "Whenever recommending courses, learning paths, or competencies, you MUST strictly use the following structured markdown layout:\n\n"
            "Assuming you are looking to build competencies around **[Identified Topic/Domain]**, here are recommended courses available on the **SAMARTHYA** portal:\n\n"
            "---\n\n"
            "### 1. [Category Name]\n"
            "* **[Course Name]**\n"
            "* **Competency:** [Primary Competencies Covered]\n"
            "* **Overview:** [Concise, practical description of what is taught and administrative value]\n"
            "* **[Next Course Name]**\n"
            "* **Competency:** [Primary Competencies Covered]\n"
            "* **Overview:** [Concise, practical description]\n\n"
            "---\n\n"
            "### 2. [Next Category Name (if applicable)]\n"
            "* **[Course Name]**\n"
            "* **Competency:** [Competencies]\n"
            "* **Overview:** [Description]\n\n"
            "Rules:\n"
            "- Always use **bold text** for course names, key terms, and the 'Competency:' / 'Overview:' labels.\n"
            "- Always place '---' dividers between major sections.\n"
            "- Always use '###' with numbered headers for course categories (e.g. '### 1. Foundational Data & Quantitative Literacy').\n"
            "- When organizing progressive learning roadmaps or multi-phase gap closure plans, use '####' phased headers with gap targets: '#### Phase 1: Foundational & Responsible AI (Closes ~10% Gap)'.\n"
            "- Be concise, practical, professional, and aligned with Indian public administration."
        )

        messages = [{"role": "system", "content": system_prompt or default_system}]

        if conversation_history:
            for item in conversation_history[-6:]:
                role = item.get("sender") or item.get("role")
                content = item.get("text") or item.get("content", "")
                if role in ("ai", "assistant"):
                    messages.append({"role": "assistant", "content": content})
                elif role in ("user", "human"):
                    messages.append({"role": "user", "content": content})

        messages.append({"role": "user", "content": user_message})
        return messages

    def chat(
        self,
        user_message: str,
        conversation_history: Optional[list[dict]] = None,
        system_prompt: Optional[str] = None,
        custom_api_key: Optional[str] = None,
        custom_base_url: Optional[str] = None,
        custom_model: Optional[str] = None,
    ) -> dict:
        """Sends chat messages to OpenAI and returns structured response."""
        client = self.get_client(api_key=custom_api_key, base_url=custom_base_url)
        model = (custom_model or self.model_id or "gpt-4o-mini").strip()
        messages = self._build_messages(user_message, conversation_history, system_prompt)

        if not client:
            return self._fallback_chat(user_message)

        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=1000,
            )
            reply = response.choices[0].message.content or ""
            return {
                "reply": reply.strip(),
                "model": model,
                "provider": "openai",
                "suggestions": self._derive_suggestions(reply, user_message),
            }
        except Exception as e:
            logger.warning(f"OpenAI chat call failed: {e}")
            fallback = self._fallback_chat(user_message)
            fallback["warning"] = f"OpenAI error: {str(e)}"
            return fallback

    def stream_chat(
        self,
        user_message: str,
        conversation_history: Optional[list[dict]] = None,
        system_prompt: Optional[str] = None,
        custom_api_key: Optional[str] = None,
        custom_base_url: Optional[str] = None,
        custom_model: Optional[str] = None,
    ) -> Generator[str, None, None]:
        """Real-time streaming chat generation. Yields string chunks token-by-token."""
        client = self.get_client(api_key=custom_api_key, base_url=custom_base_url)
        model = (custom_model or self.model_id or "gpt-4o-mini").strip()
        messages = self._build_messages(user_message, conversation_history, system_prompt)

        if not client:
            # Fallback simulated streaming
            fallback = self._fallback_chat(user_message)["reply"]
            # Yield in natural words/sentence pieces
            import time
            words = fallback.split(" ")
            for i, word in enumerate(words):
                yield word + (" " if i < len(words) - 1 else "")
                time.sleep(0.015)
            return

        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=1200,
                stream=True,
            )
            for chunk in response:
                if chunk.choices and len(chunk.choices) > 0:
                    delta = chunk.choices[0].delta.content or ""
                    if delta:
                        yield delta
        except Exception as e:
            logger.error(f"OpenAI stream error: {e}")
            yield f"\n\n*(Error connecting to LLM endpoint: {str(e)})*"

    def generate_quiz_questions(
        self,
        text: str = "",
        competency_area: str = "",
        num_questions: int = 5,
        custom_api_key: Optional[str] = None,
        custom_base_url: Optional[str] = None,
        custom_model: Optional[str] = None,
    ) -> Optional[list[dict]]:
        """Uses OpenAI to synthesize multiple-choice quiz questions from text or competency."""
        client = self.get_client(api_key=custom_api_key, base_url=custom_base_url)
        model = (custom_model or self.model_id or "gpt-4o-mini").strip()
        if not client:
            return None

        prompt = (
            f"Generate a professional multiple-choice assessment quiz for Government of India statistical officials.\n"
            f"Competency Domain: {competency_area or 'General Public Administration & Data Governance'}\n"
            f"Number of Questions: {num_questions}\n\n"
        )
        if text:
            prompt += f"Source Material Snippet:\n\"\"\"{text[:3000]}\"\"\"\n\n"

        prompt += (
            "Respond strictly with valid JSON representing an array of objects. Do not include markdown code block backticks.\n"
            "Each object must have:\n"
            "- \"question_text\": string (clear, practical administrative question)\n"
            "- \"option_a\": string\n"
            "- \"option_b\": string\n"
            "- \"option_c\": string\n"
            "- \"option_d\": string\n"
            "- \"correct_option\": \"A\" or \"B\" or \"C\" or \"D\"\n"
            "- \"explanation\": string (why this option is correct based on MoSPI/governance norms)\n"
        )

        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are an expert psychometric test designer for SAMARTHYA public administration. Output strictly raw JSON array."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.5,
                max_tokens=2000,
            )
            raw = response.choices[0].message.content or ""
            raw = raw.strip()
            if raw.startswith("```"):
                lines = raw.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                raw = "\n".join(lines).strip()

            data = json.loads(raw)
            if isinstance(data, list) and len(data) > 0:
                validated = []
                for q in data[:num_questions]:
                    if "question_text" in q and "option_a" in q and "correct_option" in q:
                        validated.append({
                            "question_text": q["question_text"],
                            "option_a": q.get("option_a", ""),
                            "option_b": q.get("option_b", ""),
                            "option_c": q.get("option_c", ""),
                            "option_d": q.get("option_d", ""),
                            "correct_option": q["correct_option"].upper(),
                            "explanation": q.get("explanation", "Standard MoSPI statistical capacity protocol."),
                        })
                if validated:
                    return validated
        except Exception as e:
            logger.warning(f"OpenAI quiz generation failed: {e}")
            return None

        return None

    def _derive_suggestions(self, reply: str, user_message: str) -> list[str]:
        """Derives follow-up quick-action prompts dynamically from user query and response content."""
        import random
        import re

        lower = (reply + " " + user_message).lower()
        suggestions: list[str] = []
        used: set[str] = set()

        def add(s: str):
            clean = s.strip()
            if clean and clean.lower() not in used and len(suggestions) < 3:
                used.add(clean.lower())
                suggestions.append(clean)

        # 1. Extract course titles: e.g. * **Data-Driven Decision Making**
        course_matches = re.findall(r"\*\s+\*\*([A-Z][^*]{5,60})\*\*", reply)
        valid_courses = [
            c for c in course_matches
            if not c.lower().startswith(("competency", "overview", "phase"))
        ]
        if valid_courses:
            selected_course = random.choice(valid_courses)
            add(f"Enroll in \"{selected_course}\"")

        # 2. Extract competencies
        comp_matches = re.findall(r"\*\s+\*\*Competency:\*\*\s+([^\n\r]+)", reply)
        if comp_matches:
            comp = comp_matches[0].split(",")[0].strip()
            if comp:
                add(f"Test competency in {comp}")

        # 3. Topic-specific pools
        if any(w in lower for w in ["gdp", "gva", "national accounts", "basic prices", "factor cost"]):
            gdp_pool = [
                "Explain difference between Basic Prices & Factor Cost",
                "Take 5-question National Accounts & GDP quiz",
                "How does MoSPI calculate Consumption of Fixed Capital (CFC)?",
                "Recommend Macroeconomic Statistics courses on iGOT",
            ]
            random.shuffle(gdp_pool)
            for item in gdp_pool:
                add(item)

        elif any(w in lower for w in ["sample", "sampling", "survey", "nsso", "plfs"]):
            survey_pool = [
                "Explain Multi-stage Stratified Sampling in NSSO",
                "How MoSPI conducts Periodic Labour Force Survey (PLFS)",
                "Take Survey Sampling & Error Minimization quiz",
                "Recommend Survey Administration courses on iGOT",
            ]
            random.shuffle(survey_pool)
            for item in survey_pool:
                add(item)

        elif any(w in lower for w in ["ai", "machine learning", "ml", "algorithm", "predictive"]):
            ai_pool = [
                "Explore Phase 1: Responsible AI for Administrators",
                "Take 5-min AI & Algorithmic Governance quiz",
                "How can MoSPI leverage predictive AI in survey registries?",
                "Recommend Foundational AI courses on SAMARTHYA",
            ]
            random.shuffle(ai_pool)
            for item in ai_pool:
                add(item)

        elif any(w in lower for w in ["sdg", "nif", "indicator", "sustainable development"]):
            sdg_pool = [
                "How MoSPI monitors 300+ SDG indicators through NIF",
                "District-level SDG data collection workflows",
                "Take SDG National Indicator Framework assessment",
            ]
            random.shuffle(sdg_pool)
            for item in sdg_pool:
                add(item)

        elif any(w in lower for w in ["gap", "competency", "score", "literacy", "quant", "data"]):
            data_pool = [
                "Deep dive into statistical averages and distributions",
                "Take Quantitative Literacy & Data Analysis quiz",
                "Recommend Data-Driven Decision Making on iGOT",
                "Generate a 30-day quantitative study roadmap",
            ]
            random.shuffle(data_pool)
            for item in data_pool:
                add(item)

        # 4. Fallback pool
        fallback_pool = [
            "Recommend iGOT courses for this topic",
            "Generate a 5-question assessment quiz",
            "How does this apply to MoSPI district operations?",
            "Summarize this into a 3-step action plan",
            "What competencies are required for this?",
        ]
        random.shuffle(fallback_pool)
        for fb in fallback_pool:
            add(fb)

        return suggestions[:3]

    def _fallback_chat(self, user_message: str) -> dict:
        """Contextual fallback formatted strictly with the structured SAMARTHYA course layout."""
        lower = user_message.lower()

        if any(w in lower for w in ["numera", "quant", "data", "stat", "literacy", "math"]):
            reply = (
                "Assuming you are looking to build competencies around **foundational numeracy, quantitative analysis, and data literacy for public administration**, here are recommended courses available on the **SAMARTHYA** portal:\n\n"
                "---\n\n"
                "### 1. Foundational Data & Quantitative Literacy\n"
                "* **Data-Driven Decision Making for Public Policy**\n"
                "* **Competency:** Evidence-based Governance, Analytical Thinking\n"
                "* **Overview:** Covers how basic numerical data, trends, and administrative statistics can be collected, analyzed, and leveraged for sound policy decisions.\n"
                "* **Basic Statistics and Data Analysis for Public Servants**\n"
                "* **Competency:** Quantitative Aptitude, Statistical Acumen\n"
                "* **Overview:** Refreshes foundational mathematical and statistical concepts (averages, distributions, sampling basics, and percentage changes) used daily in administrative reporting.\n\n"
                "---\n\n"
                "### 2. Statistical Governance & Official Indicator Systems\n"
                "* **MoSPI National Indicator Framework & SDG Monitoring**\n"
                "* **Competency:** National Statistical System, Data Validation\n"
                "* **Overview:** Comprehensive walkthrough of India's National Indicator Framework, tracking 300+ SDG indicators through administrative registries and NSSO surveys.\n"
                "* **Data Visualization and Executive Dashboarding for Governance**\n"
                "* **Competency:** Data Communication, Public Reporting\n"
                "* **Overview:** Equips officials with modern visualization practices to present quantitative metrics cleanly to stakeholders."
            )
            suggestions = [
                "Enroll in Data-Driven Decision Making",
                "Take Quantitative Literacy Quiz",
                "Explore National Indicator Framework",
            ]
        elif "ai" in lower or "ml" in lower or "machine learning" in lower:
            reply = (
                "Assuming you are looking to build competencies around **Artificial Intelligence & Machine Learning in Governance**, here are recommended courses available on the **SAMARTHYA** portal:\n\n"
                "---\n\n"
                "#### Phase 1: Foundational & Responsible AI (Closes ~10% Gap)\n"
                "* **Foundations of AI for Public Administrators**\n"
                "* **Competency:** Algorithmic Governance, AI Ethics\n"
                "* **Overview:** Orientation on deploying ethical AI frameworks, predictive automation, and citizen services at the district and state levels.\n\n"
                "#### Phase 2: Applied Machine Learning & Predictive Governance (Closes ~25% Gap)\n"
                "* **Machine Learning & Predictive Modeling with Public Data**\n"
                "* **Competency:** Predictive Analytics, Computational Acumen\n"
                "* **Overview:** Practical exercises utilizing Python to detect trends, anomalies, and resource allocation bottlenecks in governance datasets."
            )
            suggestions = ["Enroll in Phase 1 Courses", "Take 5-min AI Quiz", "View AI Competency Gap"]
        elif "course" in lower or "recommend" in lower or "igot" in lower:
            reply = (
                "Assuming you are looking to build competencies around **priority administrative gaps and statistical governance**, here are recommended courses available on the **SAMARTHYA** portal:\n\n"
                "---\n\n"
                "### 1. Priority SAMARTHYA Catalog\n"
                "* **Foundational Data-Driven Decision Making**\n"
                "* **Competency:** Evidence-based Governance, Analytical Thinking\n"
                "* **Overview:** Practical orientation on interpreting statistical indicators, baseline trends, and program metrics for district planning.\n"
                "* **Statistical Sampling & Survey Methodologies (MoSPI)**\n"
                "* **Competency:** Sampling Design, Survey Administration\n"
                "* **Overview:** In-depth study of NSSO survey design, multistage stratified sampling, and error minimization protocols.\n\n"
                "---\n\n"
                "### 2. Digital Governance & Information Security\n"
                "* **Cybersecurity & Data Privacy in Government Portals**\n"
                "* **Competency:** Information Security, Data Protection\n"
                "* **Overview:** Standards for securing administrative data repositories, adhering to DPDP guidelines, and safeguarding citizen records."
            )
            suggestions = ["View Full Catalog", "Start Course Enrollment", "Take Diagnostic Quiz"]
        else:
            reply = (
                f"Assuming you are looking to build competencies around **{user_message.strip()[:60]}**, here are recommended courses available on the **SAMARTHYA** portal:\n\n"
                "---\n\n"
                "### 1. Core Competency Development\n"
                "* **Data-Driven Decision Making for Public Policy**\n"
                "* **Competency:** Evidence-based Governance, Analytical Thinking\n"
                "* **Overview:** Practical guide on leveraging official data registers, time-series metrics, and administrative statistics for governance.\n"
                "* **Ethical Leadership & Digital Governance Standards**\n"
                "* **Competency:** Administrative Ethics, Citizen Centricity\n"
                "* **Overview:** Frameworks for maintaining accountability, fairness, and transparency in public service delivery."
            )
            suggestions = ["Explore iGOT Courses", "Take Competency Assessment", "Generate 30-Day Plan"]

        return {
            "reply": reply,
            "model": "samarthya-ai-local",
            "provider": "local-fallback",
            "suggestions": suggestions,
        }

    def get_status(
        self,
        custom_api_key: Optional[str] = None,
        custom_base_url: Optional[str] = None,
        custom_model: Optional[str] = None,
    ) -> dict:
        """Returns masked status of OpenAI configuration."""
        key = (custom_api_key or self.api_key).strip()
        base = (custom_base_url or self.base_url).strip()
        model = (custom_model or self.model_id).strip()

        masked = ""
        if key:
            if len(key) > 8:
                masked = f"{key[:4]}...{key[-4:]}"
            else:
                masked = "********"

        return {
            "configured": self.is_key_valid(key),
            "base_url": base,
            "model_id": model,
            "masked_api_key": masked,
        }


# Singleton instance
openai_service = OpenAIService()
