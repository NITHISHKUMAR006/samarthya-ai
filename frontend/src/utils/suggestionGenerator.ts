/**
 * Dynamic Contextual Suggestion Generator for Samarthya AI
 * Generates tailored, non-repetitive follow-up action prompts
 * based on user queries, extracted courses, competencies, and statistical topics.
 */

interface TopicRule {
  keywords: string[];
  pool: string[];
}

const TOPIC_RULES: TopicRule[] = [
  {
    keywords: ['gdp', 'gva', 'national accounts', 'factor cost', 'basic prices', 'macroeconomic', 'cfc', 'taxes', 'subsidies'],
    pool: [
      'Explain difference between Basic Prices and Factor Cost in GDP',
      'Take 5-question National Accounts & GDP assessment',
      'How does MoSPI calculate Consumption of Fixed Capital (CFC)?',
      'Recommend Macroeconomic Statistics courses on iGOT',
      'How does Net Indirect Taxes impact GVA to GDP conversion?',
    ],
  },
  {
    keywords: ['cpi', 'wpi', 'inflation', 'price index', 'iip', 'index of industrial production'],
    pool: [
      'Compare CPI vs WPI calculation methodologies in India',
      'How does MoSPI compile monthly retail inflation?',
      'Take Price Statistics & Index Numbers quiz',
      'Base year revisions in CPI and IIP tracking',
      'Recommend Economic Indicators courses on iGOT',
    ],
  },
  {
    keywords: ['sample', 'sampling', 'survey', 'nsso', 'stratified', 'plfs', 'multistage', 'variance'],
    pool: [
      'Explain Multi-stage Stratified Sampling used in NSSO',
      'How MoSPI conducts Periodic Labour Force Survey (PLFS)',
      'Take Survey Sampling & Error Minimization quiz',
      'Determine optimal sample sizes for district surveys',
      'Recommend Survey Administration courses on iGOT',
    ],
  },
  {
    keywords: ['ai', 'machine learning', 'ml', 'algorithm', 'artificial intelligence', 'predictive', 'llm', 'deep learning'],
    pool: [
      'Explore Phase 1: Responsible & Ethical AI for Administrators',
      'Take 5-min AI & Algorithmic Governance diagnostic quiz',
      'How can MoSPI leverage predictive AI in survey registries?',
      'Python libraries for official administrative analytics',
      'Recommend Foundational AI courses on SAMARTHYA',
    ],
  },
  {
    keywords: ['sdg', 'nif', 'sustainable development', 'indicator', 'goals', 'target'],
    pool: [
      'How MoSPI monitors 300+ SDG indicators through NIF',
      'District-level SDG data collection protocols',
      'Take SDG National Indicator Framework assessment',
      'Recommend Monitoring & Evaluation courses on iGOT',
      'Data harmonization across State Indicator Frameworks (SIF)',
    ],
  },
  {
    keywords: ['data', 'quant', 'numeracy', 'stat', 'analysis', 'distribution', 'probability', 'average'],
    pool: [
      'Deep dive into dispersion and standard deviation for reports',
      'Take Quantitative Literacy & Data Analysis quiz',
      'How to detect outliers and anomalies in field data',
      'Recommend Data-Driven Decision Making on iGOT',
      'Generate a 30-day quantitative study roadmap',
    ],
  },
  {
    keywords: ['ethic', 'conduct', 'governance', 'dpdp', 'privacy', 'transparency', 'rti'],
    pool: [
      'Digital Personal Data Protection (DPDP) Act in official registries',
      'Administrative ethics and accountability in citizen delivery',
      'Take Public Administration Ethics quiz',
      'Recommend Ethical Leadership courses on iGOT',
    ],
  },
  {
    keywords: ['quiz', 'test', 'assessment', 'question', 'exam', 'score'],
    pool: [
      'Generate a 5-question multi-choice quiz on this topic',
      'Review my past competency assessment scores',
      'Which iGOT courses close my lowest scored gaps?',
      'Take advanced diagnostic test',
    ],
  },
];

