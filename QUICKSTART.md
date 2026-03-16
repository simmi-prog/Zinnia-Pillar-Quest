# Quick Start Guide

Get the game running in 5 minutes.

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

## Step 2: Firebase Setup (2 min)

1. **Create Firebase Project:**
   - Go to https://console.firebase.google.com/
   - Click "Add Project" → Enter name → Create

2. **Enable Firestore:**
   - Click "Firestore Database" → "Create Database"
   - Select "Production Mode" → Choose location → Enable

3. **Get Config:**
   - Click gear icon → Project Settings
   - Scroll to "Your apps" → Click web icon `</>`
   - Copy the config object

4. **Add to Environment:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Paste your Firebase values into `.env.local`

5. **Set Firestore Rules:**
   - Go to Firestore → Rules tab
   - Paste this and publish:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

## Step 3: Run the App (30 sec)

```bash
npm run dev
```

Open http://localhost:3000

## Step 4: Initialize Game (30 sec)

1. Go to http://localhost:3000/admin
2. Login (password: `admin123`)
3. Click **"Seed Questions"** button
4. Done!

## Step 5: Play the Game

### Create Teams:
1. Open http://localhost:3000
2. Click "Create Team"
3. Enter team name and your name
4. Share the team code with teammates

### Join Teams:
1. Open http://localhost:3000
2. Click "Join Team"
3. Enter your name and team code

### Start Game:
1. Admin goes to http://localhost:3000/admin
2. Clicks "Start Game"
3. 5-minute timer begins

### View Dashboard:
Open http://localhost:3000/dashboard on projector

## Firestore Indexes

When you first play, Firebase may show index errors. Click the error link to auto-create indexes, or create manually:

### Index 1: Level 3 Ranking
- Collection: `answers`
- Fields: `level` (Asc), `isCorrect` (Asc), `submittedAt` (Asc)

### Index 2: Activity Feed
- Collection: `activity`  
- Fields: `createdAt` (Desc)

## Testing Multi-Player

1. Open multiple browser windows (use incognito for separate sessions)
2. Create different teams
3. Start game from admin
4. Play simultaneously

## URLs

- **Players:** http://localhost:3000
- **Admin:** http://localhost:3000/admin (password: admin123)
- **Dashboard:** http://localhost:3000/dashboard

## Common Issues

**"Firebase app not initialized"**
→ Check `.env.local` has correct Firebase credentials

**"Missing index"**
→ Click the error link to create index automatically

**Admin page not working**
→ Default password is `admin123`

**Players not advancing**
→ Check Firebase Console for data, verify Firestore rules allow writes

## Deploy to Vercel

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push

# Then on Vercel
# 1. Import repository
# 2. Add environment variables
# 3. Deploy
```

Done!
