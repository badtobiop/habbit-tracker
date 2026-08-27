# 🥷 Anime-Themed Habit Tracker

An interactive, gamified Anime-themed Habit Tracker web application built with **Next.js 14**, **Tailwind CSS**, and **SQLite**. Level up your real-life productivity like an anime protagonist!

---

## ✨ Features

- 🎮 **Gamification & XP Engine**: Earn XP, level up, and unlock achievements as you build daily habits.
- 🗡️ **Anime Aesthetics & Themes**: Dark-mode anime visual style with GSAP animations, particle effects, and companion characters.
- 📊 **Detailed Analytics & Calendar**: Track your streaks, completion rates, and historical performance with intuitive calendars and graphs.
- 🏆 **Badges & Achievements**: Unlock tiered badges and milestone rewards.
- 🔐 **Authentication & Security**: Secure cookie-based authentication with bcrypt hashing.
- 💳 **Payment & Pro Tiers**: Integrated Razorpay checkout flow with promo code support.
- ⚙️ **Admin Dashboard**: Manage users, streaks, giveaways, and view global stats.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [GSAP](https://greensock.com/gsap/) + Canvas Particles
- **Database:** SQLite (`better-sqlite3`)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/badtobiop/habbit-tracker.git
   cd habbit-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   JWT_SECRET=your_jwt_secret_key
   # Razorpay credentials (if payment testing is needed)
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   # Mailer credentials (optional)
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_password
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License

This project is licensed under the MIT License.
