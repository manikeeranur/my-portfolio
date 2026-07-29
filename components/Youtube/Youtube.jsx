"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import SectionHeader from "@/components/common/SectionHeader";
import useScrollAnimation from "@/hooks/useScrollAnimation";

const Carousel = dynamic(() => import("@/components/common/Carousel"), { ssr: false });

const CHANNEL_URL = "https://www.youtube.com/@studentcodertech8500";

const STATS = [
  { value: "50+", label: "Videos" },
  { value: "10K+", label: "Subscribers" },
  { value: "1M+", label: "Views" },
  { value: "4.8★", label: "Average Rating" },
];

const VIDEOS = [
  { id: "l1p-Gtdqaj8", title: "Student Coder Tech video 1" },
  { id: "cLwVurqpFGM", title: "Student Coder Tech video 2" },
  { id: "vpT4COLg_AY", title: "Student Coder Tech video 3" },
  { id: "86OJXsSPti0", title: "Student Coder Tech video 4" },
  { id: "P4KikQHdCIA", title: "Student Coder Tech video 5" },
  { id: "U058fhO_rNY", title: "Student Coder Tech video 6" },
];

const Youtube = () => {
  const [ref, isVisible] = useScrollAnimation(0.15);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    if (!activeVideo) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setActiveVideo(null);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeVideo]);

  return (
    <div className="section-card" id="youtube" ref={ref}>
      <div className="home-container">
        <SectionHeader number="05" title="YouTube Channel" viewAllText="View channel" viewAllTo="youtube" />

        <div className={`youtube-panel ${isVisible ? "is-visible" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/youtube/youtube-banner.png"
            alt="Student Coder Tech YouTube channel"
            width="100%"
            style={{ borderRadius: 16, overflow: "hidden" }}
          />

          <div className="youtube-info">
            <div className="youtube-heading">Student Coder Tech! 🎯</div>
            <p>
              Student Coder Tech is a Tamil programming YouTube channel dedicated to making web development easy
              for beginners. Learn HTML, CSS, and UI Development with step-by-step tutorials and hands-on
              projects.
            </p>

            <div className="youtube-stats">
              {STATS.map((s) => (
                <div className="youtube-stat" key={s.label}>
                  <div className="youtube-stat-value">{s.value}</div>
                  <div className="youtube-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <a href={CHANNEL_URL} target="_blank" rel="noreferrer" className="btn-cta">
              Subscribe on YouTube
              <i className="fa fa-youtube-play" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="youtube-videos-carousel">
          <Carousel
            items={VIDEOS}
            keyField="id"
            perView={{ base: 1, md: 3 }}
            gap={20}
            autoplay
            loop
            renderItem={(video) => (
              <button
                type="button"
                className="youtube-thumb"
                onClick={() => setActiveVideo(video)}
                aria-label={`Play ${video.title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="youtube-thumb-img"
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={video.title}
                  loading="lazy"
                />
                <span className="youtube-play">
                  <i className="fa fa-play" aria-hidden="true" />
                </span>
              </button>
            )}
          />
        </div>
      </div>

      {activeVideo && (
        <div className="youtube-modal-overlay" onClick={() => setActiveVideo(null)}>
          <div className="youtube-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="youtube-modal-close"
              onClick={() => setActiveVideo(null)}
              aria-label="Close video"
            >
              <i className="fa fa-times" aria-hidden="true" />
            </button>
            <div className="youtube-modal-frame">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`}
                title={activeVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Youtube;
