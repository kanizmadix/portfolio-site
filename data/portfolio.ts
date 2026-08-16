export interface Project {
  name: string;
  description: string;
  tech: string[];
  link: string;
}

export interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  location: string;
  type: string;
  bullets: string[];
  skills: string[];
}

export interface SkillItem {
  name: string;
  category: "Programming" | "Cloud" | "AI/ML" | "Frameworks" | "Data";
}

const portfolio = {
  name: "Kanishk S",
  role: "Generative AI Engineer",
  tagline:
    "Building LLM-powered systems that transform unstructured data into structured intelligence.",
  bio: "I'm a Generative AI Engineer with hands-on experience designing and deploying LLM-powered systems. I specialise in prompt engineering, LLM pipeline architecture, RAG-based chatbots, and Intelligent Document Processing — delivering production-ready GenAI workflows on AWS. AWS Certified Solutions Architect – Associate.",
  location: "Coimbatore, Tamil Nadu",
  email: "kanishk0070@gmail.com",
  phone: "+91 8870658170",
  github: "https://github.com/kanizmadix",
  // Set to your full LinkedIn profile URL. Left empty, the Contact card is
  // omitted rather than rendering a broken link.
  linkedin: "https://www.linkedin.com/in/kanishk-s-25b1b225b/",

  skills: [
    { name: "Python", category: "Programming" },
    { name: "JavaScript / MERN", category: "Programming" },
    { name: "R", category: "Programming" },
    { name: "SQL", category: "Data" },
    { name: "Power BI", category: "Data" },
    { name: "AWS Bedrock", category: "Cloud" },
    { name: "AWS Lambda", category: "Cloud" },
    { name: "AWS Step Functions", category: "Cloud" },
    { name: "DynamoDB", category: "Cloud" },
    { name: "AWS S3", category: "Cloud" },
    { name: "Generative AI", category: "AI/ML" },
    { name: "Prompt Engineering", category: "AI/ML" },
    { name: "RAG", category: "AI/ML" },
    { name: "LLM Pipelines", category: "AI/ML" },
    { name: "Intelligent Document Processing", category: "AI/ML" },
    { name: "Vector Databases", category: "AI/ML" },
    { name: "AI Agents", category: "AI/ML" },
    { name: "TensorFlow", category: "Frameworks" },
    { name: "PyTorch", category: "Frameworks" },
    { name: "Scikit-Learn", category: "Frameworks" },
    { name: "FastAPI", category: "Frameworks" },
    { name: "Pandas / NumPy", category: "Frameworks" },
  ] as SkillItem[],

  projects: [
    {
      name: "Multi-Agent AI Planner",
      description:
        "3-agent orchestration (Planner → Executor → Validator) with live SSE streaming. Agents communicate via structured JSON; the frontend shows real-time progress.",
      tech: ["Python", "FastAPI", "Anthropic Claude", "SSE", "Pydantic"],
      link: "https://kanizmadix.github.io/ai-multi-agent-planner/",
    },
    {
      name: "RAG Document Q&A",
      description:
        "Enterprise-grade RAG pipeline — PDF extraction, FAISS vector indexing with sentence-transformers, and Claude-powered Q&A with inline source citations.",
      tech: ["Python", "FAISS", "sentence-transformers", "Anthropic Claude", "FastAPI"],
      link: "https://kanizmadix.github.io/ai-document-qa/",
    },
    {
      name: "AI Résumé Generator",
      description:
        "Generates ATS-optimised résumés and cover letters with skill matching, ATS scoring, interview prep, and PDF export. Prompt caching cuts cost by ~90%.",
      tech: ["Python", "FastAPI", "Anthropic Claude", "ReportLab", "SQLite"],
      link: "https://kanizmadix.github.io/ai-resume-generator/",
    },
    {
      name: "Natural Language → SQL",
      description:
        "Schema-aware NL-to-SQL engine with query explanation, optimisation hints, Mermaid ERD visualisation, and Excel/CSV export.",
      tech: ["Python", "FastAPI", "SQLite", "Anthropic Claude", "OpenPyXL"],
      link: "https://kanizmadix.github.io/ai-sql-assistant/",
    },
    {
      name: "Movie Recommendation System",
      description:
        "Hybrid content-based and collaborative filtering engine using IMDbPy. ML algorithms analyse user preferences to deliver personalised movie suggestions.",
      tech: ["Python", "IMDbPy", "Scikit-Learn", "Pandas", "Collaborative Filtering"],
      link: "https://github.com/kanizmadix/Movie-Recommender-System-master",
    },
    {
      name: "Formula One: Speed Meets Data",
      description:
        "F1 pitstop and lap-time analysis with 2025 standings prediction via linear regression. Includes Tableau dashboards and a Streamlit sponsor platform.",
      tech: ["Python", "Tableau", "Streamlit", "Linear Regression", "Pandas"],
      link: "https://github.com/kanizmadix/Formula1",
    },
    {
      name: "OpenTrails",
      description:
        "Open-data travel platform aggregating OpenStreetMap, Open-Meteo, Wikivoyage and Amadeus, with Claude generating day-by-day itineraries, packing lists and destination intel.",
      tech: ["Python", "FastAPI", "Anthropic Claude", "httpx", "Leaflet", "SQLite"],
      link: "https://kanizmadix.github.io/opentrails/",
    },
    {
      name: "Nova — Multilingual Voice Assistant",
      description:
        "Offline wake-word assistant covering English plus 22 Indian languages, using AI4Bharat IndicTrans2, IndicConformer and Parler-TTS with faster-whisper for speech-to-text.",
      tech: ["Python", "faster-whisper", "AI4Bharat", "PyTorch", "FastAPI", "WebSockets"],
      link: "https://kanizmadix.github.io/super-nova/",
    },
    {
      name: "Nova — Desktop Voice Control",
      description:
        "Wake-word CLI that transcribes speech locally with Whisper and drives real OS actions: launching apps, screenshots, clipboard, typing and system control across macOS, Linux and Windows.",
      tech: ["Python", "faster-whisper", "sounddevice", "pyautogui", "pyttsx3"],
      link: "https://kanizmadix.github.io/voice-nova/",
    },
  ] as Project[],

  experience: [
    {
      title: "GEN AI Engineer",
      company: "AIVAR Innovations",
      period: "Sep 2025 – Present",
      location: "Coimbatore",
      type: "Full-time · AI and ML – AWS",
      bullets: [
        "Engineered a retrieval-augmented (RAG) chatbot architecture delivering grounded, high-accuracy responses with minimised hallucinations.",
        "Built scalable LLM-driven IDP pipelines for structured data extraction from complex financial and logistics documents.",
        "Designed Generative Engine Optimisation (GEO) workflows transforming raw LLM outputs into actionable intelligence for product and business strategy.",
      ],
      skills: [
        "AWS Bedrock",
        "S3",
        "Lambda",
        "DynamoDB",
        "Step Functions",
        "RAG",
        "IDP",
        "Prompt Engineering",
        "NLP",
      ],
    },
    {
      title: "Associate Data Engineer Intern",
      company: "AIVAR Innovations",
      period: "Mar 2025 – Aug 2025",
      location: "Coimbatore",
      type: "Internship · AI and ML – AWS",
      bullets: [
        "Prototyped GenAI Chatbot (RAG) architecture on internal knowledge bases, significantly reducing hallucination rate.",
        "Contributed to IDP pipelines for extracting structured data from financial and logistics PDFs.",
        "Explored vector embeddings, FAISS-based similarity search, and context injection for production AI systems.",
      ],
      skills: ["AWS S3", "Lambda", "DynamoDB", "Bedrock", "RAG", "Vector Embeddings", "IDP"],
    },
    {
      title: "Industry 4.0 Transformation Intern",
      company: "Egger Pumps",
      period: "Jun 2024 – Jul 2024",
      location: "Coimbatore",
      type: "Internship · Data Analyst – AI and ML",
      bullets: [
        "Implemented IoT-based Smart Pump Monitoring for real-time analytics.",
        "Applied AI & ML models for predictive maintenance and data-driven operational insights.",
        "Explored blockchain integration for supply chain transparency.",
      ],
      skills: ["Python", "IoT Sensors", "TensorFlow", "PyTorch", "Blockchain", "Power BI"],
    },
    {
      title: "Technical & Cybersecurity Intern",
      company: "Tamil Nadu Police",
      period: "Jun 2023",
      location: "Tamil Nadu",
      type: "Internship · Data Analyst",
      bullets: [
        "Conducted vulnerability assessments and penetration testing on IT infrastructure.",
        "Assisted with incident response and digital forensics investigation workflows.",
        "Contributed to network security hardening and system resilience measures.",
      ],
      skills: ["Penetration Testing", "Firewalls", "Encryption Tools", "SSL/TLS", "Digital Forensics"],
    },
  ] as ExperienceItem[],

  certifications: [
    "AWS Solutions Architect Associate (2025–2028)",
    "AI Powered Business Analytics — NUS Singapore",
    "IBM Certified Python Data Science Professional",
  ],

  education: {
    degree: "B.Sc. Data Science",
    institution: "Kumaraguru College of Liberal Arts and Science",
    period: "2022 – 2025",
    cgpa: "8.9 / 10",
    location: "Coimbatore, Tamil Nadu",
  },
};

export type PortfolioData = typeof portfolio;
export default portfolio;
