"use client";

import { useContext } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Link } from "react-scroll";
import { MyResumeContext } from "@/components/context/MyResumeContext";
import StatsBar from "./StatsBar";

const TypeAnimation = dynamic(() => import("react-type-animation").then((m) => m.TypeAnimation), {
  ssr: false,
});

const HeroScene3D = dynamic(() => import("./HeroScene3D"), {
  ssr: false,
  loading: () => <div className="about-scene-loading" />,
});

const heroPhoto = "/images/profile/manikandan_profile.jpeg";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" },
});

const Home = () => {
  const { profileData } = useContext(MyResumeContext);
  const { personalInfo } = profileData;

  const displayName = personalInfo.name || "Manikandan A";
  const displayTitle = personalInfo.title || "Frontend Developer";
  const displayBio = personalInfo.bio || "";

  const socialLinks = [
    { icon: "fa-linkedin", href: personalInfo.linkedin || "https://www.linkedin.com/in/manikandanarumugam001" },
    { icon: "fa-github", href: personalInfo.github || "https://github.com/manikeeranur" },
    { icon: "fa-envelope-o", href: `mailto:${personalInfo.email || "manikeeranur2105@gmail.com"}` },
  ];

  return (
    <div id="home">
      <div className="home-container">
        <div className="hero-grid">
          <div>
            <motion.p className="home-greeting" {...fadeUp(0)}>
              Hi, I&apos;m <span className="wave animate-wave">👋</span>
            </motion.p>

            <motion.h1 className="myJob" {...fadeUp(0.18)}>
              {displayName}
            </motion.h1>

            <motion.div {...fadeUp(0.36)}>
              <TypeAnimation
                sequence={[displayTitle + ".", 2000, "Frontend Developer.", 2000, "React Developer.", 2000]}
                wrapper="h2"
                speed={50}
                className="role"
                repeat={Infinity}
              />
            </motion.div>

            <motion.p className="hero-subtitle" {...fadeUp(0.45)}>
              {displayBio.split(". ")[0] ? `${displayBio.split(". ")[0]}.` : displayBio}
            </motion.p>

            <motion.div {...fadeUp(0.54)} className="hero-actions">
              <Link to="projects" smooth duration={500} offset={-80}>
                <button className="download-button-new">
                  View My Work
                  <i className="fa fa-arrow-right" aria-hidden="true" />
                </button>
              </Link>
              <Link to="contact" smooth duration={500} offset={-80}>
                <button className="download-button-outline">
                  Get In Touch
                  <i className="fa fa-arrow-right ml-2" aria-hidden="true" />
                </button>
              </Link>
            </motion.div>

            <motion.div {...fadeUp(0.62)} className="hero-social">
              <span className="hero-social-label">Connect with me</span>
              <div className="hero-social-row">
                {socialLinks.map((s) => (
                  <a
                    key={s.icon}
                    href={s.href}
                    target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noreferrer"
                    className="hero-social-btn"
                  >
                    <i className={`fa ${s.icon}`} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            className="hero-image-col"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          >
            <div className="hero-scene" role="img" aria-label={displayName}>
              <HeroScene3D photo={heroPhoto} />
            </div>
          </motion.div>
        </div>

        <StatsBar />
      </div>
    </div>
  );
};

export default Home;
