"use client";

import { useContext } from "react";
import dynamic from "next/dynamic";
import { MyResumeContext } from "@/components/context/MyResumeContext";
import SectionHeader from "@/components/common/SectionHeader";
import { getTechIcon, LetterBadge } from "@/components/common/techIcons";
import useScrollAnimation from "@/hooks/useScrollAnimation";

const Carousel = dynamic(() => import("@/components/common/Carousel"), { ssr: false });

const STATIC_TECHS = [
  { id: "s01", name: "HTML" },
  { id: "s02", name: "CSS" },
  { id: "s03", name: "JavaScript" },
  { id: "s04", name: "TypeScript" },
  { id: "s05", name: "React Js" },
  { id: "s06", name: "Next Js" },
  { id: "s07", name: "Bootstrap" },
  { id: "s08", name: "Git" },
  { id: "s09", name: "GitHub" },
  { id: "s10", name: "VS Code" },
  { id: "s11", name: "Figma" },
];

const TechStack = () => {
  const { profileData } = useContext(MyResumeContext);
  const techs = profileData.techs?.length > 0 ? profileData.techs : STATIC_TECHS;
  const [ref, isVisible] = useScrollAnimation(0.1);

  return (
    <div className="section-card" id="techstack" ref={ref}>
      <div className="home-container">
        <SectionHeader number="02" title="Tech Stack" />
        <div className={`skills-reveal ${isVisible ? "is-visible" : ""}`}>
          <Carousel
            items={techs}
            keyField="name"
            perView={{ base: 2, md: 6 }}
            gap={16}
            renderItem={(tech) => {
              const icon = getTechIcon(tech.name, tech.image);
              return (
                <div className="tech-box">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {icon ? <img src={icon} alt={tech.name} width="30" height="30" /> : <LetterBadge name={tech.name} />}
                  <span>{tech.name}</span>
                </div>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TechStack;
