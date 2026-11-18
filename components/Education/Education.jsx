"use client";

import { useContext } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { IconMapPin } from "@tabler/icons-react";
import { MyResumeContext } from "@/components/context/MyResumeContext";
import SectionHeader from "@/components/common/SectionHeader";
import { revealItem } from "@/components/common/careerUtils";

const EducationScene3D = dynamic(() => import("./EducationScene3D"), {
  ssr: false,
  loading: () => <div className="about-scene-loading" />,
});

const Education = () => {
  const { educationDetails = [] } = useContext(MyResumeContext);
  if (!educationDetails.length) return null;

  return (
    <div className="section-card" id="education">
      <div className="home-container">
        <SectionHeader number="05" title="Education" />

        <div className="career-grid is-edu">
          <ol className="ct">
            <motion.span
              className="ct-line"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              aria-hidden="true"
            />
            {educationDetails.map((edu, i) => {
              const [from, to] = (edu.year || "").split(/\s*-\s*/);
              const score = parseFloat(edu.percentage);
              const field = edu.field && edu.field !== edu.degree ? edu.field : "";
              return (
                <motion.li className="ct-row" key={`${edu.degree}-${i}`} {...revealItem(i)}>
                  <div className="ct-when">
                    <strong>{to || from}</strong>
                    {to && from && <span>{from} – {to}</span>}
                  </div>

                  <span className="ct-node" aria-hidden="true" />

                  <article className="ct-card">
                    {edu.year && <span className="ct-when-mobile">{edu.year}</span>}
                    <header className="ct-head">
                      <div className="min-w-0">
                        <h3 className="ct-title">{edu.degree}</h3>
                        <p className="ct-org">
                          <IconMapPin size={15} stroke={2} aria-hidden="true" />
                          {edu.institute}
                        </p>
                      </div>
                      {field && <span className="ct-field">{field}</span>}
                    </header>

                    {!Number.isNaN(score) && (
                      <div className="ct-score">
                        <div className="ct-score-top">
                          <span>Score</span>
                          <strong>{edu.percentage}</strong>
                        </div>
                        <div className="ct-score-track">
                          <motion.span
                            className="ct-score-fill"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min(score, 100)}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    )}
                  </article>
                </motion.li>
              );
            })}
          </ol>

          <div className="career-scene-col">
            <div className="career-scene" aria-hidden="true">
              <EducationScene3D />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;
