"use client";

import { useContext } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { IconBriefcase, IconBuildingSkyscraper, IconCalendar, IconCode, IconFolderOpen } from "@tabler/icons-react";
import { MyResumeContext } from "@/components/context/MyResumeContext";
import SectionHeader from "@/components/common/SectionHeader";
import { getRangeSummary, parseMonthYear, revealItem, shortCompany, splitList } from "@/components/common/careerUtils";

const ExperienceScene3D = dynamic(() => import("./ExperienceScene3D"), {
  ssr: false,
  loading: () => <div className="about-scene-loading" />,
});

// local logo files in /public/images/companies, matched by company short name
const COMPANY_LOGOS = {
  impacteers: "/images/companies/impacteers.jpg",
  leadtech: "/images/companies/leadtech.jpg",
};
const logoFor = (name = "") => {
  const key = shortCompany(name).toLowerCase();
  const hit = Object.keys(COMPANY_LOGOS).find((k) => key.includes(k));
  return hit ? COMPANY_LOGOS[hit] : null;
};

function CompanyLogo({ name, large }) {
  const src = logoFor(name);
  return (
    <span className={`xp-logo ${large ? "xp-logo--lg" : ""} ${src ? "has-img" : ""}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt="" /> : initials(name)}
    </span>
  );
}

const initials = (name) => {
  const words = shortCompany(name).split(/\s+/).filter(Boolean);
  const raw = words.length > 1 ? words.map((w) => w[0]).join("") : words[0] || "";
  return raw.slice(0, 2).toUpperCase();
};

const totalExperience = (items) => {
  const starts = items.map((e) => parseMonthYear(e.start)).filter(Boolean);
  if (!starts.length) return "";
  const first = starts.reduce((a, b) => (a.year * 12 + a.month <= b.year * 12 + b.month ? a : b));
  const now = new Date();
  const months = (now.getFullYear() - first.year) * 12 + now.getMonth() - first.month;
  const years = Math.floor(months / 12);
  return months % 12 ? `${years}+` : `${years}`;
};

function TechChips({ list }) {
  if (!list.length) return null;
  return (
    <ul className="xp-chips" aria-label="Technologies">
      {list.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

function FeaturedRole({ exp }) {
  const tech = splitList(exp.technology);
  return (
    <article className="xp-featured">
      <div className="xp-featured-inner">
        <header className="xp-head">
          <CompanyLogo name={exp.companyName} large />
          <div className="min-w-0 flex-1">
            <div className="xp-role-row">
              <h3 className="xp-role">{exp.role}</h3>
              {exp.isCurrent && (
                <span className="xp-now">
                  <i aria-hidden="true" />
                  Currently working
                </span>
              )}
            </div>
            <p className="xp-company">{exp.companyName}</p>
            <p className="xp-dates">
              <IconCalendar size={15} stroke={2} aria-hidden="true" />
              {exp.experience}
              {exp.duration && <span className="xp-dur">{exp.duration}</span>}
            </p>
          </div>
        </header>

        {exp.project && (
          <div className="xp-project">
            <IconFolderOpen size={17} stroke={2} aria-hidden="true" />
            <div className="min-w-0">
              <span className="xp-label">Project</span>
              <p>{exp.project}</p>
            </div>
          </div>
        )}

        {tech.length > 0 && (
          <div className="xp-tech">
            <span className="xp-label">Tech stack</span>
            <TechChips list={tech} />
          </div>
        )}
      </div>
    </article>
  );
}

function CompactRole({ exp }) {
  const tech = splitList(exp.technology);
  return (
    <article className="xp-compact">
      <header className="xp-head">
        <CompanyLogo name={exp.companyName} />
        <div className="min-w-0 flex-1">
          <div className="xp-role-row">
            <h3 className="xp-role xp-role--sm">{exp.role}</h3>
            <span className="xp-dates xp-dates--right">
              <IconCalendar size={14} stroke={2} aria-hidden="true" />
              {exp.experience}
            </span>
          </div>
          <p className="xp-company">
            {exp.companyName}
            {exp.duration && <span className="xp-dur">{exp.duration}</span>}
          </p>
        </div>
      </header>
      {exp.project && (
        <p className="xp-compact-project">
          <IconFolderOpen size={15} stroke={2} aria-hidden="true" />
          <span>{exp.project}</span>
        </p>
      )}
      <TechChips list={tech} />
    </article>
  );
}

const Experience = () => {
  const { ExperienceDetails = [], profileData } = useContext(MyResumeContext);
  const fullName = profileData?.personalInfo?.name || "Manikandan Arumugam";
  if (!ExperienceDetails.length) return null;

  const items = ExperienceDetails.map((exp) => ({ ...exp, ...getRangeSummary(exp.experience) }));

  const companies = new Set(items.map((e) => shortCompany(e.companyName))).size;
  const techCount = new Set(items.flatMap((e) => splitList(e.technology).map((t) => t.toLowerCase()))).size;
  const years = totalExperience(items);

  const badgeCards = items.map((e, i) => ({
    name: fullName,
    photo: "/images/profile/manikandan_profile.jpeg",
    initials: initials(e.companyName),
    logo: logoFor(e.companyName),
    company: shortCompany(e.companyName),
    role: e.role,
    years: e.isCurrent ? `${e.start.split(" ").pop()} – Now` : `${e.start.split(" ").pop()} – ${e.end.split(" ").pop()}`,
    current: e.isCurrent,
    idNo: String(2100 + (items.length - i) * 137).slice(0, 4),
  }));

  const stats = [
    years && { icon: IconBriefcase, value: `${years} yrs`, label: "Experience" },
    { icon: IconBuildingSkyscraper, value: companies, label: companies === 1 ? "Company" : "Companies" },
    techCount && { icon: IconCode, value: `${techCount}+`, label: "Technologies" },
  ].filter(Boolean);

  return (
    <div className="section-card" id="experience">
      <div className="home-container">
        <SectionHeader number="04" title="Work Experience" />

        <motion.ul className="xp-stats" {...revealItem(0)}>
          {stats.map(({ icon: Icon, value, label }) => (
            <li key={label}>
              <span className="xp-stat-icon">
                <Icon size={18} stroke={2} aria-hidden="true" />
              </span>
              <strong>{value}</strong>
              <span>{label}</span>
            </li>
          ))}
        </motion.ul>

        <div className="career-grid">
        <ol className="ct xp-timeline">
          <motion.span
            className="ct-line"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            aria-hidden="true"
          />
          {items.map((exp, i) => (
            <motion.li className="ct-row" key={`${exp.companyName}-${i}`} {...revealItem(i)}>
              <div className="ct-when">
                <strong>{exp.start}</strong>
                <span>{exp.isCurrent ? "Present" : exp.end}</span>
                {exp.duration && <em>{exp.duration}</em>}
              </div>
              <span className={`ct-node ${exp.isCurrent ? "is-current" : ""}`} aria-hidden="true" />
              {i === 0 ? <FeaturedRole exp={exp} /> : <CompactRole exp={exp} />}
            </motion.li>
          ))}
        </ol>

          <div className="career-scene-col">
            <div className="career-scene" aria-hidden="true">
              <ExperienceScene3D cards={badgeCards} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experience;