/**
 * Extracts course names in quotes or asterisks:
 * e.g. * **Data-Driven Decision Making for Public Policy**
 */
const extractCourses = (text: string): string[] => {
  const courses: string[] = [];
  const regex = /\*\s+\*\*([A-Z][^*]{5,65})\*\*/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const title = match[1].trim();
    if (
      !title.toLowerCase().startsWith('competency') &&
      !title.toLowerCase().startsWith('overview') &&
      !title.toLowerCase().startsWith('phase')
    ) {
      courses.push(title);
    }
  }
  return courses;
};

/**
 * Extracts competencies mentioned:
 * e.g. * **Competency:** Evidence-based Governance, Analytical Thinking
 */
const extractCompetencies = (text: string): string[] => {
  const competencies: string[] = [];
  const regex = /\*\s+\*\*Competency:\*\*\s+([^\n\r]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const raw = match[1].split(',')[0].trim();
    if (raw && raw.length > 3 && raw.length < 40) {
      competencies.push(raw);
    }
  }
  return competencies;
};

/**
 * Extracts phase headings:
 * e.g. #### Phase 1: Foundational & Responsible AI (Closes ~10% Gap)
 */
const extractPhases = (text: string): string[] => {
  const phases: string[] = [];
  const regex = /####\s+Phase\s+\d+:\s+([^(]+)/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const phase = match[1].trim();
    if (phase) phases.push(phase);
  }
  return phases;
};

/**
 * Shuffle array using Fisher-Yates with random offset to ensure variety
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates 3-4 context-aware, non-repetitive suggestions
 */
export const generateDynamicSuggestions = (
  userText: string,
  aiResponse: string
): string[] => {
  const combined = `${userText} ${aiResponse}`.toLowerCase();
  const suggestions: string[] = [];
  const used = new Set<string>();

  const addSuggestion = (s: string) => {
    const clean = s.trim();
    if (clean && !used.has(clean.toLowerCase()) && suggestions.length < 4) {
      used.add(clean.toLowerCase());
      suggestions.push(clean);
    }
  };

  // 1. Dynamic suggestions from Extracted Courses
  const courses = extractCourses(aiResponse);
  if (courses.length > 0) {
    const shuffledCourses = shuffle(courses);
    addSuggestion(`Enroll in "${shuffledCourses[0]}"`);
  }

  // 2. Dynamic suggestions from Extracted Competencies
  const competencies = extractCompetencies(aiResponse);
  if (competencies.length > 0) {
    const shuffledComp = shuffle(competencies);
    addSuggestion(`Test competency in ${shuffledComp[0]}`);
  }

  // 3. Dynamic suggestions from Extracted Phases
  const phases = extractPhases(aiResponse);
  if (phases.length > 0) {
    addSuggestion(`Start learning ${phases[0]}`);
  }

  // 4. Topic-rule matching based on keywords in query + response
  for (const rule of TOPIC_RULES) {
    if (rule.keywords.some((kw) => combined.includes(kw))) {
      const candidates = shuffle(rule.pool);
      for (const cand of candidates) {
        addSuggestion(cand);
        if (suggestions.length >= 3) break;
      }
    }
    if (suggestions.length >= 3) break;
  }

  // 5. Fallback diverse prompts if still under 3
  const generalPool = [
    'Recommend iGOT courses for this topic',
    'Generate a 5-question assessment quiz',
    'How does this apply to MoSPI district operations?',
    'Summarize this in a 3-step action plan',
    'What competencies are required for this?',
    'Explain the official government guidelines for this',
  ];

  for (const fallback of shuffle(generalPool)) {
    addSuggestion(fallback);
    if (suggestions.length >= 3) break;
  }

  return suggestions.slice(0, 3);
};
