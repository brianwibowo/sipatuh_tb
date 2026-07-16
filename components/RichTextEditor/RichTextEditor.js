"use client";

import React, { useRef, useEffect } from "react";
import styles from "./RichTextEditor.module.css";

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);

  // Sync value from parent state
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command, arg = null) => {
    // Basic text formatting command execution
    document.execCommand(command, false, arg);
    handleInput();
  };

  return (
    <div className={styles.richContainer}>
      <div className={styles.richToolbar}>
        <button
          type="button"
          onClick={() => executeCommand("bold")}
          title="Tebal (Bold)"
          className={styles.toolBtn}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => executeCommand("italic")}
          title="Miring (Italic)"
          className={styles.toolBtn}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => executeCommand("underline")}
          title="Garis Bawah (Underline)"
          className={styles.toolBtn}
        >
          <u>U</u>
        </button>

        <div className={styles.divider}></div>

        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "<h3>")}
          title="Judul (Heading 3)"
          className={styles.toolBtn}
        >
          Judul
        </button>
        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "<p>")}
          title="Paragraf Normal"
          className={styles.toolBtn}
        >
          Paragraf
        </button>

        <div className={styles.divider}></div>

        <button
          type="button"
          onClick={() => executeCommand("insertUnorderedList")}
          title="Daftar Bulatan (Bullet List)"
          className={styles.toolBtn}
        >
          • List
        </button>

        <button
          type="button"
          onClick={() => executeCommand("insertOrderedList")}
          title="Daftar Angka (Numbered List)"
          className={styles.toolBtn}
        >
          1. List
        </button>

        <div className={styles.divider}></div>

        <button
          type="button"
          onClick={() => executeCommand("removeFormat")}
          title="Hapus Format"
          className={styles.clearBtn}
        >
          🧹 Bersihkan Format
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className={styles.richContent}
        placeholder={placeholder || "Tulis isi berita di sini..."}
      />
    </div>
  );
}
