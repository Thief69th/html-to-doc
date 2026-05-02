# html2doc — HTML to Word Converter

> Fast, clean Next.js web app to convert HTML files to `.docx` Word documents.

**Live features:**
- Drag & drop HTML file upload
- Server-side conversion (better output quality)
- Options: font family, font size, page orientation, page numbers
- HTML preview before converting
- Instant `.docx` download

---

## 🚀 Deploy on Vercel (via GitHub)

### Step 1 — GitHub par push karein

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/html2doc.git
git push -u origin main
```

### Step 2 — Vercel par import karein

1. [vercel.com](https://vercel.com) par jao
2. **Add New → Project** click karein
3. Apna GitHub repo select karein
4. Framework: **Next.js** auto-detect ho jaayega
5. **Deploy** click karein ✅

---

## 💻 Local Development

```bash
npm install
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## Build & Production

```bash
npm run build
npm start
```

---

## Tech Stack

| Part | Technology |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Conversion | `html-to-docx` (Node.js API route) |
| Styling | CSS Modules |
| Fonts | Syne + JetBrains Mono |
| Deploy | Vercel |

---

## Project Structure

```
html2doc/
├── app/
│   ├── api/
│   │   └── convert/
│   │       └── route.js     ← Conversion API
│   ├── globals.css
│   ├── layout.js
│   ├── page.js              ← Main UI
│   └── page.module.css
├── next.config.mjs
├── package.json
└── README.md
```
