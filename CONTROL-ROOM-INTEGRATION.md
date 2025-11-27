# Control Room Integration Guide

## Overview
This guide explains how to connect your existing control room interface to receive real-time incident alerts from the client portal.

## How It Works

When a client presses an emergency button in the client portal:
1. An incident document is created in Firestore `incidents` collection
2. The control room listens for new incidents in real-time
3. New incidents appear instantly in the control room interface

## Incident Data Structure

Each incident in Firestore contains:

```javascript
{
  type: "panic" | "medical" | "fire" | "technical",
  status: "pending" | "dispatched" | "resolved" | "cancelled",
  priority: "critical" | "high" | "medium" | "low",
  userId: "user-uid-here",
  userEmail: "user@example.com",
  userProfile: {
    firstName: "John",
    lastName: "Doe",
    phone: "+27 82 123 4567",
    address: "123 Main Road, Kempton Park"
  },
  companyId: "wsn-group",
  location: {
    coordinates: {
      lat: -26.1234,
      lng: 28.5678,
      accuracy: 10
    },
    address: "123 Main Road, Kempton Park",
    timestamp: Firestore.Timestamp
  },
  timeline: [
    {
      timestamp: Firestore.Timestamp,
      action: "incident_created",
      actor: "client",
      note: "Armed Response button pressed"
    }
  ],
  createdAt: Firestore.Timestamp,
  updatedAt: Firestore.Timestamp,

  // Optional fields (added by control room)
  assignedUnit: {
    name: "Alpha 1",
    officer: "Officer Smith",
    eta: "5-7 minutes"
  },
  dispatchedAt: Firestore.Timestamp,
  resolvedAt: Firestore.Timestamp
}
```

## Firebase Configuration

Use the same Firebase config in your control room:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCqIFBd6sq46cjCCjJ2L5QXVaEsvbuGKi8",
  authDomain: "wsn-guardian.firebaseapp.com",
  projectId: "wsn-guardian",
  storageBucket: "wsn-guardian.firebasestorage.app",
  messagingSenderId: "867816848580",
  appId: "1:867816848580:web:a356aa5d456d287feb9d91"
};
```

## Control Room Code Example

### 1. Initialize Firebase (in your control room)

```javascript
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, query, where, orderBy, onSnapshot, updateDoc, doc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

### 2. Listen for New/Active Incidents

```javascript
// Listen for all pending incidents
const incidentsQuery = query(
  collection(db, 'incidents'),
  where('status', 'in', ['pending', 'dispatched']),
  orderBy('createdAt', 'desc')
);

const unsubscribe = onSnapshot(incidentsQuery, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const incident = { id: change.doc.id, ...change.doc.data() };

    if (change.type === 'added') {
      // New incident created
      console.log('🚨 NEW INCIDENT:', incident);
      addIncidentToUI(incident);
      playAlertSound();
      showNotification(incident);
    }

    if (change.type === 'modified') {
      // Incident updated
      console.log('📝 INCIDENT UPDATED:', incident);
      updateIncidentInUI(incident);
    }

    if (change.type === 'removed') {
      // Incident resolved/cancelled
      console.log('✅ INCIDENT REMOVED:', incident);
      removeIncidentFromUI(incident.id);
    }
  });
});
```

### 3. Update Incident Status (from control room)

```javascript
async function dispatchUnit(incidentId, unitInfo) {
  const incidentRef = doc(db, 'incidents', incidentId);

  await updateDoc(incidentRef, {
    status: 'dispatched',
    assignedUnit: {
      name: unitInfo.name,
      officer: unitInfo.officer,
      eta: unitInfo.eta
    },
    dispatchedAt: serverTimestamp(),
    timeline: arrayUnion({
      timestamp: serverTimestamp(),
      action: 'unit_dispatched',
      actor: 'control_room',
      note: `Unit ${unitInfo.name} dispatched`
    }),
    updatedAt: serverTimestamp()
  });
}
```

### 4. Resolve/Close Incident

```javascript
async function resolveIncident(incidentId, resolution) {
  const incidentRef = doc(db, 'incidents', incidentId);

  await updateDoc(incidentRef, {
    status: 'resolved',
    resolution: resolution,
    resolvedAt: serverTimestamp(),
    timeline: arrayUnion({
      timestamp: serverTimestamp(),
      action: 'incident_resolved',
      actor: 'control_room',
      note: resolution
    }),
    updatedAt: serverTimestamp()
  });
}
```

## Testing the Integration

### Step 1: Client Creates Incident
1. Login to client portal: `http://localhost:8000`
2. Press any emergency button (e.g., Armed Response)
3. Confirm the alert

### Step 2: Check Firestore
1. Go to Firebase Console → Firestore Database
2. Open `incidents` collection
3. You should see a new document with status "pending"

### Step 3: Control Room Receives Alert
Your control room should:
- Receive real-time notification
- Display incident on map (using lat/lng coordinates)
- Show incident details (user info, type, priority)
- Allow dispatching units

### Step 4: Update from Control Room
When you dispatch a unit:
1. Update the incident status to "dispatched"
2. Add assignedUnit information
3. The client app will receive the update in real-time
4. Client sees unit info and ETA

## Firebase Security Rules

Make sure your Firestore rules allow:
- Clients (role: 'client') can create and read their own incidents
- Control room (role: 'admin') can read and update all incidents

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /incidents/{incidentId} {
      // Clients can create and read their own incidents
      allow create: if request.auth != null &&
                      request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null &&
                    (resource.data.userId == request.auth.uid ||
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');

      // Only admins can update incidents
      allow update: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null &&
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Quick Start Checklist

- [ ] Add Firebase SDK to control room HTML
- [ ] Initialize Firebase with the config above
- [ ] Set up `onSnapshot` listener for incidents
- [ ] Display new incidents in your UI
- [ ] Implement dispatch/update functions
- [ ] Test by creating incident from client portal
- [ ] Verify real-time updates work both ways

## Support

The client portal is now fully functional and creating proper incident documents in Firestore. Your control room just needs to:
1. Connect to the same Firebase project
2. Listen to the `incidents` collection
3. Update incidents when dispatching units

All the data structure is ready - you just need to wire up the listeners!
