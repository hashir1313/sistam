<div align="center">

# SISTAM

### *Rise. Level up your real life.*

A gamified personal growth app inspired by [Solo Leveling](https://en.wikipedia.org/wiki/Solo_Leveling). Complete real-world quests on paper, log XP digitally, level up your hunter rank, earn System Coins, and buy real-life rewards.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## About

**SISTAM** bridges the gap between physical paper notebooks and digital gamification:

1. **Execute quests** on paper (workouts, reading, chores, coding)
2. **Log into the app** and allocate earned XP to your character stats
3. **Level up** your hunter rank from E to S
4. **Earn System Coins** and spend them on real-world rewards
5. **Export your Player Card** as a shareable image

## Features

- **STATUS Window** -- Cyberpunk HUD showing level, rank, XP gauge, and attribute matrix (STR, VIT, AGI, INT, PER)
- **XP Allocation Engine** -- Manually enter XP for stats; coins auto-generated at XP/10 ratio
- **Leveling System** -- Quadratic XP formula (`level^2 * 2`), automated rank promotion (E > D > C > B > A > S)
- **Reward Store** -- Custom shop where coins buy real-world rewards with usage caps
- **Player Card Export** -- Generate a downloadable PNG of your holographic status window
- **Sound Effects** -- Synthesized sci-fi blips and level-up fanfares via Web Audio API
- **Offline Fallback** -- Gracefully degrades to localStorage when the database is unavailable

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| UI | React 19 + Tailwind CSS 3.4 |
| Animation | Framer Motion |
| Database | Neon DB (Serverless PostgreSQL) |
| ORM | Drizzle ORM |
| Auth | Better Auth |
| Mobile | Capacitor 7 (Android) |

## Getting Started

```bash
# Clone
git clone https://github.com/hashir1313/sistam.git
cd sistam

# Install
bun install

# Setup env
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and BETTER_AUTH_SECRET

# Run
bun run dev
```

## License

[MIT](LICENSE)

---

<div align="center">

*Built with Next.js, Tailwind CSS, and a love for Solo Leveling*

</div>
