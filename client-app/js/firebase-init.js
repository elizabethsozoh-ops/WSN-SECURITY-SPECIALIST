// Firebase initialization and utility functions
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';

// Load configuration
let firebaseConfig = null;
let companyConfig = null;

async function loadConfig() {
  // For now, return a mock config since we haven't set up Firebase yet
  const config = {
    firebase: {
      apiKey: "AIzaSyCqIFBd6sq46cjCCjJ2L5QXVaEsvbuGKi8",
      authDomain: "wsn-guardian.firebaseapp.com",
      projectId: "wsn-guardian",
      storageBucket: "wsn-guardian.firebasestorage.app",
      messagingSenderId: "867816848580",
      appId: "1:867816848580:web:a356aa5d456d287feb9d91"
    },
    defaultCompany: {
      companyId: "sss-security",
      name: "SSS Security",
      displayName: "SSS Guardian",
      tagline: "Powered by WSN Security Specialist",
      colors: {
        primary: "#D4AF37",
        secondary: "#C0C0C0",
        accent: "#1a1a1a",
        background: "#0a0a0a",
        text: "#ffffff"
      },
      contact: {
        phone: "0123456789",
        email: "control@sss-security.co.za",
        emergencyLine: "0861234567"
      }
    }
  };

  firebaseConfig = config.firebase;
  companyConfig = config.defaultCompany;
  return config;
}

// Initialize Firebase
let app, auth, db, messaging;

async function initFirebase() {
  const config = await loadConfig();

  app = initializeApp(config.firebase);
  auth = getAuth(app);
  db = getFirestore(app);

  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase Messaging not available:', error);
  }

  return { app, auth, db, messaging };
}

// Auth functions
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function registerUser(email, password, userData) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await addDoc(collection(db, 'users'), {
      userId: user.uid,
      companyId: companyConfig.companyId,
      profile: userData,
      subscription: {
        status: 'active',
        plan: 'standard',
        startDate: serverTimestamp()
      },
      dependants: [],
      emergencyContacts: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Incident functions
async function createIncident(incidentData) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Get user's current location
    const location = await getCurrentLocation();

    const incident = {
      companyId: companyConfig.companyId,
      userId: user.uid,
      type: incidentData.type,
      status: 'pending',
      priority: incidentData.type === 'panic' || incidentData.type === 'medical' ? 'critical' : 'high',
      location: {
        coordinates: {
          lat: location.latitude,
          lng: location.longitude,
          accuracy: location.accuracy
        },
        address: incidentData.address || 'Fetching address...',
        timestamp: serverTimestamp()
      },
      userDetails: incidentData.userDetails,
      timeline: [
        {
          timestamp: serverTimestamp(),
          action: 'incident_created',
          actor: 'user',
          note: `${incidentData.type} button pressed`
        }
      ],
      notes: incidentData.notes || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'incidents'), incident);

    // Send notification to control room
    await notifyControlRoom(docRef.id, incident);

    return { success: true, incidentId: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getIncidentById(incidentId) {
  try {
    const docRef = doc(db, 'incidents', incidentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, incident: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Incident not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getUserIncidents(userId) {
  try {
    const q = query(
      collection(db, 'incidents'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const incidents = [];

    querySnapshot.forEach((doc) => {
      incidents.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, incidents };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function subscribeToIncident(incidentId, callback) {
  const docRef = doc(db, 'incidents', incidentId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
}

// Location functions
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

async function reverseGeocode(lat, lng) {
  // This would use Google Maps Geocoding API
  // For now, return a placeholder
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

// Notification functions
async function requestNotificationPermission() {
  if (!messaging) return { success: false, error: 'Messaging not available' };

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY'
      });
      return { success: true, token };
    } else {
      return { success: false, error: 'Permission denied' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function onNotificationReceived(callback) {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    callback(payload);
  });
}

async function notifyControlRoom(incidentId, incidentData) {
  // This would trigger a Cloud Function to send notifications
  // For now, just log
  console.log('Notifying control room:', incidentId, incidentData);
}

// User profile functions
async function getUserProfile(userId) {
  try {
    const q = query(collection(db, 'users'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { success: true, profile: { id: doc.id, ...doc.data() } };
    } else {
      return { success: false, error: 'Profile not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateUserProfile(userId, updates) {
  try {
    const q = query(collection(db, 'users'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } else {
      return { success: false, error: 'Profile not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Export all functions
export {
  initFirebase,
  loadConfig,
  loginUser,
  registerUser,
  logoutUser,
  onAuthChange,
  createIncident,
  getIncidentById,
  getUserIncidents,
  subscribeToIncident,
  getCurrentLocation,
  reverseGeocode,
  requestNotificationPermission,
  onNotificationReceived,
  getUserProfile,
  updateUserProfile,
  auth,
  db,
  companyConfig
};
