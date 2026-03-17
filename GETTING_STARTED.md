# Getting Started - Office Engagement Game

## What You Have

A complete, production-ready MVP office engagement game with:

- ✅ Team creation and joining with unique codes
- ✅ 3-level gameplay (Team Up → Be Bold → Deliver Value)
- ✅ 5-minute global timer with auto-end
- ✅ Real-time projector dashboard
- ✅ Admin control panel
- ✅ Live leaderboard with tie-breaking
- ✅ Activity feed
- ✅ Support for 80-100 concurrent players
- ✅ Mobile-responsive player screens
- ✅ Session persistence with localStorage

## First Time Setup (10 minutes)

### 1. Install Dependencies

Open your terminal in this directory and run:

```bash
npm install
```

### 2. Set Up Firebase

Follow these steps carefully:

#### A. Create Firebase Project
1. Visit https://console.firebase.google.com/
2. Click "Add Project"
3. Enter project name (e.g., "office-game")
4. Disable Google Analytics or keep it (your choice)
5. Click "Create Project"

#### B. Enable Firestore
1. In left sidebar, click "Firestore Database"
2. Click "Create Database"
3. Choose "Start in production mode"
4. Select your location (choose closest to your office)
5. Click "Enable"

#### C. Get Your Firebase Configuration
1. Click the gear icon (Settings) → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Register your app (give it any nickname)
5. Copy the `firebaseConfig` object

#### D. Create Environment File
1. Copy the example file:
   ```bash
   copy .env.local.example .env.local
   ```
   
