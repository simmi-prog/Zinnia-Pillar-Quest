# Deployment Guide

## Quick Deploy to Vercel (5 minutes)

### Prerequisites
- GitHub account
- Vercel account (free)
- Firebase project configured

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Office engagement game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_value
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_value
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_value
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_value
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_value
   NEXT_PUBLIC_FIREBASE_APP_ID=your_value
   ADMIN_PASSWORD=your_password
   ```

6. Click "Deploy"

7. Wait 2-3 minutes for build to complete

8. Your app is live at `https://your-app.vercel.app`

### Step 3: Post-Deploy Setup

1. Visit `https://your-app.vercel.app/admin`
2. Login with your admin password
3. Click "Seed Questions"
4. Test creating a team
5. Share the URL with your office

### Step 4: Update Firebase Settings (Optional)

In Firebase Console:

1. **Add Authorized Domain:**
   - Authentication → Settings → Authorized Domains
   - Add your Vercel domain: `your-app.vercel.app`

2. **Update Security Rules** (if needed):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Add more restrictive rules here if needed
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

## Custom Domain (Optional)

### On Vercel:
1. Go to your project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Update Firebase:
1. Add custom domain to Authorized Domains
2. Update `.env.local` if using custom domain for auth

## Environment Variables Management

### Update Variables:
1. Go to Vercel project → Settings → Environment Variables
2. Edit values
3. Redeploy for changes to take effect

### Add New Variables:
1. Add to `.env.local` for local development
2. Add to Vercel dashboard for production
3. Redeploy

## Monitoring

### View Logs:
1. Vercel Dashboard → Your Project → Deployments
2. Click on deployment → View Function Logs
3. Monitor for errors during game

### Firebase Console:
1. Firestore → Data tab
2. Watch real-time updates during game
3. Check for errors or stuck states

## Performance Optimization

For better performance with 80-100 users:

1. **Firestore Indexes:** Ensure all required indexes are created
2. **Vercel Region:** Deploy to region closest to your users
3. **Firebase Region:** Use same region as Vercel if possible
4. **Caching:** Vercel automatically caches static assets

## Backup Strategy

Before running a live game:

1. **Test Thoroughly:**
   - Run a full test game with 5-10 people
   - Verify all features work
   - Check dashboard updates in real-time

2. **Have Backup Plan:**
   - Keep Firebase Console open
   - Have admin credentials ready
   - Keep this laptop running as backup (npm run dev)

3. **Document URLs:**
   - Write down all URLs for participants
   - Create QR codes for easy access
   - Have URLs ready to share in chat/email

## Rollback

If deployment breaks:

1. Go to Vercel → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Previous version is restored instantly

## Cost Estimates

### Firebase (Free Tier)
- **Firestore:** 50K reads/20K writes per day (more than enough for 100 users)
- **Bandwidth:** 10GB/month

### Vercel (Free Tier)
- **Bandwidth:** 100GB/month
- **Function Execution:** 100GB-hours
- **Deployments:** Unlimited

For 100 users playing once:
- Estimated cost: $0 (well within free tier limits)

## Production Checklist

- [ ] Deployed to Vercel
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] Firebase security rules reviewed
- [ ] Firestore indexes created
- [ ] Test game completed successfully
- [ ] Dashboard tested on actual projector
- [ ] Admin credentials documented
- [ ] Backup plan ready
- [ ] URLs shared with participants

## Day-of-Event Setup

1. **30 minutes before:**
   - Open admin panel
   - Open dashboard on projector
   - Share player URL

2. **15 minutes before:**
   - Ask people to create/join teams
   - Monitor admin panel for team formation

3. **Game time:**
   - Count down
   - Click "Start Game"
   - Watch the dashboard

4. **After game:**
   - Announce winners from leaderboard
   - Take screenshot
   - Click "Reset Game" when ready for next round

## Support During Event

Keep these open in tabs:
1. Admin panel (for control)
2. Dashboard (on projector)
3. Firebase Console (for troubleshooting)
4. Vercel Dashboard (for logs)

## Re-running the Game

To run another game session:

1. Click "Reset Game" in admin panel
2. This clears all teams, players, and answers
3. Questions remain (no need to re-seed)
4. Game state returns to "lobby"
5. Share URLs again for new participants

## Troubleshooting Production

### Dashboard not updating on projector
- Refresh the page
- Check internet connection
- Verify projector display settings

### High latency
- Check Firebase region matches user location
- Verify Vercel deployment region
- Check internet speed

### Too many players
- Firebase free tier supports your load
- If issues arise, upgrade Firebase plan
- Vercel free tier is sufficient

### Data persistence
- Firestore data persists indefinitely
- Reset game clears current session
- Old game data is deleted on reset

## Success Metrics

After deployment, verify:
- [ ] Page loads in < 2 seconds
- [ ] Team creation takes < 1 second
- [ ] Dashboard updates within 1-2 seconds of actions
- [ ] All 100 players can join simultaneously
- [ ] No errors in Vercel logs
- [ ] No errors in browser console

Your game is production-ready!
