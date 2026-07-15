import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "SIPATUH-TB | Sistem Informasi Kepatuhan Pengobatan Tuberkulosis",
  description: "Platform edukasi kepatuhan pengobatan Tuberkulosis untuk mendukung kesembuhan pasien secara optimal.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={poppins.variable}>
      <body>
        <Navbar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
