# Office Engagement Game

A real-time team-based office game built with Next.js 14, TypeScript, Tailwind CSS, and Firebase.

## Features

- Team creation and joining with unique codes
- 3-level gameplay system with different mechanics
- 5-minute global game timer
- Real-time projector dashboard
- Admin control panel
- Support for 80-100 concurrent users
- Live leaderboard with tie-breaking logic

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Firebase Firestore
- **Charts:** Recharts (for dashboard visuals)

## Project Structure

```
.
├── app/
│   ├── page.tsx              # Landing page (create/join team)
│   ├── play/page.tsx         # Player game screen
│   ├── admin/page.tsx        # Admin control panel
│   └── dashboard/page.tsx    # Live projector dashboard
├── components/
│   ├── CreateTeamForm.tsx
│   ├── JoinTeamForm.tsx
│   ├── LobbyView.tsx
│   ├── LevelOneTeamView.tsx
│   ├── LevelTwoBoldView.tsx
│   ├── LevelThreeValueView.tsx
│   ├── FinishedView.tsx
│   ├── Leaderboard.tsx
│   └── ActivityFeed.tsx
├── lib/
│   ├── firebase.ts           # Firebase initialization
│   ├── game.ts               # Core game logic
│   ├── queries.ts            # Firestore queries
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Utility functions
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create Database"
   - Start in **Production Mode**
   - Choose a location close to your users
4. Get your Firebase configuration:
   - Go to Project Settings
   - Scroll to "Your apps"
   - Click the web icon (</>)
   - Copy the configuration values

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Fill in your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

ADMIN_PASSWORD=admin123
```

### 4. Configure Firestore Security Rules

In Firebase Console, go to Firestore Database > Rules and update:

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

**Note:** This allows all read/write access. For production, you should restrict based on your security needs.

### 5. Create Firestore Indexes (Required)

Go to Firebase Console > Firestore Database > Indexes and create these composite indexes:

1. **Index for Level 3 ranking:**
   - Collection: `answers`
   - Fields:
     - `level` (Ascending)
     - `isCorrect` (Ascending)
     - `submittedAt` (Ascending)

2. **Index for activity feed:**
   - Collection: `activity`
   - Fields:
     - `createdAt` (Descending)

These indexes are required for the queries to work. Firebase will also prompt you with direct links if you try to run the app without them.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Seed Questions (REQUIRED)

1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Login with password: `admin123`
3. Click "Seed Questions" button
4. This will create sample questions for all 3 levels

## Game Flow

### Lobby Phase

1. Players create or join teams using team codes
2. Admin starts the game when ready

### Level 1: Team Up (Team-based)

- Only captain can submit
- Correct: +35 points per team member
- Wrong: 0 points
- All team members advance together to Level 2

### Level 2: Be Bold (Individual)

- Each player chooses "Be Safe" or "Be Bold" mode
- **Be Safe:** Correct = +15, Wrong = 0
- **Be Bold:** Correct = +30, Wrong = -10
- Player advances to Level 3 after submission

### Level 3: Deliver Value (Individual, Speed-based)

- Correct answers ranked by submission timestamp
- **1st correct:** +35 points
- **2nd correct:** +30 points
- **3rd correct:** +25 points
- **All others correct:** +20 points
- Wrong: 0 points
- Player marked as finished after submission

### Game End

- Game automatically ends after 5 minutes
- Final leaderboard displayed
- Tie-breaking: higher score wins; if tied, earlier Level 3 submission wins; if still tied, earlier Level 2 submission wins

## Admin Panel Features

Access: [http://localhost:3000/admin](http://localhost:3000/admin)

- Start/End game
- Reset entire game
- Seed questions
- View all teams and players
- Monitor game state
- Refresh data

Default password: `admin123`

## Dashboard Features

Access: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

- Large countdown timer (5 minutes)
- Current game phase indicator
- Player distribution across levels
- Top 10 live leaderboard
- Recent activity feed
- Auto-updates in real-time

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy

### Firebase Configuration for Production

1. Update Firestore security rules for production
2. Set up Firebase hosting if needed
3. Configure custom domain

## Customization

### Adding More Questions

1. Go to Admin Panel
2. Use Firestore Console to add questions to `questions` collection
3. Or modify the `seedQuestions()` function in `lib/game.ts`

### Adjusting Game Duration

Modify the game duration in `lib/game.ts`:

```typescript
const gameEndTime = Timestamp.fromMillis(gameStartTime.toMillis() + 5 * 60 * 1000);
```

Change `5 * 60 * 1000` to your desired duration in milliseconds.

### Changing Point Values

Edit the scoring logic in:
- `lib/game.ts` - `submitLevel1()`, `submitLevel2()`, `submitLevel3()`

## Troubleshooting

### "Missing Index" Error

If you see an error about missing indexes, click the link in the error message or manually create the indexes in Firebase Console as described in step 5 above.

### Players Can't Join

- Verify team code is correct (case-insensitive, but converted to uppercase)
- Check Firebase Rules allow write access
- Ensure network connectivity to Firebase

### Dashboard Not Updating

- Check browser console for errors
- Verify Firestore real-time listeners are working
- Ensure Firebase project is properly configured

### Game Timer Issues

- The timer uses server timestamps from Firebase
- Client clocks don't affect game timing
- Ensure `gameStartTime` and `gameEndTime` are properly set when starting game

## Support

For issues or questions, check:
- Firebase Console for database state
- Browser console for client-side errors
- Network tab for Firebase connection issues

## License

MIT
