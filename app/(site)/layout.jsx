import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

export default function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
