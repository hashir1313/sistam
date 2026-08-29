# Product Requirements Document (PRD)

## Project Name: System (Solo Leveling Personal Growth App)
**Version:** 1.0.0  
**Status:** Draft / Ready for Development  

---

## 1. Executive Overview

### 1.1 Problem Statement
Gamified habit trackers often require users to manually type in every task title, subtask, deadline, and category into the app. For many productivity enthusiasts, physical paper notebooks remain superior for rapid task entry, daily planning, and tactile satisfaction. However, paper notebooks lack progression visualization, long-term analytics, automated coin generation, real-life reward stores, and aesthetic sharing features.

### 1.2 Solution
The **System App** bridges paper notebooks with digital gamification. Users complete quests on paper, then log into a sleek *Solo Leveling*-styled web/mobile app to allocate earned XP to custom stats. The app automates level calculations, coin conversions, rank evaluation, streak tracking, and reward redemptions, providing an immersive, shareable "Hunter Status Window".

---

## 2. Target Audience & Core User Persona

- **The Analog Hunter**: An individual who loves writing daily tasks in a journal or notebook but wants the thrill of RPG leveling, stat tracking, real-life shop rewards, and visual status cards inspired by webtoons/anime like *Solo Leveling*.

---

## 3. Detailed Feature Specifications

### 3.1 Player Profile & Shareable Player Card (FR-1)

#### Requirements:
- **Profile Display**:
  - Display player `avatar` (image preview/upload).
  - Display `name` (text).
  - Display `joined` date (formatted string, e.g., "Aug 28, 2026").
  - Display current `level` (positive integer).
  - Display `total_xp_earned` (number).
  - Display `rank` badge (Selection from: `E`, `D`, `C`, `B`, `A`, `S`).
  - Display current `streak` count (days logged consecutively).
  - Display available `coins` balance.

- **Shareable Player Card Generator**:
  - Render a high-contrast futuristic card component showcasing all key profile parameters (`avatar`, `name`, `joined`, `level`, `total_xp_earned`, `rank`, `streak`, and top stats).
  - Provide an export button to generate an image file (PNG / JPEG) or copy to clipboard for social sharing.

---

### 3.2 Manual XP Allocation & Coin Generation (FR-2)

#### Requirements:
- **Input Form**:
  - Dropdown selector for player stats (e.g., *Strength*, *Intelligence*, *Discipline*, *Vitality*).
  - Numeric input field for entering earned XP (must be a positive number $> 0$).
  - Option to create a new stat dynamically (with title).

- **System Processing Logic**:
  1. **Stat Update**:
     $$\text{stat.xp\_earned} = \text{stat.xp\_earned} + \text{XP}_{\text{entered}}$$
     $$\text{stat.level} = \lfloor \sqrt{\text{stat.xp\_earned} / 10} \rfloor + 1 \quad (\text{or custom stat progression})$$
  2. **Player XP Update**:
     $$\text{player.total\_xp\_earned} = \text{player.total\_xp\_earned} + \text{XP}_{\text{entered}}$$
  3. **Coin Generation**:
     $$\text{Coins Earned} = \frac{\text{XP}_{\text{entered}}}{10}$$
     $$\text{player.coins} = \text{player.coins} + \text{Coins Earned}$$
  4. **Level-Up Trigger**:
     Evaluate level-up condition using the formula in Section 3.3.

---

### 3.3 Leveling & Rank Promotion Mechanics (FR-3)

#### Requirements:
- **Level-Up Formula**:
  The required XP to progress from level $L$ to $L+1$ is given by:

  $$\text{XP Required for Level } (L \rightarrow L+1) = L^2 \times 2$$

- **Cumulative Level Threshold**:
  A player levels up whenever their `total_xp_earned` meets or exceeds the required threshold.

  *Example Calculation:*
  - Level 30 requirement: $30^2 \times 2 = 1,800\text{ XP}$.
  - If current level is 30 and `total_xp_earned` reaches the threshold required for level 31, `player.level` updates to 31.
  - Multi-level jump support: If a massive XP entry satisfies multiple level thresholds simultaneously, `player.level` increments accordingly.

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

### 3.4 Rewards Store & Redemption System (FR-4)

#### Requirements:
- **Reward Configuration**:
  - `title`: Short title of the reward (e.g., "1 Hour Gaming Session").
  - `description`: Detailed notes or rules.
  - `price`: Coin cost required to unlock (number $> 0$).
  - `capped`: Maximum allowed redemptions within a rolling period (e.g., max 1 per day, 3 per week).

- **Redemption Validation**:
  - Check if `player.coins >= reward.price`.
  - Check if usage count within the specified window $< \text{reward.capped}$.
  - If valid:
    - Deduct `reward.price` from `player.coins`.
    - Log redemption timestamp into transaction log.
    - Show success toast/modal ("Reward Redeemed! Enjoy your reward.").
  - If invalid:
    - Disable purchase button and show warning message (e.g., "Insufficient System Coins" or "Cap Reached for Today").

---

### 3.5 Streak Tracking System (FR-5)

#### Requirements:
- Increments `streak` by $+1$ if XP is logged on a consecutive calendar day.
- Preserves `streak` if XP was already logged today.
- Resets `streak` to $1$ if a calendar day is missed without XP logging.

---

## 4. Technical & Non-Functional Requirements

### 4.1 UI / UX Guidelines
- **Color Palette**: Dark Theme (`#0A0D14`), Neon Electric Blue (`#00F0FF`), Glowing Purple (`#8A2BE2`), Warning Gold (`#FFD700`).
- **Sound & Haptics (Optional/Configurable)**: System chime sound effect on Level Up and Reward Purchase.
- **Responsive Layout**: Mobile-first design optimized for smartphone viewing and card sharing.

### 4.2 Security & Data Integrity
- Validate input bounds (prevent negative XP or invalid level values).
- Atomic database updates for coins and total XP calculations to avoid race conditions.

---

## 5. Summary Matrix of Data Fields & Operations

| Entity | Field | Type | Validation / Logic |
| :--- | :--- | :--- | :--- |
| **Player** | `avatar` | Image URL / Base64 | Valid image link or default asset |
| | `name` | String | Non-empty string |
| | `joined` | Date | System timestamp upon account creation |
| | `level` | Positive Number | Starts at 1, updated via formula $L^2 \times 2$ |
| | `total_xp_earned` | Number | Starts at 0, updated by adding entered XP |
| | `rank` | Enum (`E`,`D`,`C`,`B`,`A`,`S`) | Auto-updated based on `level` |
| | `coins` | Number | Updated via $\text{XP} / 10$, deducted on shop purchase |
| | `streak` | Number | Integer counter based on daily log activity |
| | `stats` | Array of Stat Objects | List of user stats with `title`, `xp_earned`, `level` |
| **Reward** | `title` | String | Non-empty text |
| | `description` | String | Optional description text |
| | `price` | Number | Cost in coins ($> 0$) |
| | `capped` | Number | Maximum usage cap per period |
