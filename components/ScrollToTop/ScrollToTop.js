"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import styles from "./ScrollToTop.module.css";

export default function ScrollToTop() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    // Trigger check immediately in case page is already scrolled
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Hide on homepage (beranda)
  if (pathname === "/") {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={`${styles.scrollTopBtn} ${isVisible ? styles.visible : ""}`}
      aria-label="Scroll ke atas"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
      </svg>
    </button>
  );
}
