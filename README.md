<div align="center">
  <img src="https://via.placeholder.com/150x150/000000/FFFFFF?text=NOW" alt="NOW Logo" width="120" height="120" style="border-radius: 20px;" />
  
  # NOW
  **The real-time social layer for the physical and digital world.**

  <p align="center">
    <a href="#features">Features</a> • 
    <a href="#architecture">Architecture</a> • 
    <a href="#getting-started">Getting Started</a> • 
    <a href="#contributing">Contributing</a>
  </p>
</div>

---

## 🌍 Vision

Traditional social products organize around people (who you follow, what creators publish). **NOW** organizes around **moments**:
- What is happening right now
- Where it is happening
- Who is there
- What people are saying

NOW is built to answer the question: *"What's happening right now?"* and serves as the bridge between the physical world and the digital social graph.

---

## ✨ Features

- **Live Moments:** Ephemeral, real-time events that users can discover and join.
- **Interactive Map:** A beautifully integrated Leaflet map that plots active moments based on exact GPS coordinates.
- **Real-Time Chat & Presence:** Powered by Supabase Realtime, see exactly who is in a moment and chat instantly.
- **Media Uploads:** Seamless, client-side image sharing in moments and direct messages using Supabase Storage.
- **Direct Messaging:** Private, encrypted 1-on-1 conversations with real-time updates and optimistic UI.
- **Trust & Safety:** Enterprise-grade moderation tools allowing users to report content and block abusive accounts instantly.
- **Optimistic UI:** Every interaction (liking, messaging, following) feels instant and fluid, eliminating loading states.

---

## 🛠️ Tech Stack

NOW is built using a modern, scalable, and modular stack:

- **Frontend:** [Next.js 15 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Backend & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime, Storage)
- **Maps:** [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) account and project.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/now.git
cd now
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and populate it with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

Execute the provided SQL migration files located in the `supabase/` directory via your Supabase SQL Editor in the following order:

1. `schema.sql` (Base tables)
2. `realtime.sql` (Real-time policies)
3. `follows_schema.sql` (Social graph)
4. `dm_schema.sql` (Direct Messaging)
5. `notifications_schema.sql` (Activity alerts)
6. `moderation_schema.sql` (Trust & Safety)
7. `storage_schema.sql` (Media buckets)

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

---

## 📁 Project Structure

```text
now/
├── src/
│   ├── app/             # Next.js App Router pages and layouts
│   ├── components/      # Reusable UI components
│   ├── features/        # Domain-specific logic and types (e.g., Moments)
│   ├── lib/             # Utilities and database clients
│   └── providers/       # Global context providers
├── supabase/            # SQL migration files and database definitions
├── docs/                # Extended product and engineering documentation
└── public/              # Static assets
```

---

## 🔒 Security & Privacy

Privacy is a core pillar of NOW. Precise user locations are never exposed as public social primitives. Row Level Security (RLS) policies are strictly enforced across all PostgreSQL tables to guarantee that users can only access data they are explicitly authorized to view or modify.

---

## 📄 License

This project is proprietary and confidential. All rights reserved.
