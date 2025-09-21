import { useRef } from "react";
import Header from "@/components/Header";
import Layout from "@/components/Layout";
import Timeline from "@/components/Timeline";
import UploadForm from "@/components/UploadForm";
import Footer from "@/components/Footer";

export default function HomePage() {
  console.log('🏠 HomePage rendering');

  const uploadFormRef = useRef<HTMLDivElement>(null);

  const handleUploadClick = () => {
    if (uploadFormRef.current) {
      const yOffset = -80; // adjust for sticky header height
      const y = uploadFormRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div>
      <Header onUploadClick={handleUploadClick} />

      <Layout>
        <div ref={uploadFormRef}>
          <UploadForm />
        </div>

        <Timeline />
      </Layout>

      <Footer onUploadClick={handleUploadClick} />
    </div>
  );
}
