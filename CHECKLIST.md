# Pre-Game Checklist

Use this checklist before running your office game event.

## Setup (Do Once)

- [ ] `npm install` completed successfully
- [ ] Firebase project created
- [ ] Firestore enabled
- [ ] `.env.local` file created with Firebase credentials
- [ ] Firestore security rules updated to allow read/write
- [ ] App runs with `npm run dev`
- [ ] Admin panel accessible at /admin
- [ ] Questions seeded (click "Seed Questions" in admin panel)

## Before Event (Day Of)

- [ ] Computer/laptop ready for hosting game
- [ ] Projector setup for dashboard display
- [ ] Internet connection stable
- [ ] Firebase console accessible (for emergency troubleshooting)
- [ ] Test with 2-3 devices to verify everything works
- [ ] Firestore indexes created (will auto-prompt if missing)

## 15 Minutes Before Game

- [ ] Start dev server: `npm run dev`
- [ ] Open admin panel: http://localhost:3000/admin
- [ ] Open dashboard on projector: http://localhost:3000/dashboard
- [ ] Share player URL with participants: http://localhost:3000
- [ ] Verify dashboard shows "Game Not Started"
- [ ] Ask a few people to create/join teams as test

## Game Start

- [ ] Verify all teams are formed
- [ ] Check team count in admin panel
- [ ] Countdown from 3...2...1...
- [ ] Click "Start Game" in admin panel
- [ ] Verify countdown timer appears on dashboard
- [ ] Confirm players can see Level 1 questions

## During Game (Monitor)

- [ ] Watch dashboard for player progress
- [ ] Monitor activity feed for issues
- [ ] Be ready to use admin "Move" button if someone gets stuck
- [ ] Have Firebase console open in background for troubleshooting

## After 5 Minutes

- [ ] Timer should hit 0:00
- [ ] Game auto-ends (phase changes to "ended")
- [ ] Or manually click "End Game" in admin if needed
- [ ] Dashboard shows final leaderboard
- [ ] Announce winners!
- [ ] Take screenshot of final leaderboard

## After Event

- [ ] Click "Reset Game" in admin to clear for next time
- [ ] Or leave data for records

## Emergency Troubleshooting

### Player can't join team
- Verify team code is correct
- Check Firestore rules allow writes
- Try creating a new team

### Player stuck on a level
- Use admin panel "Move" button
- Manually advance them to next level

### Dashboard not updating
- Refresh the page
- Check internet connection
- Verify Firebase listeners in browser console

### Score is wrong
- Use admin panel "Edit" button on player
- Manually adjust score
- Document the change

### Game won't start
- Check gameState document in Firestore console
- Verify phase is "lobby"
- Refresh admin panel

### Timer not counting
- Check browser console for errors
- Verify gameStartTime and gameEndTime are set
- Refresh dashboard

## URLs Quick Reference

| Page | URL | Purpose |
|------|-----|---------|
| Landing | http://localhost:3000 | Players create/join teams |
| Play | http://localhost:3000/play | Main game screen |
| Admin | http://localhost:3000/admin | Control panel (password: admin123) |
| Dashboard | http://localhost:3000/dashboard | Projector display |

## Production URLs (After Vercel Deploy)

Replace `localhost:3000` with your Vercel URL, e.g.:
- https://your-app.vercel.app
- https://your-app.vercel.app/admin
- https://your-app.vercel.app/dashboard

## Expected Player Flow

1. Player opens landing page
2. Creates or joins team
3. Waits in lobby (sees team code, members)
4. Admin starts game
5. **Level 1:** Captain submits answer → team advances
6. **Level 2:** Player chooses Safe/Bold → submits → advances
7. **Level 3:** Player submits fast → finishes
8. Sees completion screen with score
9. Game ends after 5 minutes
10. Views final leaderboard on dashboard

## Game Statistics to Track

During the game, the dashboard shows:
- Total teams
- Players at each level
- Finished players
- Top 10 leaderboard
- Recent activity

These update in real-time, so you can see progression live.

## Post-Game

The final leaderboard is automatically sorted by:
1. Total score (descending)
2. Level 3 submission time (ascending) - if tied
3. Level 2 submission time (ascending) - if still tied

Take a screenshot of the dashboard at game end for records!
