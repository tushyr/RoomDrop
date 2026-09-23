# RoomDrop 🔽

> Instant private rooms for real-time text sharing. No accounts. No clutter. Rooms vanish in 1 hour.

---

## ✨ Features

- **One-click room creation** — generates a 6-char code instantly
- **Real-time sync** — all users in a room see changes as you type
- **Auto-expiry** — rooms disappear after 1 hour
- **Zero accounts** — open and share, that's it
- **Dark mode** — clean, minimal, Linear-inspired design

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── not-found.tsx           # 404 page
│   ├── globals.css             # Design system + animations
│   ├── room/[code]/page.tsx    # Room page (SSR)
│   └── api/
│       └── rooms/
│           ├── route.ts        # POST: create room
│           └── [code]/route.ts # GET+PATCH: fetch/update
├── components/
│   ├── CreateRoomButton.tsx
│   ├── JoinRoomForm.tsx
│   ├── RoomEditor.tsx          # Core: realtime sync
│   ├── CopyButton.tsx
│   ├── CountdownTimer.tsx
│   └── Toast.tsx
├── lib/
│   ├── constants.ts
│   ├── utils.ts
│   └── supabase/
│       ├── client.ts           # Browser client
│       └── server.ts           # Server/API client
└── types/
    └── room.ts
```

---

## 🗄️ Supabase Setup (Free Tier — $0)

### 1. Create a free project

Go to [supabase.com](https://supabase.com) → New Project → choose a name and region.  
The **Free tier** includes:
- 500 MB database
- Unlimited API calls
- Realtime included
- No credit card required

### 2. Run the SQL schema

In the Supabase Dashboard → **SQL Editor** → run this:

```sql
-- Create the rooms table
CREATE TABLE public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  content TEXT DEFAULT '' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_rooms_code ON public.rooms (code);
CREATE INDEX idx_rooms_expires_at ON public.rooms (expires_at);

-- Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read active rooms"
  ON public.rooms FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Anyone can create rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update active rooms"
  ON public.rooms FOR UPDATE
  USING (expires_at > now());

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
```

### 3. Enable Realtime on the rooms table

Go to **Database → Replication** in your Supabase Dashboard.  
Toggle **rooms** table to enable replication.

> **Note:** Realtime Broadcast (used for live typing sync) works without this step.  
> This step enables `postgres_changes` which is a fallback. Not strictly required.

### 4. Get your API keys

Go to **Project Settings → API** and copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## ⚙️ Local Development

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- npm 9+

### Steps

```bash
# 1. Clone / navigate to project
cd RoomDrop

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your Supabase URL and anon key

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌍 Deploy to Vercel (Free)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) and it auto-deploys.

**Set environment variables in Vercel:**
1. Go to your project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## ⚡ How Real-time Works

```
User A types text
    ↓
Supabase Broadcast (WebSocket) → User B sees it instantly  (0ms DB write)
    ↓ (after 1s of no typing)
PATCH /api/rooms/[code]  →  Supabase DB (persisted)
                                    ↓
                         User C joins later → SSR fetches latest content
```

**Two layers:**
1. **Broadcast Channel** — instant WS messages, zero DB cost, per-channel isolation
2. **Debounced DB save** — persists content after 1s pause so new joiners see current text

---

## 🔒 Security

| Concern | How it's handled |
|---------|-----------------|
| Expired room access | RLS policy blocks reads/updates of expired rows |
| Invalid codes | Regex validation on client + server |
| Env key exposure | Only `NEXT_PUBLIC_` anon key exposed (safe with RLS) |
| XSS | Plain text only — no HTML rendered from content |
| Content size | Max 50,000 chars enforced in API |

---

## 🧹 Cleanup (Optional)

Expired rooms accumulate in the DB. To auto-clean them, run this in Supabase SQL Editor on a schedule (or use pg_cron):

```sql
DELETE FROM public.rooms WHERE expires_at < now();
```

Or enable **pg_cron** extension in Supabase and schedule it:

```sql
SELECT cron.schedule('cleanup-expired-rooms', '0 * * * *', 
  'DELETE FROM public.rooms WHERE expires_at < now()');
```
