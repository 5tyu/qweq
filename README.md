# Taha's Counter — Firebase Edition v3

A real-time call center metrics dashboard with Firebase Auth, Firestore, and Realtime Database.

---

## Files

```
tahascounter/
├── index.html          ← Agent dashboard (main app)
├── admin.html          ← Admin Commander panel
├── firebase-config.js  ← Firebase config reference (already embedded in HTML)
├── firestore.rules     ← Deploy to Firebase: firebase deploy --only firestore:rules
├── functions/
│   └── index.js        ← Cloud Functions: adminCreateUser, adminDisableUser, adminDeleteUser
└── src/
    └── style.css       ← Full design system (glassmorphism)
```

---

## Setup Steps

### 1. Host the files
You can open `index.html` directly in a browser (local file), or deploy to Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # point to this folder as public dir
firebase deploy --only hosting
```

### 2. Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Cloud Functions (for Admin user creation)
```bash
cd functions
npm init -y
npm install firebase-admin firebase-functions
cd ..
firebase deploy --only functions
```

### 4. Create the first Admin account

Option A — Firebase Console:
1. Go to Firebase Console → Authentication → Add User
2. Note the UID
3. Go to Firestore → users → New Document with that UID
4. Set fields: `role: "admin"`, `email: "yousef.mohamedsalem@intelcia.com"`, `name: "admin"`, `disabled: false`

Option B — The existing Firestore document you showed already has `role: "admin"` — just ensure the Firebase Auth UID matches the Firestore document ID.

---

## Features

### Agent Dashboard (`index.html`)
- Firebase Auth sign-in / sign-up
- Real-time Firestore sync via `onSnapshot` (updates across tabs/devices instantly)
- Realtime Database heartbeat for "Last Updated" timer
- 31-day calendar with multi-day aggregation
- Tier Engine: Pay/Full/Post tiers 1–5 with progress arrow
- Chart.js 31-day trend line
- Estimation tool (Ready/In/Call Length → Est. Available)
- Aux Reporter (status + timer → copy for Teams)
- Call Logger (Acc # + Seq # + outcome → local log)
- Theme color picker + title editor (saved to Firestore profile)
- Screenshot export via html2canvas
- Offline fallback to localStorage

### Admin Dashboard (`admin.html`)
- Role guard: only `role: "admin"` can access
- Create new agents/supervisors via Cloud Function (secure)
- Live user table with Edit / Enable-Disable / Delete
- Kanban board (drag & drop to assign agents to supervisors)
- Multi-day calendar + per-agent or team-wide performance view
- Export Raw Call Logs (.xlsx)
- Export Performance Report (.xlsx with % formatting)

### Firestore Data Model
```
users/{uid}
  ├── email, name, role, status, disabled
  ├── theme: { primaryColor, title }
  └── metrics/{1..31}
        └── { calls, pay, full, coll, rem, post, credits, ap, pp }
```

### Tier Thresholds
| Tier | Pay % | Full % | Post/Rem % |
|------|-------|--------|------------|
| T1   | < 60  | < 45   | < 60       |
| T2   | < 66  | < 48   | < 65       |
| T3   | < 73  | < 52   | < 70       |
| T4   | < 78  | < 55   | < 75       |
| T5   | 100   | 100    | 100        |

---

## Security Notes
- Agents can only read/write their own `users/{uid}` and sub-collections
- Admins can read/write all user documents
- User creation is handled server-side via Cloud Functions — no client can forge a role
- The `adminCreateUser` function verifies the caller's role from Firestore before creating any account
