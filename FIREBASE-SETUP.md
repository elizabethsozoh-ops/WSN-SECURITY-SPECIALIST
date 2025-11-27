# Firebase Setup Instructions

## Step 1: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **wsn-guardian**
3. Click the gear icon ⚙️ next to "Project Overview"
4. Scroll down to "Your apps" section
5. If you don't have a web app yet, click "Add app" and select the web icon (</>)
6. Copy the `firebaseConfig` object

It should look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "wsn-guardian.firebaseapp.com",
  projectId: "wsn-guardian",
  storageBucket: "wsn-guardian.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcd..."
};
```

## Step 2: Update the Production App

Once you have the config, I'll update `client-app/js/app-production.js` with your actual credentials.

## Step 3: Switch from Demo to Production

We'll update `client-app/index.html` to use the production script instead of the demo version.

## Current Status

- ✅ Firebase project exists (wsn-guardian)
- ✅ Users registered in Firebase Authentication
- ✅ Firestore database active
- ⏳ Need Firebase web app configuration
- ⏳ Need to update client app to use Firebase

## What Will Work After Setup

1. **Client Portal**:
   - Real login with existing Firebase users
   - User registration creates accounts in Firebase
   - Emergency button presses create incidents in Firestore

2. **Control Room**:
   - Incidents appear in real-time
   - Can assign units and update status
   - Changes sync instantly to client app

3. **Data Flow**:
   ```
   Client App → Firebase Auth → Login ✓
   Client App → Firestore → Create Incident
   Firestore → Control Room → Real-time Update
   Control Room → Firestore → Update Status
   Firestore → Client App → Show Status
   ```
