"use client";
import { JSX } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeading from "@/components/ui/SectionHeading";
import portfolio from "@/data/portfolio";

interface Link {
  label: string;
  value: string;
  href: string;
  external: boolean;
  icon: JSX.Element;
}

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// Turns "https://www.linkedin.com/in/handle/" into "linkedin.com/in/handle"
// so the visible label always matches the href in data/portfolio.ts.
const displayUrl = (url: string) =>
  url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");

export default function Contact() {
  const links: Link[] = [
    {
      label: "Email",
      value: portfolio.email,
      href: `mailto:${portfolio.email}`,
      external: false,
      icon: <EmailIcon />,
    },
    {
      label: "GitHub",
      value: displayUrl(portfolio.github),
      href: portfolio.github,
      external: true,
      icon: <GitHubIcon />,
    },
    {
      label: "LinkedIn",
      value: displayUrl(portfolio.linkedin),
      href: portfolio.linkedin,
      external: true,
      icon: <LinkedInIcon />,
    },
    // Drop any card whose URL hasn't been filled in rather than rendering a dead link.
  ].filter((link) => link.href);

  return (
    <section id="contact" className="px-6 md:px-16 lg:px-24 py-28 md:py-36">
      <div className="max-w-3xl mx-auto text-center">
        <SectionHeading eyebrow="Contact" heading="Let's work together" headingClass="mb-4" />
        <AnimatedSection delay={0.1}>
          <p className="text-white/50 text-base md:text-lg mb-14">
            Open to GenAI roles, freelance projects, and research collaborations.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="flex items-center gap-3 px-6 py-4 bg-white/[0.025] border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 rounded-2xl text-white/65 hover:text-white transition-all duration-200 group text-left"
              >
                <span className="text-indigo-400 group-hover:text-indigo-300 transition-colors duration-200 shrink-0">
                  {link.icon}
                </span>
                <div>
                  <p className="text-[10px] text-white/35 uppercase tracking-wider">{link.label}</p>
                  <p className="text-sm font-medium leading-snug">{link.value}</p>
                </div>
              </a>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <p className="mt-24 text-white/18 text-xs tracking-wide">
            Built with Next.js · Tailwind CSS · Framer Motion
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
