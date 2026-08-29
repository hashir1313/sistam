# Product Requirements Document (PRD)

## Project Name: System (Solo Leveling Personal Growth App)
**Version:** 1.2.0  
**Status:** Implemented & Production-Ready  
**Tech Stack:** Next.js 16.3.3 (Turbopack), React 19, Neon DB (Serverless PostgreSQL), Drizzle ORM, Better Auth, Tailwind CSS v4, Bun.

---

## 1. Executive Overview

### 1.1 Problem Statement
Gamified habit trackers often require users to manually type in every task title, subtask, deadline, and category into the app. For many productivity enthusiasts, physical paper notebooks remain superior for rapid task entry, daily planning, and tactile satisfaction. However, paper notebooks lack progression visualization, long-term analytics, automated coin generation, real-life reward stores, and aesthetic sharing features.

### 1.2 Solution
The **System App** bridges paper notebooks with digital gamification. Users complete quests on paper, then log into a sleek *Solo Leveling*-styled web app to allocate earned XP to custom stats. The app automates level calculations, coin conversions, rank evaluation, streak tracking, and reward redemptions, providing an immersive, shareable "Hunter Status Window".

---

## 2. Target Audience & Core User Persona

- **The Analog Hunter**: An individual who loves writing daily tasks in a journal or notebook but wants the thrill of RPG leveling, stat tracking, real-life shop rewards, and visual status cards inspired by webtoons/anime like *Solo Leveling*.

---

## 3. Detailed Feature Specifications

### 3.1 Better Auth Gateway & User Management (FR-1)

#### Requirements:
- **Email & Password Authentication**: Powered by Better Auth with session management via cookies and Next.js server headers.
- **Sci-Fi Auth UI**: Holographic **ACCESS SYSTEM** (Sign In) and **AWAKEN HUNTER** (Sign Up) interface.
- **Session-Scoped Player Profiles**: Automatically provisions a Level 1 Rank E Hunter profile and default starter stats (`Strength`, `Intelligence`, `Discipline`, `Vitality`) upon user registration tied to `session.user.id`.

---

### 3.2 Authentic Solo Leveling STATUS Window (FR-2)

#### Requirements:
- **STATUS Header & Title Frame**:
  - Centered holographic `[ STATUS ]` header box with circuit pattern background.
  - Large numeric level display (`50 LEVEL` / `100 LEVEL`).
  - Hunter Metadata: `JOB: Shadow Monarch`, `TITLE: The One Who Overcame Adversity`.
  - Daily Streak indicator (`7d Daily Streak`).

- **Single Level XP Gauge**:
  - Prominent cyan-to-purple progress bar tracking level progression ($(\text{total\_xp\_earned} / \text{xpNextLevel}) \times 100\%$).
  - `FATIGUE: 0` indicator.

- **Attribute Matrix Grid (STR, AGI, VIT, INT, PER)**:
  - `STR`: Strength + level bonus `(+XX)`.
  - `VIT`: Vitality + level bonus `(+XX)`.
  - `AGI`: Agility + level bonus `(+XX)`.
  - `INT`: Intelligence + level bonus `(+XX)`.
  - `PER`: Perception + level bonus `(+XX)`.
  - Highlights `Available Ability Points: 0`.

- **Export Status Window**:
  - Export button generates high-resolution PNG images of the holographic Status Window for social sharing.

---

### 3.3 Manual XP Allocation & Coin Generation (FR-3)

#### Requirements:
- **Input Form**:
  - Dropdown selector for player stats (e.g., *Strength*, *Intelligence*, *Discipline*, *Vitality*).
  - Numeric input field for entering earned XP ($> 0$).
  - Dynamic Custom Stat Creator modal.

- **System Processing Logic**:
  1. **Stat Update**:
     $$\text{stat.xp\_earned} = \text{stat.xp\_earned} + \text{XP}_{\text{entered}}$$
     $$\text{stat.level} = \lfloor \sqrt{\text{stat.xp\_earned} / 10} \rfloor + 1$$
  2. **Player XP Update**:
     $$\text{player.total\_xp\_earned} = \text{player.total\_xp\_earned} + \text{XP}_{\text{entered}}$$
  3. **Coin Generation**:
     $$\text{Coins Earned} = \frac{\text{XP}_{\text{entered}}}{10}$$
     $$\text{player.coins} = \text{player.coins} + \text{Coins Earned}$$
  4. **Level-Up Trigger**:
     Evaluate level-up condition using the formula in Section 3.4.

