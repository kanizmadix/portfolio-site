"use client";

import { useEffect, useState } from "react";
import portfolio from "@/data/portfolio";

function groupSkills() {
  const order: string[] = [];
  const grouped = new Map<string, string[]>();

  for (const skill of portfolio.skills) {
    if (!grouped.has(skill.category)) {
      grouped.set(skill.category, []);
      order.push(skill.category);
    }
    grouped.get(skill.category)!.push(skill.name);
  }

  return order.map((category) => ({ category, skills: grouped.get(category)! }));
}

export default function PaperMode() {
  const [fadeStyle, setFadeStyle] = useState<{ opacity: number; transition: string }>({
    opacity: 1,
    transition: "none",
  });

  // Mode-switch entrance: a subtle fade, skipped entirely under
  // prefers-reduced-motion. This lives outside the normal AnimatedSection
  // tree, so it checks the media query directly.
  useEffect(() => {
    let reduced = false;
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      reduced = false;
    }
    if (reduced) {
      // Triggers a CSS-transition-driven fade-in on mount; matchMedia is
      // client-only so this can't run during the lazy useState initializer.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFadeStyle({ opacity: 1, transition: "none" });
      return;
    }
    setFadeStyle({ opacity: 0, transition: "none" });
    const raf = requestAnimationFrame(() => {
      setFadeStyle({ opacity: 1, transition: "opacity 0.4s ease" });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const skillGroups = groupSkills();
  const currentRole = portfolio.experience[0];
  const affiliationLine = currentRole
    ? `${currentRole.title}, ${currentRole.company} — ${portfolio.location}`
    : portfolio.location;
  const footnoteLinks = [portfolio.email, portfolio.github, portfolio.linkedin, portfolio.medium].filter(
    (v): v is string => !!v
  );

  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto"
      style={{ ...fadeStyle, background: "#fdfdfb", color: "#161412" }}
    >
      <article className="mx-auto max-w-[680px] px-5 py-14 font-serif sm:px-10 sm:py-20">
        <header className="mb-10 border-b border-black/10 pb-8 text-center">
          <h1 className="text-[1.9rem] font-semibold tracking-tight sm:text-4xl">{portfolio.name}</h1>
          <p className="mt-2 text-base italic opacity-75 sm:text-lg">{portfolio.role}</p>
          <p className="mt-4 text-sm opacity-65">{affiliationLine}</p>
          {footnoteLinks.length > 0 && (
            <p className="mt-2 break-words text-xs opacity-55">{footnoteLinks.join(" · ")}</p>
          )}
        </header>

        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase opacity-80">Abstract</h2>
          <p className="text-[15px] leading-relaxed">{portfolio.bio}</p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase opacity-80">1. Skills</h2>
          {skillGroups.map(({ category, skills }, i) => (
            <div key={category} className="mb-3">
              <h3 className="text-[15px] font-semibold">
                1.{i + 1} {category}
              </h3>
              <p className="text-[15px] leading-relaxed">{skills.join(", ")}</p>
            </div>
          ))}
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-xs font-semibold tracking-[0.2em] uppercase opacity-80">2. Experience</h2>
          {portfolio.experience.map((exp, i) => (
            <div key={`${exp.company}-${exp.period}`} className="mb-6">
              <h3 className="text-[15px] font-semibold">
                2.{i + 1} {exp.title}, {exp.company}
              </h3>
              <p className="mb-2 text-xs italic opacity-60">
                {exp.period} · {exp.location} · {exp.type}
              </p>
              <ul className="list-disc space-y-1 pl-5 text-[15px] leading-relaxed">
                {exp.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase opacity-80">References</h2>
          <ol className="space-y-2 text-[15px] leading-relaxed">
            {portfolio.publications.map((pub, i) => (
              <li key={pub.title} className="flex gap-2">
                <span className="shrink-0 opacity-50">[{i + 1}]</span>
                <span>
                  {pub.title}
                  {pub.relatedProject ? ` — related work: ${pub.relatedProject}` : ""}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase opacity-80">Appendix</h2>

          <h3 className="mb-2 text-[15px] font-semibold">A. Education</h3>
          <ul className="mb-6 space-y-2 text-[15px] leading-relaxed">
            {portfolio.education.map((ed) => (
              <li key={`${ed.degree}-${ed.institution}`}>
                <span className="font-medium">{ed.degree}</span>, {ed.institution} ({ed.period}
                {ed.inProgress ? ", in progress" : ""}
                {ed.cgpa ? `, CGPA ${ed.cgpa}` : ""}) — {ed.location}
              </li>
            ))}
          </ul>

          <h3 className="mb-2 text-[15px] font-semibold">B. Certifications</h3>
          <ul className="list-disc space-y-1 pl-5 text-[15px] leading-relaxed">
            {portfolio.certifications.map((cert) => (
              <li key={cert}>{cert}</li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  );
}
