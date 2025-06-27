# 🎨 Pictogram

**Pictogram** is an open-source social media application that aims to simplify the combination of drawing and posting on an outlet that others can view. This project started as an idea after sudden nostalgia for Wiiverse, a social hub that is stuck on Nintendo's WiiU. With this in mind, my goal isn't necessarily to make a cutting edge canvas, but something as simple or simpler than Microsoft's Paint, while also having a frontend design similar to that of Reddit (with communities planned to be created on).
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
- Infinite scrolling support

### 👤 Profile Page
- Edit and save your profile
- Post deletion for owned content

### 🔐 Authentication & Security
- Sign up, Login, Logout
- JWT-based Authentication
- Email verification
- Password reset via email

---

## 🚀 Planned Features
- Profile pictures
- View other users’ profiles
- Post zoom-in modal
- Click a post to navigate to its author
- Community creation and interaction
- Likes / reactions
- Redis caching
- Rate limiting
- Password reset *while signed in*

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
