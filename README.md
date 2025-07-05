# 🎨 Pictogram

**Pictogram** is an open-source social media application that merges my interests in social media sites and drawing. This project started as an idea branching from the Wiiverse, a social hub that is stuck on Nintendo's WiiU. With this in mind, my goal is to make a simple way of drawing pictures, while also having a frontend design similar to that of Reddit (with communities planned to be created later on).
---

## 🛠️ Tech Stack

- **Backend:** Spring Boot (Java)
- **Frontend:** Next.js (TypeScript) + React.js
- **Authentication:** JWT
- **Database:** PostgreSQL (recommended)
- **Email:** SMTP for verification & password resets

---

## ✨ Features

### 🖌️ Drawing
- Simple canvas tool
- Undo / Redo functionality
- Post your drawings

### 🗂️ Posts Dashboard
- View the **most recent post** from every user
- View other users’ profiles
- Post zoom-in modal
- Click a post to navigate to its author
- Infinite scrolling support

### 👤 Profile Page
- Edit and save your profile
- Post deletion for owned content
- Profile pictures

### 🔐 Authentication & Security
- Sign up, Login, Logout
- JWT-based Authentication
- Email verification
- Password reset via email

---

## 🚀 Planned Features
- Redis caching
- Rate limiting
- Community creation and interaction
- Likes / reactions
---

## 🧑‍💻 Local Development Setup

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL (running locally or in Docker)
- SMTP credentials (for email features)

### Backend (Spring Boot)

```bash
./gradlew bootRun
```

## Frontend (Next.js)
```bash
npm install
npm run dev
```
