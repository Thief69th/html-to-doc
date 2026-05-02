'use client';

import { useState, useRef, useCallback } from 'react';
import styles from './page.module.css';

const FONTS = ['Calibri', 'Arial', 'Times New Roman', 'Georgia', 'Verdana'];
const FONT_SIZES = [
  { label: 'Small (10pt)', value: 20 },
  { label: 'Normal (11pt)', value: 22 },
  { label: 'Large (12pt)', value: 24 },
];

export default function Home() {
  const [file, setFile] = useState(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState(null); // null | {type, msg}
  const [converting, setConverting] = useState(false);
  const [preview, setPreview] = useState(false);
  const [options, setOptions] = useState({
    font: 'Calibri',
    fontSize: 22,
    orientation: 'portrait',
    pageNumbers: false,
  });

  const fileInputRef = useRef(null);

  const readFile = useCallback((f) => {
    if (!f) return;
    if (!f.name.match(/\.(html|htm)$/i)) {
      setStatus({ type: 'error', msg: 'Sirf .html ya .htm file select karein' });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setStatus({ type: 'error', msg: 'File 10MB se chhoti honi chahiye' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setHtmlContent(e.target.result);
      setFile(f);
      setStatus(null);
    };
    reader.readAsText(f, 'UTF-8');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) readFile(dropped);
  }, [readFile]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) readFile(e.target.files[0]);
  };

  const removeFile = () => {
    setFile(null);
    setHtmlContent('');
    setStatus(null);
    setPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleConvert = async () => {
    if (!file || !htmlContent) return;
    setConverting(true);
    setStatus({ type: 'loading', msg: 'Converting…' });

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: htmlContent,
          filename: file.name,
          options,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.details || err.error || 'Conversion failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.(html|htm)$/i, '.docx');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus({ type: 'success', msg: 'DOCX download ho gaya!' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message || 'Kuch gadbad ho gayi' });
    } finally {
      setConverting(false);
    }
  };

  const opt = (key, val) => setOptions((o) => ({ ...o, [key]: val }));

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          html2doc
        </div>
        <h1 className={styles.title}>
          Convert <em>HTML</em><br />to Word
        </h1>
        <p className={styles.sub}>
          Server-side conversion · Styles preserved · Instant download
        </p>
      </header>

      {/* Main Card */}
      <div className={styles.card}>

        {/* Drop Zone */}
        {!file ? (
          <div
            className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            aria-label="Upload HTML file"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm"
              className={styles.hiddenInput}
              onChange={handleFileChange}
            />
            <div className={styles.dropIcon}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 4v16M7 11l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 22h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className={styles.dropTitle}>
              {dragOver ? 'Yahan chhod do…' : 'HTML file drag karein'}
            </p>
            <p className={styles.dropSub}>
              ya <span className={styles.link}>browse karein</span> · max 10MB
            </p>
          </div>
        ) : (
          <div className={styles.fileCard}>
            <div className={styles.fileIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 2h8l4 4v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="var(--accent2)" strokeWidth="1.5" fill="none"/>
                <path d="M13 2v4h4" stroke="var(--accent2)" strokeWidth="1.5" fill="none"/>
                <path d="M7 9h6M7 12h4" stroke="var(--accent2)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className={styles.fileDetails}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileMeta}>{formatSize(file.size)}</span>
            </div>
            <div className={styles.fileActions}>
              <button
                className={styles.previewBtn}
                onClick={() => setPreview(!preview)}
                title="Preview HTML"
              >
                {preview ? 'Hide' : 'Preview'}
              </button>
              <button className={styles.removeBtn} onClick={removeFile} title="Remove">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* HTML Preview */}
        {preview && htmlContent && (
          <div className={styles.previewBox}>
            <div className={styles.previewHeader}>
              <span>Preview</span>
              <span className={styles.previewNote}>Rendered HTML</span>
            </div>
            <iframe
              className={styles.previewFrame}
              srcDoc={htmlContent}
              title="HTML Preview"
              sandbox="allow-same-origin"
            />
          </div>
        )}

        {/* Divider */}
        <div className={styles.divider} />

        {/* Options */}
        <div className={styles.options}>
          <p className={styles.optLabel}>Conversion Options</p>

          <div className={styles.optGrid}>
            {/* Font */}
            <div className={styles.optItem}>
              <label className={styles.optName}>Font</label>
              <select
                className={styles.select}
                value={options.font}
                onChange={(e) => opt('font', e.target.value)}
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div className={styles.optItem}>
              <label className={styles.optName}>Font Size</label>
              <select
                className={styles.select}
                value={options.fontSize}
                onChange={(e) => opt('fontSize', Number(e.target.value))}
              >
                {FONT_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Orientation */}
            <div className={styles.optItem}>
              <label className={styles.optName}>Orientation</label>
              <div className={styles.segmented}>
                {['portrait', 'landscape'].map((v) => (
                  <button
                    key={v}
                    className={`${styles.seg} ${options.orientation === v ? styles.segActive : ''}`}
                    onClick={() => opt('orientation', v)}
                  >
                    {v === 'portrait' ? '↕ Portrait' : '↔ Landscape'}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Numbers */}
            <div className={styles.optItem}>
              <label className={styles.optName}>Page Numbers</label>
              <div className={styles.segmented}>
                {[false, true].map((v) => (
                  <button
                    key={String(v)}
                    className={`${styles.seg} ${options.pageNumbers === v ? styles.segActive : ''}`}
                    onClick={() => opt('pageNumbers', v)}
                  >
                    {v ? 'Yes' : 'No'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Convert Button + Status */}
        <div className={styles.footer}>
          {status && (
            <div className={`${styles.status} ${styles[status.type]}`}>
              {status.type === 'loading' && <span className={styles.spinner} />}
              {status.type === 'success' && (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M4.5 7.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {status.type === 'error' && (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M7.5 4.5v4M7.5 10.5v.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              )}
              {status.msg}
            </div>
          )}

          <button
            className={styles.convertBtn}
            onClick={handleConvert}
            disabled={!file || converting}
          >
            {converting ? (
              <>
                <span className={styles.spinnerLight} />
                Converting…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                DOCX Download Karein
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info strip */}
      <div className={styles.infoStrip}>
        <div className={styles.infoItem}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1a6 6 0 100 12A6 6 0 007 1z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <path d="M7 6v4M7 4v.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Tables, images, styles sab preserve hote hain
        </div>
        <div className={styles.infoDot} />
        <div className={styles.infoItem}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1a6 6 0 100 12A6 6 0 007 1z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <path d="M5 7l1.5 1.5L9 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Vercel par deploy ready
        </div>
        <div className={styles.infoDot} />
        <div className={styles.infoItem}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="3" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <path d="M5 6.5h4M5 9h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          .docx format · Word compatible
        </div>
      </div>
    </main>
  );
}
