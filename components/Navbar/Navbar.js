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

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoContainer}>
          <Image
            src="/images/logo.png"
            alt="SIPATUH-TB Logo"
            width={32}
            height={32}
            className={styles.logoImage}
          />
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
