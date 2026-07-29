"use client";

import { useContext } from "react";
import { motion } from "framer-motion";
import {
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconClock,
  IconCode,
  IconFolderOpen,
} from "@tabler/icons-react";
import { MyResumeContext } from "@/components/context/MyResumeContext";
import SectionHeader from "@/components/common/SectionHeader";
import useScrollAnimation from "@/hooks/useScrollAnimation";

const TIMELINE_COLORS = [
  {
    color: "#6247e8",
    soft: "#f1edff",
    border: "#e2dcff",
    glow: "rgba(98, 71, 232, 0.26)",
    gradient: "linear-gradient(145deg, #7259f2, #5135dc)",
  },
  {
    color: "#ec3f91",
    soft: "#fff0f7",
    border: "#f8d8e8",
    glow: "rgba(236, 63, 145, 0.24)",
    gradient: "linear-gradient(145deg, #f554a1, #df2b80)",
  },
];

const MONTHS = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

const parseMonthYear = (value) => {
  const [month, year] = value.trim().split(/\s+/);
  const monthIndex = MONTHS[month?.slice(0, 3).toLowerCase()];
  const yearNumber = Number(year);
  return monthIndex === undefined || !yearNumber ? null : { month: monthIndex, year: yearNumber };
};

const getExperienceSummary = (range) => {
  const [start = "", end = ""] = range.split(/\s+[–-]\s+/);
  const isCurrent = /present/i.test(end);
  const startDate = parseMonthYear(start);
  const endDate = isCurrent ? null : parseMonthYear(end);

  if (isCurrent) return { isCurrent, start, duration: range };
  if (!startDate || !endDate) return { isCurrent: false, start, duration: range };

  const totalMonths = Math.max(0, (endDate.year - startDate.year) * 12 + endDate.month - startDate.month);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts = [];
  if (years) parts.push(`${years} ${years === 1 ? "Year" : "Years"}`);
  if (months) parts.push(`${months} ${months === 1 ? "Month" : "Months"}`);

  return { isCurrent: false, start, duration: parts.join(" ") || "Less than 1 Month" };
};

const Experience = () => {
  const { ExperienceDetails } = useContext(MyResumeContext);
  const [ref, isVisible] = useScrollAnimation(0.1);

  return (
    <div className="section-card" id="experience" ref={ref}>
      <div className="home-container">
        <SectionHeader number="04" title="Experience" viewAllText="View full experience" viewAllTo="experience" />

        <div className="portfolio-timeline">
          {ExperienceDetails.map((exp, index) => {
            const accent = TIMELINE_COLORS[index % TIMELINE_COLORS.length];
            const summary = getExperienceSummary(exp.experience);

            return (
              <motion.article
                className="portfolio-timeline-item"
                key={index}
                style={{
                  "--timeline-accent": accent.color,
                  "--timeline-soft": accent.soft,
                  "--timeline-border": accent.border,
                  "--timeline-glow": accent.glow,
                  "--timeline-gradient": accent.gradient,
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <div className="portfolio-timeline-rail" aria-hidden="true">
                  <span className="portfolio-timeline-dot">
                    <IconBriefcase size={23} stroke={1.9} />
                  </span>
                  <span className="portfolio-timeline-marker" />
                </div>

                <div className="portfolio-experience-card">
                  <div className="portfolio-experience-card-main">
                    <div className="portfolio-experience-date-pill">
                      <IconCalendar size={16} stroke={2.2} aria-hidden="true" />
                      <span>{exp.experience}</span>
                    </div>
                    <h3 className="portfolio-timeline-role">{exp.role}</h3>
                    <div className="portfolio-timeline-company">
                      <IconBuilding aria-hidden="true" />
                      <span>{exp.companyName}</span>
                    </div>

                    <div className="portfolio-experience-divider" />

                    <div className="portfolio-experience-details">
                      <div className="portfolio-experience-detail-row">
                        <IconFolderOpen aria-hidden="true" />
                        <strong>Project</strong>
                        <span className="portfolio-experience-colon">:</span>
                        <span>
                          {exp.project || "—"}
                          {exp.client ? ` ${exp.client}` : ""}
                        </span>
                      </div>
                      <div className="portfolio-experience-detail-row">
                        <IconCode aria-hidden="true" />
                        <strong>Technologies</strong>
                        <span className="portfolio-experience-colon">:</span>
                        <span>{exp.technology || "—"}</span>
                      </div>
                      <div className="portfolio-experience-detail-row">
                        <IconClock aria-hidden="true" />
                        <strong>Duration</strong>
                        <span className="portfolio-experience-colon">:</span>
                        <span>{exp.experience}</span>
                      </div>
                    </div>
                  </div>

                  <div className="portfolio-experience-summary">
                    <span className="portfolio-experience-summary-icon">
                      <IconCalendar size={23} stroke={2} aria-hidden="true" />
                    </span>
                    <span className="portfolio-experience-summary-copy">
                      <span className="portfolio-experience-summary-label">
                        {summary.isCurrent ? "Since" : "Duration"}
                      </span>
                      <strong className="portfolio-experience-summary-value">
                        {summary.isCurrent ? summary.start : summary.duration}
                      </strong>
                    </span>
                    <span className={`portfolio-experience-status ${summary.isCurrent ? "is-current" : ""}`}>
                      {summary.isCurrent ? "Present" : "Completed"}
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Experience;
