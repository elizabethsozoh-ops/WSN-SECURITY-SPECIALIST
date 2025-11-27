# Firestore Security Rules Setup

## Current Problem

The emergency buttons are failing with error: **"Error creating emergency alert"**

This is because Firestore security rules are blocking the client app from creating incident documents.

## Step 1: Check Current Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **wsn-guardian**
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab at the top
5. You should see your current security rules

## Step 2: Update Security Rules

Copy and paste these rules into the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {
      // Users can read and write their own document
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Admins can read all user documents
      allow read: if request.auth != null &&
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Incidents collection - THIS IS CRITICAL FOR EMERGENCY BUTTONS
    match /incidents/{incidentId} {
      // Clients can create incidents with their own userId
      allow create: if request.auth != null &&
                      request.resource.data.userId == request.auth.uid;

      // Users can read their own incidents
      allow read: if request.auth != null &&
                    resource.data.userId == request.auth.uid;

      // Admins can read ALL incidents (for control room)
      allow read: if request.auth != null &&
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';

      // Only admins can update incidents (for control room dispatch)
      allow update: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Step 3: Publish the Rules

1. Click **Publish** button in the Firebase Console
2. Wait for confirmation message: "Rules have been published"

## Step 4: Test Emergency Button Again

1. Go back to client portal: `http://localhost:8000`
2. Login with your test user: `elizabethsozoh@gmail.com`
3. Press any emergency button (e.g., Armed Response)
4. Confirm the alert

**Expected result**:
- No error message
- You should see the "Emergency Active" screen
- Check Firestore Console → you should see a new document in `incidents` collection

## Step 5: Verify Incident in Firestore

1. Go to Firebase Console → Firestore Database → Data tab
2. Click on `incidents` collection
3. You should see a new document with fields like:
   - `type`: "panic", "medical", "fire", or "technical"
   - `status`: "pending"
   - `userId`: (your user's UID)
   - `userEmail`: "elizabethsozoh@gmail.com"
   - `location`: { coordinates: { lat, lng, accuracy }, address, timestamp }
   - `timeline`: Array with incident_created entry
   - `createdAt`: Timestamp

## Step 6: Setup Control Room User (If Needed)

For the control room to read and update incidents, you need an admin user:

### Option A: Make Existing User an Admin

1. Go to Firestore Database → Data tab
2. Find your user document in `users` collection
3. Edit the document
4. Add field: `role` = `"admin"`
5. Save

### Option B: Create New Admin User

Run this in your browser console while logged into the client portal:

```javascript
// Create admin user in Firebase Auth first, then add to Firestore
const adminData = {
  email: "admin@wsn-guardian.com",
  profile: {
    firstName: "Control",
    lastName: "Room",
    phone: "0123456789",
    address: "WSN HQ"
  },
  role: 'admin',
  companyId: 'wsn-group',
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
};

// Add to Firestore (you'll need to create the auth account first)
```

## Troubleshooting

### If emergency button still fails:

1. **Check browser console** (F12 → Console tab):
   - Look for red error messages
   - Should show exact Firestore error

2. **Common errors**:
   - `permission-denied`: Rules not published or incorrect
   - `not-found`: Collection path is wrong
   - `invalid-argument`: Data structure is invalid

3. **Test Firestore directly**:
   - Open browser console on `http://localhost:8000`
   - Run:
   ```javascript
   // Test if you can write to incidents
   const { getFirestore, collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
   const db = getFirestore();

   const testIncident = {
     type: 'panic',
     status: 'pending',
     userId: auth.currentUser.uid,
     userEmail: auth.currentUser.email,
     createdAt: serverTimestamp()
   };

   try {
     const docRef = await addDoc(collection(db, 'incidents'), testIncident);
     console.log('✅ Test incident created:', docRef.id);
   } catch (error) {
     console.error('❌ Error:', error.code, error.message);
   }
   ```

### If control room crashes:

The control room might be crashing because it's trying to access incident fields that don't exist yet. Make sure the control room code:

1. Checks if fields exist before accessing them
2. Uses optional chaining: `incident.assignedUnit?.name`
3. Has error handling in the `onSnapshot` listener

## Next Steps

Once the security rules are published and working:

1. ✅ Client can create incidents
2. ✅ Incidents appear in Firestore
3. ✅ Control room can read incidents in real-time
4. ✅ Control room can update incident status
5. ✅ Client sees status updates in real-time

See [CONTROL-ROOM-INTEGRATION.md](CONTROL-ROOM-INTEGRATION.md) for control room setup details.
