# Control Room Diagnostic Checklist

## Problem Summary

Your control room (running on localhost:8081) crashed when you tested the emergency button. This guide will help you diagnose and fix the issue.

## Likely Causes

1. **Control room tried to access undefined incident fields** - JavaScript error when handling new incident
2. **No error handling in Firebase listener** - Unhandled promise rejection crashes the app
3. **Firebase not initialized in control room** - Missing Firebase SDK or configuration
4. **CORS or security issues** - Browser blocking Firebase access

## Step-by-Step Diagnostic

### 1. Check Control Room Browser Console

1. Open your control room at `http://localhost:8081`
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Look for red error messages

**Common errors you might see**:

```
❌ TypeError: Cannot read property 'name' of undefined
   → FIX: Add null checks when accessing incident.assignedUnit

❌ Uncaught (in promise) FirebaseError: Missing or insufficient permissions
   → FIX: Update Firestore security rules (see FIRESTORE-RULES-SETUP.md)

❌ ReferenceError: firebase is not defined
   → FIX: Add Firebase SDK scripts to control room HTML

❌ FirebaseError: Failed to get document because the client is offline
   → FIX: Check internet connection and Firebase network rules
```

### 2. Verify Firebase SDK is Loaded

Your control room HTML should have these scripts **before** your app code:

```html
<!-- Add these BEFORE your control room app script -->
<script type="module">
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
  import { getFirestore, collection, query, where, orderBy, onSnapshot, updateDoc, doc, serverTimestamp, arrayUnion } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

  // Firebase Configuration (MUST match client portal)
  const firebaseConfig = {
    apiKey: "AIzaSyCqIFBd6sq46cjCCjJ2L5QXVaEsvbuGKi8",
    authDomain: "wsn-guardian.firebaseapp.com",
    projectId: "wsn-guardian",
    storageBucket: "wsn-guardian.firebasestorage.app",
    messagingSenderId: "867816848580",
    appId: "1:867816848580:web:a356aa5d456d287feb9d91"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Make available globally for your control room code
  window.db = db;
  window.firestoreHelpers = { updateDoc, doc, serverTimestamp, arrayUnion };
</script>
```

### 3. Add Proper Error Handling to Incident Listener

Your control room's `onSnapshot` listener should have error handling:

```javascript
// SAFE incident listener with error handling
const incidentsQuery = query(
  collection(db, 'incidents'),
  where('status', 'in', ['pending', 'dispatched']),
  orderBy('createdAt', 'desc')
);

const unsubscribe = onSnapshot(
  incidentsQuery,
  (snapshot) => {
    try {
      snapshot.docChanges().forEach((change) => {
        const incident = { id: change.doc.id, ...change.doc.data() };

        if (change.type === 'added') {
          console.log('🚨 NEW INCIDENT:', incident);

          // SAFE: Check if function exists before calling
          if (typeof addIncidentToUI === 'function') {
            addIncidentToUI(incident);
          }

          if (typeof playAlertSound === 'function') {
            playAlertSound();
          }

          if (typeof showNotification === 'function') {
            showNotification(incident);
          }
        }

        if (change.type === 'modified') {
          console.log('📝 INCIDENT UPDATED:', incident);

          if (typeof updateIncidentInUI === 'function') {
            updateIncidentInUI(incident);
          }
        }

        if (change.type === 'removed') {
          console.log('✅ INCIDENT REMOVED:', incident);

          if (typeof removeIncidentFromUI === 'function') {
            removeIncidentFromUI(incident.id);
          }
        }
      });
    } catch (error) {
      console.error('❌ Error processing incident change:', error);
    }
  },
  (error) => {
    // This handles Firestore listener errors
    console.error('❌ Firestore listener error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    // Show error in UI
    alert('⚠️ Lost connection to incident feed.\n\nError: ' + error.message);
  }
);
```

### 4. Add Null Safety When Displaying Incidents

When your control room displays incident data, always check if fields exist:

```javascript
function addIncidentToUI(incident) {
  try {
    // SAFE: Use optional chaining and default values
    const incidentType = incident.type || 'unknown';
    const status = incident.status || 'pending';
    const userName = incident.userProfile?.firstName || incident.userEmail || 'Unknown User';
    const userPhone = incident.userProfile?.phone || 'No phone';
    const userAddress = incident.location?.address || incident.userProfile?.address || 'Unknown location';

    // SAFE: Check coordinates exist before accessing
    const lat = incident.location?.coordinates?.lat || 0;
    const lng = incident.location?.coordinates?.lng || 0;

    // SAFE: Check if assignedUnit exists (won't exist for new incidents)
    const unitName = incident.assignedUnit?.name || 'Not assigned';
    const officer = incident.assignedUnit?.officer || '-';
    const eta = incident.assignedUnit?.eta || '-';

    // Now safely build your UI with these values
    const incidentHTML = `
      <div class="incident-card" data-incident-id="${incident.id}">
        <h3>${incidentType.toUpperCase()}</h3>
        <p>Status: ${status}</p>
        <p>User: ${userName} (${userPhone})</p>
        <p>Address: ${userAddress}</p>
        <p>Location: ${lat}, ${lng}</p>
        ${incident.assignedUnit ? `
          <div class="unit-info">
            <p>Unit: ${unitName}</p>
            <p>Officer: ${officer}</p>
            <p>ETA: ${eta}</p>
          </div>
        ` : ''}
      </div>
    `;

    // Add to your incidents container
    document.getElementById('incidents-container').insertAdjacentHTML('afterbegin', incidentHTML);

  } catch (error) {
    console.error('❌ Error adding incident to UI:', error);
    console.error('Incident data:', incident);
  }
}
```

### 5. Test Firestore Connection from Control Room

