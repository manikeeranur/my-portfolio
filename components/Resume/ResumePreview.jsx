"use client";

import { useState, useEffect, useRef } from "react";
import MyResume from "./MyResume";

const ResumePreview = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const topbarRef = useRef(null);

  // Mobile only: scale full 1024px resume to fit screen — no scroll
  useEffect(() => {
    const scaleResume = () => {
      const container = document.querySelector(".container-resume");
      const wrapper = document.querySelector(".my-resume");
      if (!container || !wrapper) return;

      const vw = window.innerWidth;

      if (vw < 1024) {
        const topbarH = topbarRef.current ? topbarRef.current.offsetHeight : 50;
        const availH = window.innerHeight - topbarH;

        container.style.transform = "";
        container.style.marginLeft = "";
        wrapper.style.height = "";
        wrapper.style.overflow = "";

        const naturalH = container.offsetHeight;

        const scale = Math.min(vw / 1024, availH / naturalH);
        const scaledW = 1024 * scale;
        const scaledH = naturalH * scale;
        const leftOffset = (vw - scaledW) / 2;

        container.style.transform = `scale(${scale})`;
        container.style.transformOrigin = "top left";
        container.style.marginLeft = `${leftOffset}px`;
        wrapper.style.height = `${scaledH}px`;
        wrapper.style.overflow = "hidden";
      } else {
        container.style.transform = "";
        container.style.transformOrigin = "";
        container.style.marginLeft = "";
        wrapper.style.height = "";
        wrapper.style.overflow = "";
      }
    };

    const timer = setTimeout(scaleResume, 100);
    window.addEventListener("resize", scaleResume);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", scaleResume);
    };
  }, []);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/pdf");
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Manikandan_Resume.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("PDF generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        color: "#000",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div
        ref={topbarRef}
        className="resume-topbar"
        style={{ position: "sticky", top: 0, zIndex: 10 }}
      >
        <div className="border-b border-[#ebe9f5] bg-white/95 px-4 py-3 shadow-[0_8px_30px_rgba(30,27,46,0.08)] backdrop-blur-md sm:px-6">
          <div className="mx-auto flex max-w-[1024px] items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0edff] text-[#69599c]">
                  <i className="fa fa-file-text-o text-base" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h1 className="m-0 truncate text-sm font-bold leading-5 text-[#1e1b2e] sm:text-base">
                    Resume Preview
                  </h1>
                  <p className="m-0 hidden text-xs leading-4 text-[#77738a] sm:block">
                    Review your resume or save a PDF copy
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="group inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#69599c] to-[#806fd0] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(105,89,156,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(105,89,156,0.36)] focus:outline-none focus:ring-4 focus:ring-[#69599c]/20 disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0 sm:px-5"
            >
              <i
                className={`fa ${isGenerating ? "fa-spinner fa-spin" : "fa-download"} text-sm`}
                aria-hidden="true"
              />
              <span>{isGenerating ? "Generating…" : "Download PDF"}</span>
            </button>
          </div>
        </div>
      </div>

      <MyResume />
    </div>
  );
};

export default ResumePreview;
