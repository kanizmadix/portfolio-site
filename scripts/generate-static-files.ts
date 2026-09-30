// Generates public/resume.json, public/llms.txt, public/sitemap.xml and
// public/robots.txt from data/portfolio.ts at build time (wired as "prebuild"
// in package.json). Never invents facts — anything not cleanly derivable
// from the existing data is left out rather than guessed.
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import portfolio from "../data/portfolio";

const SITE_URL = "https://kanizmadix.github.io/portfolio-site/";
const PUBLIC_DIR = resolve(__dirname, "../public");

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function parseMonthYear(token: string): string | undefined {
  const m = token.trim().match(/^([A-Za-z]{3,})\s+(\d{4})$/);
  if (!m) return undefined;
  const month = MONTHS[m[1].slice(0, 3).toLowerCase()];
  return month ? `${m[2]}-${month}` : undefined;
}

function parsePeriod(period: string): { startDate?: string; endDate?: string } {
  const parts = period.split(/[–-]/).map((p) => p.trim());
  const startDate = parts[0] ? parseMonthYear(parts[0]) : undefined;
  if (parts.length === 1) return { startDate, endDate: startDate };
  if (/present/i.test(parts[1])) return { startDate };
  const endDate = parts[1] ? parseMonthYear(parts[1]) : undefined;
  return { startDate, endDate };
}

function parseYearRange(period: string): { startDate?: string; endDate?: string } {
  const years = period.match(/\d{4}/g) ?? [];
  return { startDate: years[0], endDate: years[1] };
}

function guessIssuer(cert: string): string | undefined {
  if (/aws/i.test(cert)) return "Amazon Web Services";
  if (/claude|anthropic/i.test(cert)) return "Anthropic";
  if (/nus/i.test(cert)) return "National University of Singapore";
  if (/ibm/i.test(cert)) return "IBM";
  return undefined;
}

function buildResumeJson() {
  const [city, region] = portfolio.location.split(",").map((s) => s.trim());

  const resume = {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/master/schema.json",
    basics: {
      name: portfolio.name,
      label: portfolio.role,
      email: portfolio.email,
      url: SITE_URL,
      summary: portfolio.bio,
      location: { city, region },
      profiles: [
        { network: "GitHub", url: portfolio.github, username: portfolio.github.split("/").pop() },
        {
          network: "LinkedIn",
          url: portfolio.linkedin,
          username: portfolio.linkedin.split("/in/").pop()?.replace(/\/$/, ""),
        },
        { network: "Medium", url: portfolio.medium, username: portfolio.medium.split("/@").pop() },
      ],
    },
    work: portfolio.experience.map((e) => ({
      name: e.company,
      position: e.title,
      location: e.location,
      ...parsePeriod(e.period),
      summary: e.type,
      highlights: e.bullets,
    })),
    education: portfolio.education.map((e) => ({
      institution: e.institution,
      studyType: e.degree,
      area: "Data Science",
      ...parseYearRange(e.period),
      gpa: e.cgpa,
    })),
    skills: Array.from(new Set(portfolio.skills.map((s) => s.category))).map((category) => ({
      name: category,
      keywords: portfolio.skills.filter((s) => s.category === category).map((s) => s.name),
    })),
    certificates: portfolio.certifications.map((name) => ({ name, issuer: guessIssuer(name) })),
    publications: portfolio.publications.map((p) => ({ name: p.title })),
    projects: portfolio.projects.map((p) => ({
      name: p.name,
      description: p.description,
      keywords: p.tech,
      url: p.link,
    })),
  };

  writeFileSync(resolve(PUBLIC_DIR, "resume.json"), JSON.stringify(resume, null, 2) + "\n");
}

function buildLlmsTxt() {
  const lines = [
    `# ${portfolio.name}`,
    "",
    `> ${portfolio.tagline}`,
    "",
    portfolio.bio,
    "",
    "## Sections",
    "",
    `- [About](${SITE_URL}#about) — background, certifications, education`,
    `- [Skills](${SITE_URL}#skills) — core stack (cloud, data, GenAI & agent engineering) plus frontend/other tooling`,
    `- [Projects](${SITE_URL}#projects) — ${portfolio.projects.length} shipped AI/data projects`,
    `- [Publications](${SITE_URL}#publications) — written work`,
    `- [Experience](${SITE_URL}#experience) — work history`,
    `- [Contact](${SITE_URL}#contact) — ${portfolio.email}`,
    "",
    `Machine-readable resume: ${SITE_URL}resume.json`,
    "",
  ];
  writeFileSync(resolve(PUBLIC_DIR, "llms.txt"), lines.join("\n"));
}

function buildSitemap() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
  writeFileSync(resolve(PUBLIC_DIR, "sitemap.xml"), xml);
}

function buildRobotsTxt() {
  const txt = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`;
  writeFileSync(resolve(PUBLIC_DIR, "robots.txt"), txt);
}

buildResumeJson();
buildLlmsTxt();
buildSitemap();
buildRobotsTxt();

console.log("Generated public/resume.json, llms.txt, sitemap.xml, robots.txt");
