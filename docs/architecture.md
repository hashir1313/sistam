# System Architecture Specification

**Document Name:** `architecture.md`  
**Application Name:** Solo Leveling System App  
**Target Platforms:** Web (Next.js PWA) & Android (Capacitor Native Shell)  

---

## 1. High-Level System Architecture

```mermaid
graph TD
    subgraph Client Layer
        A[Web Browser / PWA] -->|React / Tailwind UI| C[Next.js App Router]
        B[Android App - Capacitor Shell] -->|Native WebView| C
    end

    subgraph Application & Business Logic
        C --> D[Better Auth Engine]
        C --> E[Stat & XP Allocation Engine]
        C --> F[Leveling & Rank Evaluator]
        C --> G[Reward Store & Capping Engine]
        C --> H[Player Card Canvas Generator]
    end

    subgraph Data & ORM Layer
        D --> I[Drizzle ORM Driver]
        E --> I
        F --> I
        G --> I
        I -->|Serverless HTTP Connection| J[(Neon DB PostgreSQL)]
    end
```

---

## 2. Technology Stack & Component Responsibilities

| Tier / Layer | Technology | Primary Function |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14+ (App Router, TypeScript) | Page routing, server-rendered components, client state management |
| **UI & Styling** | Tailwind CSS + Framer Motion | Cyberpunk dark HUD UI, glowing badges, level-up animations |
| **Mobile Runtime** | Capacitor (`@capacitor/core`, `@capacitor/android`) | Android APK packaging, native haptics, local notifications |
| **Authentication** | Better Auth (`better-auth`) | Email/password & OAuth authentication, session management |
| **Database** | Serverless PostgreSQL (Neon DB) | Cloud database for players, stats, rewards, and auth data |
| **ORM** | Drizzle ORM | Type-safe SQL queries, migrations, and schema management |
| **Card Export** | `html-to-image` / HTML5 Canvas | Converts Player Card DOM component into downloadable PNG |

---

## 3. Directory & Module Architecture

```
g:/Projects/sistam/
├── android/                   # Capacitor generated native Android studio project
├── public/                    # Static assets (avatars, sound effects, system badges)
├── src/
│   ├── app/                   # Next.js App Router pages & API routes
│   │   ├── (auth)/            # Auth routes (login, register)
│   │   ├── api/
│   │   │   ├── auth/[...all]/ # Better Auth API route handler
│   │   │   └── player/        # API endpoints for player stats & actions
│   │   ├── dashboard/         # Main System HUD dashboard
│   │   ├── store/             # Real-world Reward Store page
│   │   ├── layout.tsx         # Global root layout with theme providers
│   │   └── page.tsx           # Landing page / Hunter status view
│   ├── components/            # UI Components
│   │   ├── PlayerCard.tsx     # Shareable Hunter Status Card
│   │   ├── StatAllocator.tsx  # Form to manually add XP to stats
│   │   ├── LevelUpModal.tsx   # Animated Solo Leveling level-up popup
│   │   ├── RewardStore.tsx    # Shop catalog & purchase modal
│   │   └── ui/                # Base Shadcn / custom UI elements
│   ├── db/                    # Database configuration
│   │   ├── index.ts           # Neon DB connection initialization
│   │   └── schema.ts          # Drizzle ORM tables & relations
│   ├── lib/                   # Utility functions & shared logic
│   │   ├── auth.ts            # Better Auth client/server setup
│   │   ├── formulas.ts        # Leveling (L^2 * 2) & Coin (XP/10) formulas
│   │   └── rank.ts            # Hunter Rank calculation rules (E to S)
│   └── types/                 # Global TypeScript definitions
├── capacitor.config.json      # Capacitor native configuration file
├── drizzle.config.ts          # Drizzle Kit migration configuration
├── tailwind.config.js         # Tailwind theme & color definitions
├── PRD.md                     # Product Requirements Document
├── concept.md                 # Concept & Design Philosophy
├── databse.md                 # Database Architecture & Schemas
└── architecture.md            # System Architecture (This file)
```

---

## 4. Key Data Flows & Logic Pipelines

### 4.1 Manual XP Entry & Leveling Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Hunter as Player (User)
    participant UI as StatAllocator Component
    participant Formula as Formulas Engine
    participant API as Next.js Server Action
    participant DB as Neon DB (Drizzle)
    participant Modal as LevelUpModal

    Hunter->>UI: Select Stat ("Strength") & Input XP (e.g. 150 XP)
    UI->>Formula: Calculate Coins = 150 / 10 = 15 Coins
    UI->>API: Execute addXpAction({ statId, xp: 150, coins: 15 })
    API->>DB: Atomic Transaction: $inc stat.xp, total_xp_earned, coins
    DB-->>API: Return Updated Player Data
    API->>Formula: Evaluate total_xp_earned >= (level^2 * 2)
    alt Level Up Condition Met (e.g., Level 30 -> 31)
        Formula-->>API: Level Up Triggered! New Level: 31, New Rank: D
        API->>DB: Update player.level = 31, player.rank = 'D'
        API-->>UI: Return Level Up Payload
        UI->>Modal: Trigger Level Up Announcement & Haptic Effect
    else Threshold Not Met
        API-->>UI: Return Success Payload
    end
    UI->>Hunter: Refresh HUD Dashboard & Play Sound Chime
```

---

### 4.2 Reward Purchase & Capping Flow

```mermaid
flowchart TD
    A[Player Clicks Buy Reward] --> B{Check player.coins >= reward.price}
    B -- No --> C[Display 'Insufficient System Coins']
    B -- Yes --> D{Check Usage Count < reward.capped}
    D -- No --> E[Display 'Cap Limit Reached for Today/Period']
    D -- Yes --> F[Execute Purchase Transaction]
    F --> G[Deduct reward.price from player.coins]
    F --> H[Insert record in reward_redemption]
    G --> I[Show Reward Unlocked Modal]
    H --> I
```

---

## 5. Mobile Packaging Architecture (Capacitor)

### 5.1 Web to Native Android Bridge
- Next.js builds static or server-handled web bundle (`out` directory or static export).
- **Capacitor Android Shell** embeds the web application inside a native Chrome WebView instance.
- **Native Plugin Integration**:
  - `@capacitor/haptics`: Vibrates phone during Level Up modal triggers.
  - `@capacitor/local-notifications`: Reminds user to complete and log physical notebook quests.
  - `@capacitor/share`: Shares generated Player Card image natively via Android Share Sheet (WhatsApp, Instagram, Telegram).

---

## 6. Deployment & Environment Pipeline

```mermaid
graph LR
    subgraph Source Code
        A[Git Repository]
    end

    subgraph Cloud Backend
        B[Vercel / Next.js Web Deployment]
        C[(Neon DB Serverless PostgreSQL)]
    end

    subgraph Native Mobile Build
        D[Capacitor Sync Engine]
        E[Android Studio / Gradle]
        F[Android APK / AAB Bundle]
    end

    A -->|Push Main Branch| B
    B <-->|Drizzle HTTP Driver| C
    A -->|npx cap sync| D
    D --> E
    E --> F
```

### Build Commands:
- **Run Web Dev**: `npm run dev`
- **Database Push**: `npx drizzle-kit push`
- **Build Web**: `npm run build`
- **Sync to Android**: `npx cap sync android`
- **Open Android Studio**: `npx cap open android`