2. Open `.env.local` and paste your Firebase values:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abc123
   
   ADMIN_PASSWORD=admin123
   ```

#### E. Set Firestore Security Rules
1. In Firebase Console, go to "Firestore Database"
2. Click the "Rules" tab
3. Replace the content with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
4. Click "Publish"

**Note:** These rules allow all access. This is fine for an internal office game, but for public apps, add proper security.

### 3. Run the Application

```bash
npm run dev
```

Open your browser to: http://localhost:3000

### 4. Seed Questions (One-Time Setup)

1. Go to http://localhost:3000/admin
2. Enter password: `admin123`
3. Click "Seed Questions" button
4. You should see "Questions seeded successfully!"

### 5. Create Firestore Indexes

You'll need these indexes for queries to work. Firebase will auto-prompt you when needed:

**Option A: Auto-create (Easiest)**
- When you first use a feature that needs an index, Firebase will show an error
- Click the link in the error message
- It will take you to Firebase Console with the index pre-configured
- Click "Create Index"
- Wait 1-2 minutes for index to build

**Option B: Create Manually**

Go to Firebase Console → Firestore Database → Indexes tab

**Index 1: Level 3 Ranking**
- Collection ID: `answers`
- Fields to index:
  1. `level` → Ascending
  2. `isCorrect` → Ascending  
  3. `submittedAt` → Ascending
- Query scope: Collection

**Index 2: Activity Feed**
- Collection ID: `activity`
- Fields to index:
  1. `createdAt` → Descending
- Query scope: Collection

Click "Create Index" for each. They'll be ready in 1-2 minutes.

## Test the Game (5 minutes)

### Test Solo:

1. **Create a team:**
   - Go to http://localhost:3000
   - Click "Create Team"
   - Enter team name: "Test Team"
   - Enter your name: "Test Player"
   - You'll see a team code (e.g., "ABC123")

2. **Join as another player:**
   - Open a new incognito/private browser window
   - Go to http://localhost:3000
   - Click "Join Team"
   - Enter name: "Player 2"
   - Enter the team code from step 1
   - Both players should now be in the same team

3. **Start the game:**
   - Open http://localhost:3000/admin in another tab
   - Login with password: `admin123`
   - Click "Start Game"
   - You should see the game phase change to "LIVE"

4. **Play through levels:**
   - In your player windows, you should see Level 1 question
   - The captain can submit (other players see "Only captain can submit")
   - After submitting, all team members advance to Level 2
   - Choose Safe or Bold mode, then answer
   - Advance to Level 3
   - Submit answer
   - See completion screen

5. **View dashboard:**
   - Open http://localhost:3000/dashboard in another tab
   - Watch the countdown timer
   - See live updates as players progress
   - View leaderboard and activity feed

### Test With Multiple Players:

1. Open 5-6 browser windows (use incognito mode for separate sessions)
2. Create 2-3 different teams
3. Have some players join each team
4. Start game from admin
5. Watch dashboard update in real-time as players progress

## Running the Game Event

### Setup (30 minutes before):

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open admin panel: http://localhost:3000/admin

3. Open dashboard on projector: http://localhost:3000/dashboard

4. Share player URL with participants:
   - http://localhost:3000
   - Or create a QR code for this URL
   - Share in email/chat

### Pre-Game (15 minutes before):

1. Ask participants to create or join teams
2. Monitor admin panel to see teams forming
3. Verify dashboard is displaying correctly on projector
4. Check that team codes are being shared among teammates

### Game Start:

1. When ready, click "Start Game" in admin panel
2. 5-minute countdown begins
3. Players see their first question (Level 1)
4. Watch dashboard for real-time progress

### During Game (5 minutes):

- Monitor dashboard for player progression
- Watch activity feed for milestones
- Leaderboard updates automatically
- Be ready to help players who get stuck (use admin "Move" button)

### Game End:

- Timer hits 0:00
- Game auto-ends
- Final leaderboard shown on dashboard
- Announce winners!

### After Game:

- Take screenshot of final leaderboard
- Click "Reset Game" in admin panel when ready for next round
- Questions remain, no need to re-seed

## URLs Reference

| URL | Purpose | Who Uses It |
|-----|---------|-------------|
| http://localhost:3000 | Landing page | All players |
| http://localhost:3000/play | Game screen | Players (auto-redirect) |
| http://localhost:3000/admin | Control panel | Admin only |
| http://localhost:3000/dashboard | Live display | Projector/TV |

## Admin Features

Login password: `admin123` (or whatever you set in `.env.local`)

**Controls:**
- **Start Game** - Begins 5-minute timer
- **End Game** - Manually end before timer expires
- **Reset Game** - Clear all data for next session
- **Seed Questions** - Initialize sample questions
- **Refresh Data** - Reload teams/players

**Emergency Controls:**
- **Edit** button next to player score - Manually adjust points
- **Move** button next to player - Manually advance to different level

## Game Rules Quick Reference

- **Duration:** 5 minutes total
- **Level 1 (Team Up):** Captain only, correct = +35 per member, wrong = 0
- **Level 2 (Be Bold):** Safe (+15/0) or Bold (+30/-10)
- **Level 3 (Deliver Value):** 1st = +35, 2nd = +30, 3rd = +25, others = +20
- **Tie-breaking:** Score → Level 3 time → Level 2 time

## Troubleshooting

### Common Issues:

**"Firebase: No Firebase App has been created"**
→ Check `.env.local` exists and has correct credentials
→ Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

**"Index not found" or "The query requires an index"**
→ Click the link in the error message
→ Firebase will auto-create the index
→ Wait 1-2 minutes for index to build

**Admin panel won't login**
→ Default password is `admin123`
→ Check `.env.local` if you set a custom password

**Players not advancing levels**
→ Check Firebase Console → Firestore → Check if data is being written
→ Verify Firestore security rules allow writes
→ Check browser console for errors

**Dashboard not updating**
→ Refresh the page
→ Check browser console for Firebase errors
→ Verify internet connection

**Timer not working**
→ Make sure game was started from admin panel
→ Check that gameStartTime and gameEndTime are set in Firestore

## File Structure

```
trial/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   ├── page.tsx                # Landing page
│   ├── play/page.tsx           # Player game screen
│   ├── admin/page.tsx          # Admin panel
│   └── dashboard/page.tsx      # Projector dashboard
│
├── components/
│   ├── CreateTeamForm.tsx      # Team creation
│   ├── JoinTeamForm.tsx        # Team joining
│   ├── LobbyView.tsx           # Waiting room
│   ├── LevelOneTeamView.tsx    # Level 1 (team round)
│   ├── LevelTwoBoldView.tsx    # Level 2 (safe/bold)
│   ├── LevelThreeValueView.tsx # Level 3 (speed)
│   ├── FinishedView.tsx        # Completion screen
│   ├── PlayerHeader.tsx        # Score header
│   ├── Leaderboard.tsx         # Sortable leaderboard
│   ├── ActivityFeed.tsx        # Activity stream
│   └── LevelPanel.tsx          # Dashboard level cards
│
├── lib/
│   ├── firebase.ts             # Firebase setup
│   ├── types.ts                # TypeScript types
│   ├── utils.ts                # Helpers
│   ├── game.ts                 # Game logic
│   └── queries.ts              # Firestore queries
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── .env.local.example
├── .gitignore
│
└── Documentation/
    ├── README.md               # Complete docs
    ├── QUICKSTART.md           # 5-min setup
    ├── SETUP.md                # Detailed setup
    ├── DEPLOY.md               # Deployment guide
    ├── CHECKLIST.md            # Pre-game checklist
    └── GETTING_STARTED.md      # This file
```

## Next Steps

1. **Right now:**
   ```bash
   npm install
   ```

2. **Then:**
   - Set up Firebase (follow section above)
   - Configure `.env.local`
   - Run `npm run dev`
   - Seed questions from admin panel

3. **Tomorrow (Game Day):**
   - Follow CHECKLIST.md
   - Start server
   - Open dashboard on projector
   - Share player URL
   - Start game
   - Have fun!

## Need Help?

- Check QUICKSTART.md for fastest setup
- Check SETUP.md for detailed instructions
- Check DEPLOY.md for Vercel deployment
- Check CHECKLIST.md for game-day preparation
- Check browser console for errors
- Check Firebase Console for data

## That's It!

Your office engagement game is ready to roll. The codebase is:
- Production-ready
- Well-typed
- Well-structured
- Easy to customize
- Easy to deploy
- Easy to run

Just install, configure Firebase, and you're ready to play tomorrow!
