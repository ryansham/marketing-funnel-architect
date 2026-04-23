# Marketing Funnel Architect

![Banner](https://private-user-images.githubusercontent.com/159876365/477138731-0aa67016-6eaf-458a-adb2-6e31a0763ed6.png)

A visual campaign flow designer for O2O (Online-to-Offline) marketing teams. Map your full funnel — from paid ads to offline conversion — using a drag-and-drop canvas.

🔗 **Live:** [marketing-funnel-architect.vercel.app](https://marketing-funnel-architect.vercel.app)

---

## Features

- **Drag-and-drop canvas** — build campaign flows visually with no code
- **Channel cards** — Meta Ads, Google Ads, Instagram, WhatsApp, Email, TikTok, WeChat, Outdoor Media and more
- **Landing page wireframe** — mockup your campaign page with Hero, CTA, Form and other modules
- **6 campaign templates** — O2O Event, Lead Generation, Loyalty Re-engagement, Product Launch, Webinar, Referral Programme
- **Typography tools** — Headline and Paragraph text blocks, freely resizable
- **Vector shapes** — Square, Circle, Line and Dotted Line for annotations and grouping
- **Auto Arrange** — align all cards vertically centered with one click
- **Cmd+K search** — jump to any node on the canvas instantly
- **Guided onboarding tour** — first-time walkthrough for new users
- **Export** — download as PNG, PDF or JSON
- **Dark / Light mode**
- **Language switching** — English, Traditional Chinese, Simplified Chinese

---

## Tech Stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Canvas | ReactFlow 11 |
| State | Zustand 5 |
| Styling | Tailwind CSS 4 |
| Build | Vite 6 |
| Deploy | Vercel |

---

## Run Locally

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
src/
├── App.tsx               # Main canvas, toolbar, templates, i18n
├── components/
│   ├── NodeTypes.tsx     # All node components (cards, shapes, text)
│   ├── Sidebar.tsx       # Right-side config panel
│   └── MockupPreview.tsx # Landing page wireframe preview
├── store/
│   └── useStore.ts       # Zustand global state
├── types.ts              # TypeScript types
└── index.css             # Global styles
```

---

## License

MIT © [ryansham](https://github.com/ryansham) · [martechtalks](https://martechtalks.com)
