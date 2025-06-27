# 🎨 Pictogram

**Pictogram** is an open-source social media platform centered around *drawing and sharing*. Inspired by the nostalgic charm of **Miiverse** on the Wii U, this project revives the joy of casual sketching and community interaction.

Rather than being a cutting-edge canvas tool, Pictogram aims for simplicity—think of a lightweight version of MS Paint—wrapped in a Reddit-style UI, with plans for community support in the future.

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