---

### 3.4 Leveling & Rank Promotion Mechanics (FR-4)

#### Requirements:
- **Level-Up Formula**:
  The required XP to progress from level $L$ to $L+1$ is given by:

  $$\text{XP Required for Level } (L \rightarrow L+1) = L^2 \times 2$$

- **Cumulative Level Threshold**:
  A player levels up whenever their `total_xp_earned` meets or exceeds the required threshold.

- **Automated Rank Evaluation**:
  Player `rank` is automatically evaluated upon level change based on the following scale:

| Rank Badge | Level Threshold |
| :---: | :---: |
| **E** | Level 1 – 10 |
| **D** | Level 11 – 25 |
| **C** | Level 26 – 50 |
| **B** | Level 51 – 75 |
| **A** | Level 76 – 99 |
| **S** | Level 100+ |

---

### 3.5 Rewards Store & Item Management System (FR-5)

#### Requirements:
- **Reward Item Configuration & CRUD**:
  - `title`: Short title of the reward (e.g., "1 Hour Gaming Session").
  - `description`: Optional notes or rules.
  - `price`: Coin cost required to unlock (number $> 0$).
  - `capped`: Maximum allowed redemptions per period.
  - `cap_period`: `daily`, `weekly`, `monthly`, or `total`.
  - **Full Item Management**: Create, Read, Edit (via pencil icon drawer), and Delete custom rewards with real-time Neon DB persistence.

- **Redemption Validation**:
  - Checks `player.coins >= reward.price`.
  - Checks if redemptions today $< \text{reward.capped}$.
  - If valid: Deducts `reward.price` from `player.coins`, records redemption timestamp, and triggers coin sound effect.

---

## 4. Architecture & Technical Specifications

### 4.1 Database Schema (Neon DB PostgreSQL)
- **`user`**: `id`, `name`, `email`, `emailVerified` (boolean), `image`, `createdAt`, `updatedAt`.
- **`session`**: `id`, `expiresAt`, `token`, `ipAddress`, `userAgent`, `userId` (FK -> `user.id`).
- **`account`**: `id`, `accountId`, `providerId`, `userId` (FK -> `user.id`), `accessToken`, `refreshToken`, `idToken`, `accessTokenExpiresAt`, `refreshTokenExpiresAt`, `scope`, `password`, `issuer`, `createdAt`, `updatedAt`.
- **`verification`**: `id`, `identifier`, `value`, `expiresAt`, `createdAt`, `updatedAt`.
- **`player`**: `id`, `userId` (FK -> `user.id`), `avatar`, `name`, `joined`, `level`, `total_xp_earned`, `rank`, `coins`, `streak`.
- **`player_stat`**: `id`, `playerId` (FK -> `player.id`), `title`, `xp_earned`, `level`.
- **`reward`**: `id`, `userId` (FK -> `user.id`), `title`, `description`, `price`, `capped`, `cap_period`.
- **`reward_redemption`**: `id`, `playerId` (FK -> `player.id`), `rewardId` (FK -> `reward.id`), `redeemed_at`.

### 4.2 UI / UX Guidelines
- **Color Palette**: Dark Slate (`#04070E`), Neon Electric Cyan (`#06B6D4`), Glowing Purple (`#8B5CF6`), System Gold (`#F59E0B`), Emerald Health (`#10B981`).
- **Audio Effects**: Built-in sound synthesis using Web Audio API for XP allocation, level up notifications, and reward purchases.
- **Responsive Layout**: Mobile-first design with tabbed navigation for small screens.

---

## 5. Summary Matrix of Core Operations

| Feature Area | Operations | Persistence |
| :--- | :--- | :--- |
| **Authentication** | Sign Up, Sign In, Sign Out, Session Check | Better Auth + Neon DB |
| **Status Window** | Level Display, XP Gauge, Attributes, Profile Edit, PNG Export | Neon DB + `html-to-image` |
| **XP Allocator** | XP Injection, Coin Generation, Custom Stat Creation | Neon DB |
| **Reward Store** | Catalog View, Create Item, Edit Item, Delete Item, Coin Purchase | Neon DB |
