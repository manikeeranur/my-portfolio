import Home from "@/components/Home/Home";
import About from "@/components/About/About";
import TechStack from "@/components/TechStack/TechStack";
import Projects from "@/components/Projects/Projects";
import Experience from "@/components/Experience/Experience";
import Youtube from "@/components/Youtube/Youtube";
import Contact from "@/components/Contact/Contact";

export default function HomePage() {
  return (
    <>
      <Home />
      <About />
      <TechStack />
      <Projects />
      <Experience />
      <Youtube />
      <Contact />
    </>
  );
}
