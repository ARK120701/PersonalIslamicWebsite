# AGENTS.md

## Project Overview

Static personal portfolio website for Abdurrahman Khan — a collection of standalone HTML pages with no build system, package manager, or server-side framework. All pages are self-contained HTML files with inline CSS and JavaScript.

### Pages

| Page | Purpose |
|---|---|
| `index.html` | Main homepage / portfolio landing page |
| `books.html` | Books studied under teachers (static content with filtering) |
| `library.html` | Digital Islamic Library — full CRUD with Supabase + Cloudflare R2 |
| `library-demo.html` | Interactive demo of the library's database architecture |
| `fatawa.html` | Fatawa & Notes — admin can upload/manage religious rulings (localStorage) |
| `teachers.html` | Teacher biographies — admin can add/edit bios (localStorage) |
| `projects.html` | CS project portfolio — admin can add/edit projects (localStorage) |
| `cloudflare-worker.js` | Cloudflare Worker script for PDF upload/delete to R2 storage |

## Cursor Cloud specific instructions

### Running the dev server

This is a zero-dependency static site. Serve it with any HTTP server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/index.html` in the browser.

### Key details

- **No build step, no lint, no tests**: There is no `package.json`, `Makefile`, or test framework. The site is plain HTML/CSS/JS.
- **Admin mode**: Several pages (`teachers.html`, `fatawa.html`, `projects.html`, `index.html`) have an admin mode activated via `Ctrl+Shift+A`. The default admin password is embedded in the HTML source of each page.
- **localStorage pages**: `teachers.html`, `fatawa.html`, `projects.html` persist data in browser `localStorage`. They work fully offline with no backend.
- **Supabase-dependent page**: `library.html` requires the remote Supabase instance (`bjcqcojkfxvqnsfuklsf.supabase.co`) for book/folder CRUD. Credentials are hardcoded in the HTML.
- **Cloudflare Worker**: `library.html` uses a Cloudflare Worker at `library-upload.a-khan120701.workers.dev` for PDF upload/delete. The admin key is hardcoded.
- **No linting or testing commands exist** — there are no automated tests or lint configurations to run.
