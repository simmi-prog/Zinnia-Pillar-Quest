# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Firebase Setup

### Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add Project"
3. Enter project name (e.g., "office-game")
4. Disable Google Analytics (optional)
5. Click "Create Project"

### Enable Firestore

1. In the Firebase Console, click "Firestore Database" in the left menu
2. Click "Create Database"
3. Select "Start in Production Mode"
4. Choose your location
5. Click "Enable"

### Get Firebase Config

1. In Firebase Console, click the gear icon > Project Settings
2. Scroll to "Your apps" section
3. Click the web icon `</>`
4. Register your app (name it anything)
5. Copy the config values

### Configure App

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Paste your Firebase values into `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=office-game.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=office-game
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=office-game.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
   
   ADMIN_PASSWORD=admin123
   ```

### Set Firestore Rules

1. In Firebase Console, go to Firestore Database > Rules
2. Replace with:
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
3. Click "Publish"

**Note:** These rules allow anyone to read/write. For a real production app, add proper security rules.

## 3. Run the App

```bash
npm run dev
```

Open http://localhost:3000

## 4. Initial Setup (First Time Only)

1. Go to http://localhost:3000/admin
2. Login with password: `admin123` (or whatever you set in `.env.local`)
3. Click "Seed Questions" to create sample questions
4. You're ready to play!

## 5. Firestore Indexes

When you first use certain features, Firebase may prompt you to create indexes. Click the link in the error message or create manually:

### Create these indexes in Firebase Console > Firestore > Indexes:

1. **For Level 3 Ranking:**
   - Collection: `answers`
   - Fields to index:
     - `level` (Ascending)
     - `isCorrect` (Ascending)
     - `submittedAt` (Ascending)
   - Query scope: Collection

2. **For Activity Feed:**
   - Collection: `activity`
   - Fields to index:
     - `createdAt` (Descending)
   - Query scope: Collection

Firebase will also auto-generate index creation links when you encounter errors.

## 6. Play the Game

### For Players:

1. Go to http://localhost:3000
2. Either:
   - **Create Team:** Enter team name and your name
   - **Join Team:** Enter your name and team code
3. Wait in lobby for admin to start game
4. Play through 3 levels
5. View your final score

### For Admin:

1. Go to http://localhost:3000/admin
2. Login with admin password
3. Wait for teams to form
4. Click "Start Game" when ready
5. Monitor progress
6. Game auto-ends after 5 minutes

### For Dashboard (Projector):

1. Open http://localhost:3000/dashboard on projector/large screen
2. Shows live updates:
   - Countdown timer
   - Player progress
   - Leaderboard
   - Activity feed

## Testing Locally

### Test with Multiple Players

1. Open multiple browser windows/tabs (or use incognito)
2. Create different teams in each
3. Join from different browsers
4. Start game from admin panel
5. Play through levels in each window

### Test Game Flow

1. Create 2-3 teams with 2-3 players each
2. Start game from admin
3. Captain submits Level 1 answer
4. All team members advance to Level 2
5. Each player chooses Safe/Bold and submits
6. Each player submits Level 3 answer
7. Check leaderboard for correct ranking

## Deploy to Vercel

1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables (all the NEXT_PUBLIC_FIREBASE_* values)
6. Click "Deploy"

Your app will be live at `https://your-app.vercel.app`

## Customization

### Change Game Duration

Edit `lib/game.ts`, find `startGame()` function:

```typescript
const gameEndTime = Timestamp.fromMillis(gameStartTime.toMillis() + 5 * 60 * 1000);
```

Change `5 * 60 * 1000` (5 minutes) to your desired duration.

### Modify Questions

Use Firebase Console or update `seedQuestions()` in `lib/game.ts`:

```typescript
{
  level: 1,
  prompt: "Your question here?",
  options: ["Option A", "Option B", "Option C", "Option D"],
  correctOption: "Option B",
}
```

### Adjust Scoring

Edit scoring logic in `lib/game.ts`:
- `submitLevel1()` - Team scoring
- `submitLevel2()` - Safe/Bold scoring
- `submitLevel3()` - Speed-based ranking

## Troubleshooting

### "Firebase: No Firebase App has been created"

Make sure `.env.local` exists and contains valid Firebase credentials.

### "Missing or insufficient permissions"

Update Firestore security rules to allow read/write access.

### "Index not found" error

Click the link in the error message to auto-create the index, or create manually in Firebase Console.

### Players not seeing updates

Check that:
- Firebase real-time listeners are set up correctly
- Network tab shows successful Firebase connections
- Firestore rules allow read access

### Game timer not working

- Timer uses server timestamps, not client time
- Ensure Firebase is properly initialized
- Check browser console for errors

## Production Checklist

Before deploying to production:

- [ ] Update Firestore security rules
- [ ] Change admin password
- [ ] Create required Firestore indexes
- [ ] Test with expected number of users
- [ ] Set up monitoring/error tracking
- [ ] Configure custom domain
- [ ] Test on different devices (mobile, tablet, desktop)
- [ ] Test with slow network connections
- [ ] Verify dashboard on actual projector

## Game Rules Summary

- **Duration:** 5 minutes total
- **Level 1:** Team round, captain submits, correct = +35 per member
- **Level 2:** Individual, Safe (+15/0) or Bold (+30/-10)
- **Level 3:** Individual speed race, 1st = +35, 2nd = +30, 3rd = +25, others = +20
- **Tie-break:** Score > L3 time > L2 time

## Support

For issues:
1. Check browser console for errors
2. Check Firebase Console for data
3. Verify all environment variables are set
4. Ensure Firestore indexes are created