Open browser console on your control room page and run:

```javascript
// Test 1: Check if db is defined
console.log('Database object:', window.db);

// Test 2: Try to read incidents collection
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const testRead = async () => {
  try {
    const querySnapshot = await getDocs(collection(window.db, 'incidents'));
    console.log('✅ Found', querySnapshot.size, 'incidents');
    querySnapshot.forEach((doc) => {
      console.log('Incident:', doc.id, doc.data());
    });
  } catch (error) {
    console.error('❌ Error reading incidents:', error.code, error.message);
  }
};

testRead();
```

### 6. Check Network Tab

1. Open F12 Developer Tools
2. Go to **Network** tab
3. Filter by "firestore" or "googleapis"
4. Try creating an incident from client portal
5. Look for any failed (red) requests

**What to check**:
- Status code should be 200 (OK)
- If you see 403 (Forbidden) → Security rules issue
- If you see 404 (Not Found) → Wrong collection path
- If you see CORS errors → Firebase configuration issue

## Quick Fix Template

If your control room is missing Firebase integration entirely, here's a minimal working setup:

### control-room-firebase-test.html

```html
<!DOCTYPE html>
<html>
<head>
  <title>Control Room - Firebase Test</title>
  <style>
    body {
      font-family: monospace;
      background: #000;
      color: #0f0;
      padding: 20px;
    }
    .incident {
      background: #111;
      border: 2px solid #0f0;
      padding: 15px;
      margin: 10px 0;
    }
    .new { animation: blink 1s; }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  </style>
</head>
<body>
  <h1>🚨 Control Room - Incident Monitor</h1>
  <div id="status">Initializing...</div>
  <div id="incidents"></div>

  <script type="module">
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
    import { getFirestore, collection, query, where, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

    const firebaseConfig = {
      apiKey: "AIzaSyCqIFBd6sq46cjCCjJ2L5QXVaEsvbuGKi8",
      authDomain: "wsn-guardian.firebaseapp.com",
      projectId: "wsn-guardian",
      storageBucket: "wsn-guardian.firebasestorage.app",
      messagingSenderId: "867816848580",
      appId: "1:867816848580:web:a356aa5d456d287feb9d91"
    };

    try {
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      document.getElementById('status').innerHTML = '✅ Connected to Firebase';

      // Listen for active incidents
      const q = query(
        collection(db, 'incidents'),
        where('status', 'in', ['pending', 'dispatched']),
        orderBy('createdAt', 'desc')
      );

      onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const incident = { id: change.doc.id, ...change.doc.data() };

          if (change.type === 'added') {
            console.log('🚨 NEW INCIDENT:', incident);

            const div = document.createElement('div');
            div.className = 'incident new';
            div.id = 'incident-' + incident.id;
            div.innerHTML = `
              <h2>🚨 ${incident.type?.toUpperCase() || 'EMERGENCY'}</h2>
              <p><strong>Status:</strong> ${incident.status || 'pending'}</p>
              <p><strong>User:</strong> ${incident.userEmail || 'Unknown'}</p>
              <p><strong>Name:</strong> ${incident.userProfile?.firstName || ''} ${incident.userProfile?.lastName || ''}</p>
              <p><strong>Phone:</strong> ${incident.userProfile?.phone || 'N/A'}</p>
              <p><strong>Address:</strong> ${incident.location?.address || incident.userProfile?.address || 'Unknown'}</p>
              <p><strong>GPS:</strong> ${incident.location?.coordinates?.lat || 0}, ${incident.location?.coordinates?.lng || 0}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
              <p><strong>ID:</strong> ${incident.id}</p>
            `;

            document.getElementById('incidents').insertBefore(div, document.getElementById('incidents').firstChild);
          }

          if (change.type === 'modified') {
            console.log('📝 UPDATED:', incident);
            const el = document.getElementById('incident-' + incident.id);
            if (el) {
              el.style.borderColor = '#ff0';
            }
          }
        });
      }, (error) => {
        console.error('❌ Listener error:', error);
        document.getElementById('status').innerHTML = '❌ Error: ' + error.message;
      });

    } catch (error) {
      console.error('❌ Firebase init error:', error);
      document.getElementById('status').innerHTML = '❌ Failed to connect: ' + error.message;
    }
  </script>
</body>
</html>
```

## Testing Steps

1. **Test the control room Firebase test page**:
   - Save the HTML above as `control-room-firebase-test.html` in your project
   - Open it in a browser
   - Should show "✅ Connected to Firebase"

2. **Create test incident from client**:
   - Go to client portal `http://localhost:8000`
   - Login with `elizabethsozoh@gmail.com`
   - Press an emergency button
   - Confirm the alert

3. **Verify incident appears in test control room**:
   - Should see incident appear immediately
   - Check browser console for logs

4. **If test page works**:
   - Copy the Firebase initialization code to your actual control room
   - Add error handling as shown above
   - Make sure all field accesses use optional chaining

## Next Steps

After you get the test control room working:

1. Update your actual control room with proper Firebase integration
2. Add dispatch functionality (update incident status)
3. Add map display for GPS coordinates
4. Add notification sounds/alerts
5. Test full incident lifecycle

## Common Pitfalls

- ❌ **Forgetting to add Firebase SDK** → Control room can't connect
- ❌ **No error handling** → One bad incident crashes the whole app
- ❌ **Accessing undefined fields** → `incident.assignedUnit.name` fails if unit not assigned yet
- ❌ **Wrong Firebase config** → Must match client portal exactly
- ❌ **Security rules not set** → Control room can't read incidents
- ❌ **Not using serverTimestamp()** → Timestamp comparison fails

Let me know what errors you see in the control room console and we'll fix them!
