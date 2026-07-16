"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  if (pathname === "/") {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoContainer}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            {/* Cross at the top */}
            <path d="M12 2V8M9 5H15" stroke="var(--secondary)" strokeWidth="2.5" strokeLinecap="round" />
            {/* Left Lung */}
            <path d="M10.5 9.5C8.5 7.5 5 9 5 12.5C5 16 8 18 10.5 17" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Right Lung */}
            <path d="M13.5 9.5C15.5 7.5 19 9 19 12.5C19 16 16 18 13.5 17" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Central Leaf */}
            <path d="M12 9C10.5 12 11 16 12 18.5C13 16 13.5 12 12 9Z" fill="#34A853" stroke="#137333" strokeWidth="1" strokeLinejoin="round" />
          </svg>
          <span className={styles.logoText}>
            SIPATUH<span className={styles.logoHighlight}>-TB</span>
          </span>
        </Link>

        {/* Mobile Hamburger */}
        <button
          className={`${styles.hamburger} ${isOpen ? styles.hamburgerOpen : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <nav className={`${styles.nav} ${isOpen ? styles.navOpen : ""}`}>
          <Link
            href="/"
            className={`${styles.link} ${isActive("/") ? styles.activeLink : ""}`}
            onClick={() => setIsOpen(false)}
          >
            Beranda
          </Link>
          <Link
            href="/petugas"
            className={`${styles.link} ${isActive("/petugas") ? styles.activeLink : ""}`}
            onClick={() => setIsOpen(false)}
          >
            Menu Petugas
          </Link>
          <Link
            href="/pasien"
            className={`${styles.link} ${isActive("/pasien") ? styles.activeLink : ""}`}
            onClick={() => setIsOpen(false)}
          >
            Menu Pasien
          </Link>
        </nav>
      </div>
    </header>
  );
}
