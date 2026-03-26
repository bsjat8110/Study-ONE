# Study-ONE 🚀  
**The Premium AI-Powered Learning Management OS**

![Study-ONE Banner](https://raw.githubusercontent.com/bsjat8110/Study-ONE/main/public/banner.png) <!-- Replace with your actual banner if available -->

Study-ONE is a state-of-the-art learning platform designed for modern students and institutes. Built with **Next.js 15**, **Prisma 7**, and **Gemini 3.1 AI**, it delivers a seamless, high-performance experience with intelligent features at its core.

---

## ✨ Key Features

### 🤖 Intelligent AI Tutor (Gemini 3.1)
- **Real-time AI Guidance**: Instant academic support powered by Google Gemini 3.1 Flash Lite.
- **Bilingual Interface**: Seamlessly switch between **Hindi (हिं)** and **English (EN)** for a personalized learning experience.
- **Token Rate Limiting**: Built-in 100k daily token management to ensure fair usage and cost-efficiency.
- **Fit-Screen UI**: Premium, responsive chat interface optimized for mobile and desktop.

### 📚 Course Management
- **Dashboard Recovery**: Optimized data serialization for lightning-fast dashboard loads.
- **Enrollment Flow**: Smooth student-to-course mapping with secure payment integration.
- **Prisma 7 Optimized**: High-efficiency database queries using the latest Prisma ORM and driver adapters.

### 🎨 Premium Aesthetics
- **Pro-UI Design**: Sleek dark-mode aesthetic with glassmorphism and smooth animations (Framer Motion).
- **Enterprise-Grade**: Designed to look and feel like a high-end SaaS product.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Database**: [Neon (PostgreSQL)](https://neon.tech/)
- **ORM**: [Prisma 7](https://www.prisma.io/)
- **AI**: [Google Gemini 3.1 AI](https://aistudio.google.com/)
- **Auth**: [NextAuth.js v5](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Payments**: [Razorpay](https://razorpay.com/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL (Neon recommended)
- Gemini API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bsjat8110/Study-ONE.git
   cd Study-ONE
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="your_pooled_db_url"
   DIRECT_URL="your_direct_db_url"
   GEMINI_API_KEY="your_api_key"
   GEMINI_MODEL="gemini-3.1-flash-lite-preview"
   AUTH_SECRET="your_secret"
   NEXTAUTH_URL="http://localhost:3000"
   RAZORPAY_KEY_ID="your_razorpay_id"
   RAZORPAY_KEY_SECRET="your_razorpay_secret"
   ```

4. **Synchronize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

---

## ☁️ Vercel Deployment

Study-ONE is fully optimized for Vercel.

1. Connect your GitHub repository to Vercel.
2. Add all environment variables from your `.env` file.
3. Use the following build command if needed: `PRISMA_CLIENT_ENGINE_TYPE=library next build`.
4. Deploy! 🚀

---

## 📄 License
This project is private and owned by **Study-ONE Team**. All rights reserved.

---
*Built with ❤️ for better learning.*
