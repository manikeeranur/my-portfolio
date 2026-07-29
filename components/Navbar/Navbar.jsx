"use client";

import { useState, useEffect } from "react";
import { Link } from "react-scroll";

const NAV_ITEMS = [
  { name: "Home", to: "home", offset: -80 },
  { name: "About", to: "about", offset: -80 },
  { name: "Skills", to: "techstack", offset: -80 },
  { name: "Projects", to: "projects", offset: -80 },
  { name: "Experience", to: "experience", offset: -80 },
  { name: "YouTube", to: "youtube", offset: -80 },
  { name: "Contact", to: "contact", offset: -80 },
];

const Navbar = () => {
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("activeSection");
    if (saved) setActive(saved);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSetActive = (section) => {
    setActive(section);
    localStorage.setItem("activeSection", section);
    setMenuOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-[1000] border-b border-card-border bg-white/[.92] transition-[background,box-shadow] duration-[400ms]${
        scrolled ? " navbar-scrolled" : ""
      }`}
    >
      <div className="mx-auto flex max-w-[1140px] items-center justify-between gap-4 px-5 py-3">
        <a className="navbar-brand" href="/">
          <div className="navbar-avatar">MA</div>
          <span className="navbar-brand-name">Manikandan Arumugam</span>
        </a>

        <button
          type="button"
          className="navbar-toggler lg:hidden"
          aria-controls="mobile-nav"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <i className={`fa ${menuOpen ? "fa-times" : "fa-bars"}`} aria-hidden="true" />
        </button>

        <div className="hidden items-center gap-1 lg:flex">
          <ul className="flex items-center gap-1.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  smooth
                  duration={400}
                  offset={item.offset}
                  className={`nav-link ${active === item.to ? "active" : ""}`}
                  onClick={() => handleSetActive(item.to)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="navbar-resume-btn"
            onClick={() => window.open("/myresume", "_blank")}
          >
            <i className="fa fa-download mr-2" aria-hidden="true" />
            Download Resume
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-nav" className="border-t border-card-border bg-white px-5 py-4 lg:hidden">
          <ul className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  smooth
                  duration={400}
                  offset={item.offset}
                  className={`nav-link block ${active === item.to ? "active" : ""}`}
                  onClick={() => handleSetActive(item.to)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="navbar-resume-btn mt-3 ml-0 w-full justify-center"
            onClick={() => window.open("/myresume", "_blank")}
          >
            <i className="fa fa-download mr-2" aria-hidden="true" />
            Download Resume
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
