// ABC Security - Production Version with Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, setDoc, doc, getDoc, getDocs, query, where, orderBy, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqIFBd6sq46cjCCjJ2L5QXVaEsvbuGKi8",
  authDomain: "wsn-guardian.firebaseapp.com",
  projectId: "wsn-guardian",
  storageBucket: "wsn-guardian.firebasestorage.app",
  messagingSenderId: "867816848580",
  appId: "1:867816848580:web:a356aa5d456d287feb9d91"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// App State
let currentUser = null;
let currentIncident = null;

// Company Config
const companyConfig = {
  companyId: "wsn-group",
  displayName: "abc security",
  tagline: "Powered by WSN GROUP",
  colors: {
    primary: "#D4AF37",
    secondary: "#C0C0C0"
  },
  contact: {
    phone: "0123456789"
  }
};

// Initialize App
function initApp() {
  console.log('🚀 ABC Security - Production Mode');

  // Apply branding
  applyBranding();

  // Show loading screen
  showLoading();

  // Setup auth state listener
  onAuthStateChanged(auth, (user) => {
    console.log('🔐 Auth state changed:', user ? 'User logged in' : 'No user');
    if (user) {
      currentUser = user;
      loadUserProfile(user.uid);
    } else {
      currentUser = null;
      showScreen('login');
      hideLoading();
    }
  });

  // Fallback: Hide loading after 3 seconds if still showing
  setTimeout(() => {
    if (!document.getElementById('loadingScreen')?.classList.contains('hidden')) {
      console.warn('⚠️ Loading timeout - forcing hide');
      hideLoading();
      showScreen('login');
    }
  }, 3000);

  // Setup event listeners
  setupEventListeners();



  // Mark app as initialized
  window.appInitialized = true;
}

// Apply Branding
function applyBranding() {
  const company = companyConfig;
  document.title = `${company.displayName} - ${company.tagline}`;

  const appTitle = document.getElementById('appTitle');
  if (appTitle) {
    appTitle.textContent = company.displayName;
  }

  document.documentElement.style.setProperty('--color-bronze', company.colors.primary);
  document.documentElement.style.setProperty('--color-silver', company.colors.secondary);
}

// Screen Management
function showScreen(screenName) {
  const screens = ['loginScreen', 'registerScreen', 'dashboardScreen', 'incidentScreen', 'incidentReportScreen', 'incidentReportDetailsScreen', 'incidentHistoryScreen', 'emergencyContactsScreen', 'safetyCheckInScreen', 'liveLocationScreen'];
  screens.forEach(screen => {
    document.getElementById(screen)?.classList.add('hidden');
  });

  const targetScreen = document.getElementById(`${screenName}Screen`);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }

  const bottomNav = document.getElementById('bottomNav');
  if (screenName === 'dashboard' || screenName === 'incident') {
    bottomNav?.classList.remove('hidden');
  } else {
    bottomNav?.classList.add('hidden');
  }
}

function showLoading() {
  document.getElementById('loadingScreen')?.classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loadingScreen')?.classList.add('hidden');
}

function showError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }
}

function hideError(elementId) {
  const errorEl = document.getElementById(elementId);
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
}

// Event Listeners
function setupEventListeners() {
  // Show Register Screen
  document.getElementById('showRegisterBtn')?.addEventListener('click', () => {
    showScreen('register');
  });

  // Show Login Screen
  document.getElementById('showLoginBtn')?.addEventListener('click', () => {
    showScreen('login');
  });

  // Login Form
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);

  // Register Form
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);

  // Emergency Buttons
  document.querySelectorAll('.emergency-button').forEach(btn => {
    btn.addEventListener('click', handleEmergencyButton);
  });

  // Logout button
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

  // Quick Actions
  document.getElementById('viewHistoryBtn')?.addEventListener('click', () => {
    showScreen('incidentHistoryScreen');
    loadIncidentHistory();
  });

  document.getElementById('backFromHistoryBtn')?.addEventListener('click', () => {
    showScreen('dashboardScreen');
  });

  document.getElementById('manageDependantsBtn')?.addEventListener('click', () => {
    alert('👥 Manage Dependants\n\nThis feature is coming soon!');
  });

  // 👻 GHOST PANIC Button - Revolutionary invisible panic feature
  document.getElementById('silentAlarmBtn')?.addEventListener('click', () => {
    // NO confirmation dialog - instant activation
    // This is critical for real danger situations
    triggerGhostPanic();
  });

  document.getElementById('callControlBtn')?.addEventListener('click', () => {
    const phone = companyConfig.contact.phone;
    if (confirm(`📞 Call Control Room\n\nDial: ${phone}?`)) {
      window.location.href = `tel:${phone}`;
    }
  });

  // Incident Actions
  document.getElementById('backToDashboardBtn')?.addEventListener('click', () => {
    showScreen('dashboard');
  });

  document.getElementById('cancelIncidentBtn')?.addEventListener('click', cancelIncident);

  document.getElementById('callUnitBtn')?.addEventListener('click', () => {
    alert('📞 Calling responding unit...');
  });

  // Incident Report Button
  document.getElementById('incidentReportBtn')?.addEventListener('click', () => {
    showScreen('incidentReport');
  });

  // Incident Report Category Selection
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', handleCategorySelection);
  });

  // Incident Report Form
  document.getElementById('incidentReportForm')?.addEventListener('submit', handleIncidentReportSubmit);

  // Back buttons for report screens
  document.getElementById('backFromReportBtn')?.addEventListener('click', () => {
    showScreen('dashboard');
  });

  document.getElementById('backToReportCategoriesBtn')?.addEventListener('click', () => {
    showScreen('incidentReport');
  });

  // Voice Input Button
  document.getElementById('voiceInputBtn')?.addEventListener('click', handleVoiceInput);

  // Emergency Contacts
  document.getElementById('emergencyContactsBtn')?.addEventListener('click', () => {
    showScreen('emergencyContacts');
    loadEmergencyContacts();
  });

  document.getElementById('backFromContactsBtn')?.addEventListener('click', () => {
    showScreen('dashboard');
  });

  document.getElementById('addContactForm')?.addEventListener('submit', handleAddContact);

  // Safety Check-In
  document.getElementById('safetyCheckInBtn')?.addEventListener('click', () => {
    showScreen('safetyCheckIn');
    loadCheckInStatus();
  });

  document.getElementById('backFromCheckInBtn')?.addEventListener('click', () => {
    showScreen('dashboard');
  });

  document.getElementById('toggleCheckInBtn')?.addEventListener('click', toggleCheckIn);

  // Live Location Sharing
  document.getElementById('shareLiveLocationBtn')?.addEventListener('click', () => {
    showScreen('liveLocation');
    loadLocationStatus();
  });

  document.getElementById('backFromLocationBtn')?.addEventListener('click', () => {
    showScreen('dashboard');
  });

  document.getElementById('toggleLocationBtn')?.addEventListener('click', toggleLiveLocation);

  // Alert My Family Button (from dashboard)
  document.getElementById('notifyFamilyBtn')?.addEventListener('click', alertMyFamily);

  // Link Account Button
  document.getElementById('linkAccountBtn')?.addEventListener('click', linkAccount);
}

// Authentication Handlers
async function handleLogin(e) {
  e.preventDefault();
  hideError('loginError');

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    showLoading();
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle the rest
  } catch (error) {
    hideLoading();
    console.error('Login error:', error);

    // Fallback to Demo Mode if auth fails (e.g. user not found or auth not enabled)
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/configuration-not-found') {
      if (confirm('Authentication failed. Would you like to enter Demo Mode instead?')) {
        console.log('⚠️ Switching to Demo Mode');
        currentUser = {
          uid: 'demo-user-' + Date.now(),
          email: email,
          emailVerified: true
        };
        await loadUserProfile(currentUser.uid);
        return;
      }
    }

    showError('loginError', `Error: ${error.message} (${error.code})`);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  hideError('registerError');

  const firstName = document.getElementById('regFirstName').value;
  const lastName = document.getElementById('regLastName').value;
  const email = document.getElementById('regEmail').value;
  const phone = document.getElementById('regPhone').value;
  const address = document.getElementById('regAddress').value;
  const password = document.getElementById('regPassword').value;

  try {
    showLoading();

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      profile: {
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        address: address
      },
      role: 'client',
      companyId: companyConfig.companyId,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });

    // onAuthStateChanged will handle the rest
  } catch (error) {
    hideLoading();
    console.error('Registration error:', error);
    showError('registerError', getErrorMessage(error.code));
  }
}

// Logout Handler
async function handleLogout() {
  if (!confirm('Are you sure you want to logout?')) {
    return;
  }

  try {
    showLoading();
    await signOut(auth);
    // onAuthStateChanged will handle showing login screen
  } catch (error) {
    hideLoading();
    console.error('Logout error:', error);
    alert('Error logging out. Please try again.');
  }
}

// User Profile Functions
async function loadUserProfile(userId) {
  try {
    // DEMO MODE: If using demo user, just show dashboard immediately
    if (userId.startsWith('demo-user-')) {
      console.log('⚠️ Demo Mode: Using temporary profile');
      const welcomeMessage = document.getElementById('welcomeMessage');
      if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${currentUser.email.split('@')[0]}`;
      }
      showScreen('dashboard');
      hideLoading();
      return;
    }

    // First try to get user document by UID (document ID)
    let userDocRef = doc(db, 'users', userId);
    let userDoc = await getDoc(userDocRef);

    // If not found, try querying by userId field
    if (!userDoc.exists()) {
      const q = query(collection(db, 'users'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        userDoc = querySnapshot.docs[0];
        userDocRef = userDoc.ref;
      }
    }

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const profile = userData.profile || {};

      // Auto-assign mock account numbers and roles for test users
      const mockAccounts = {
        'skylupa@gmail.com': 'ABC-10001',
        'elizabeth@example.com': 'ABC-10002'
      };

      const adminUsers = ['controller@abcsecurity.com', 'admin@abcsecurity.com'];

      // Auto-assign account number
      if (!userData.accountNumber && mockAccounts[currentUser.email]) {
        console.log('🔗 Auto-assigning account number for test user:', currentUser.email);
        await setDoc(userDocRef, {
          accountNumber: mockAccounts[currentUser.email],
          accountLinkedAt: serverTimestamp()
        }, { merge: true });
        userData.accountNumber = mockAccounts[currentUser.email];
      }

      // Auto-assign admin role
      if (!userData.role && adminUsers.includes(currentUser.email)) {
        console.log('👑 Auto-assigning admin role to:', currentUser.email);
        await setDoc(userDocRef, {
          role: 'admin',
          roleAssignedAt: serverTimestamp()
        }, { merge: true });
        userData.role = 'admin';
      }

      // Update welcome message
      const welcomeMessage = document.getElementById('welcomeMessage');
      if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${profile.firstName || currentUser.email.split('@')[0]}`;
      }

      // Update account number display
      const accountNumberEl = document.getElementById('accountNumber');
      if (accountNumberEl) {
        if (userData.accountNumber) {
          accountNumberEl.textContent = userData.accountNumber;
          accountNumberEl.style.color = 'var(--color-success)';
        } else {
          accountNumberEl.textContent = 'Not Linked';
          accountNumberEl.style.color = '#888';
        }
      }

      // Update last login
      await setDoc(userDocRef, {
        lastLogin: serverTimestamp()
      }, { merge: true });

      showScreen('dashboard');
      hideLoading();
    } else {
      // User doesn't have a profile yet, create one
      console.log('Creating new user profile');
      await setDoc(doc(db, 'users', userId), {
        email: currentUser.email,
        profile: {
          firstName: currentUser.email.split('@')[0],
          lastName: '',
          phone: '',
          address: ''
        },
        role: 'client',
        companyId: companyConfig.companyId,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });

      // Update welcome message with email username
      const welcomeMessage = document.getElementById('welcomeMessage');
      if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${currentUser.email.split('@')[0]}`;
      }

      showScreen('dashboard');
      hideLoading();
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    // In demo mode, ignore errors and show dashboard
    if (currentUser && currentUser.uid.startsWith('demo-user-')) {
      showScreen('dashboard');
    } else {
      showError('loginError', 'Error loading profile. Please try again.');
    }
    hideLoading();
  }
}

// Emergency Button Handler
async function handleEmergencyButton(e) {
  const button = e.currentTarget;
  const emergencyType = button.dataset.type;

  const emergencyLabels = {
    panic: 'Armed Response',
    medical: 'Medical Emergency',
    fire: 'Fire & Rescue',
    technical: 'Technical Support'
  };

  const confirmed = confirm(
    `⚠️ CONFIRM ${emergencyLabels[emergencyType].toUpperCase()}\n\n` +
    `This will immediately alert the control room and dispatch assistance.\n\n` +
    `Press OK to confirm emergency.`
  );

  if (!confirmed) return;

  try {
    showLoading();

    // Get current location (REAL-TIME GPS)
    const location = await getCurrentLocation();

    // Get address from GPS coordinates using reverse geocoding
    const addressFromGPS = await reverseGeocodeLocation(location.latitude, location.longitude);

    // Get user data
    let userData = { profile: {} };

    // Only fetch real profile if NOT in demo mode
    if (!currentUser.uid.startsWith('demo-user-')) {
      let userDocRef = doc(db, 'users', currentUser.uid);
      let userDoc = await getDoc(userDocRef);

      // If not found by UID, try querying by userId field
      if (!userDoc.exists()) {
        const q = query(collection(db, 'users'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          userDoc = querySnapshot.docs[0];
        }
      }

      if (userDoc.exists()) {
        userData = userDoc.data();
      }
    } else {
      // Demo mode fallback
      userData.profile = {
        firstName: 'Demo',
        lastName: 'User',
        phone: '000-000-0000',
        address: 'Demo Address'
      };
    }

    // Create incident
    const incident = {
      type: emergencyType,
      status: 'pending',
      priority: (emergencyType === 'panic' || emergencyType === 'medical') ? 'critical' : 'high',
      userId: currentUser.uid,
      userEmail: currentUser.email,
      accountNumber: userData.accountNumber || 'Not Linked',
      userProfile: userData.profile || {},
      companyId: companyConfig.companyId,
      location: {
        coordinates: {
          lat: location.latitude,
          lng: location.longitude,
          accuracy: location.accuracy
        },
        address: addressFromGPS,
        timestamp: serverTimestamp()
      },
      timeline: [{
        timestamp: new Date(),
        action: 'incident_created',
        actor: 'client',
        note: `${emergencyLabels[emergencyType]} button pressed`
      }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'incidents'), incident);
    currentIncident = { id: docRef.id, ...incident };

    showIncidentScreen(emergencyType, docRef.id);
    hideLoading();

  } catch (error) {
    hideLoading();
    console.error('Error creating incident:', error);
    alert(`⚠️ Error creating emergency alert.\n\nDetails: ${error.message}\n\nPlease call the control room directly:\n${companyConfig.contact.phone}`);
  }
}

// Show Incident Screen
function showIncidentScreen(type, incidentId) {
  const emergencyLabels = {
    panic: '🚨 Armed Response',
    medical: '🏥 Medical Emergency',
    fire: '🔥 Fire & Rescue',
    technical: '🔧 Technical Support'
  };

  document.getElementById('incidentType').textContent = emergencyLabels[type];
  document.getElementById('incidentId').textContent = incidentId.substr(0, 8).toUpperCase();
  document.getElementById('incidentStatusText').textContent = 'Pending';
  document.getElementById('incidentTime').textContent = 'Just now';

  showScreen('incident');

  // Subscribe to incident updates
  const unsubscribe = onSnapshot(doc(db, 'incidents', incidentId), (doc) => {
    if (doc.exists()) {
      const incident = doc.data();
      updateIncidentScreen(incident);
    }
  });
}

// Update Incident Screen
function updateIncidentScreen(incident) {
  document.getElementById('incidentStatusText').textContent = incident.status || 'Pending';

  // Update Status Badge
  const statusBadge = document.getElementById('incidentStatus');
  if (incident.status === 'dispatched') {
    statusBadge.className = 'status-badge status-dispatched';
    statusBadge.innerHTML = '<span class="status-dot"></span> Unit En Route';

    const unitInfo = document.getElementById('unitInfo');
    unitInfo?.classList.remove('hidden');

    document.getElementById('unitName').textContent = incident.assignedUnit?.name || '-';
    document.getElementById('officerName').textContent = incident.assignedUnit?.officer || '-';
    document.getElementById('unitETA').textContent = incident.assignedUnit?.eta || '-';
  } else if (incident.status === 'resolved') {
    statusBadge.className = 'status-badge status-success';
    statusBadge.innerHTML = '✓ Resolved';
  }

  // Update Timeline / Communicator
  const timelineContainer = document.getElementById('incidentMap'); // Reusing map container for now as "Live Updates"
  if (timelineContainer) {
    timelineContainer.innerHTML = '';
    timelineContainer.style.background = '#111';
    timelineContainer.style.overflowY = 'auto';
    timelineContainer.style.padding = '15px';
    timelineContainer.style.display = 'flex';
    timelineContainer.style.flexDirection = 'column';
    timelineContainer.style.gap = '10px';

    const title = document.createElement('h4');
    title.textContent = '💬 Live Updates';
    title.style.color = '#888';
    title.style.marginBottom = '10px';
    timelineContainer.appendChild(title);

    if (incident.timeline) {
      incident.timeline.forEach(event => {
        const msg = document.createElement('div');
        msg.style.padding = '10px';
        msg.style.borderRadius = '8px';
        msg.style.fontSize = '0.9rem';

        const time = event.timestamp?.toDate ? event.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';

        if (event.actor === 'client') {
          msg.style.background = '#222';
          msg.style.alignSelf = 'flex-end';
          msg.style.border = '1px solid #333';
          msg.innerHTML = `<strong style="color: #D4AF37">You</strong> <span style="color: #666; font-size: 0.8em">(${time})</span><br>${event.note}`;
        } else {
          msg.style.background = 'rgba(212, 175, 55, 0.1)';
          msg.style.alignSelf = 'flex-start';
          msg.style.border = '1px solid rgba(212, 175, 55, 0.3)';
          msg.innerHTML = `<strong style="color: #fff">Control Room</strong> <span style="color: #666; font-size: 0.8em">(${time})</span><br>${event.note}`;
        }
        timelineContainer.appendChild(msg);
      });
      // Scroll to bottom
      timelineContainer.scrollTop = timelineContainer.scrollHeight;
    }
  }
}

// 🔕 GHOST PANIC - Revolutionary Invisible Panic Feature
// Sends alert to control room but COMPLETELY closes app (returns to home screen)
// NO visual feedback on phone - appears as if user just closed the app
// CRITICAL for situations where attacker is watching the phone
async function triggerGhostPanic() {
  try {
    console.log('👻 GHOST PANIC ACTIVATED');

    // Get current location silently (no UI updates)
    let location;
    try {
      location = await getCurrentLocation();
    } catch (error) {
      console.error('Ghost Panic: Location error (continuing anyway):', error);
      location = { latitude: 0, longitude: 0, accuracy: 0 };
    }

    // Get address from GPS silently
    let addressFromGPS = 'Location unavailable';
    if (location.latitude !== 0 && location.longitude !== 0) {
      try {
        addressFromGPS = await reverseGeocodeLocation(location.latitude, location.longitude);
      } catch (error) {
        console.error('Ghost Panic: Geocoding error (continuing anyway):', error);
        addressFromGPS = `GPS: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
      }
    }

    // Get user data silently
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};

    // Create GHOST PANIC incident in Firebase
    const incident = {
      type: 'ghost-panic',
      ghostMode: true, // Special flag for control room to know this is ghost panic
      status: 'pending',
      priority: 'critical', // HIGHEST priority
      userId: currentUser.uid,
      userEmail: currentUser.email,
      accountNumber: userData.accountNumber || 'Not Linked',
      userProfile: userData.profile || {},
      companyId: companyConfig.companyId,
      location: {
        coordinates: {
          lat: location.latitude,
          lng: location.longitude,
          accuracy: location.accuracy
        },
        address: addressFromGPS,
        timestamp: serverTimestamp()
      },
      timeline: [{
        timestamp: new Date(),
        action: 'ghost_panic_activated',
        actor: 'client',
        note: '👻 GHOST PANIC - Client activated invisible panic (app closed on their device)'
      }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Send to Firebase (fire and forget - don't wait for response)
    addDoc(collection(db, 'incidents'), incident).catch(err => {
      console.error('Ghost Panic: Firebase error:', err);
    });

    // IMMEDIATELY close app and return to home screen
    // Multiple methods to ensure it works across different browsers/devices

    // Method 1: Close current window (works in PWA)
    if (window.opener) {
      window.close();
    }

    // Method 2: Navigate away from app (works on iOS Safari)
    window.location.href = 'about:blank';

    // Method 3: Go back to previous page (fallback)
    setTimeout(() => {
      window.history.back();
    }, 100);

  } catch (error) {
    console.error('Ghost Panic: Critical error:', error);
    // Even if there's an error, still try to close the app
    window.location.href = 'about:blank';
  }
}

// Cancel Incident
async function cancelIncident() {
  if (!currentIncident) return;

  if (!confirm('Cancel this emergency?\n\nThis should only be done for false alarms.')) {
    return;
  }

  try {
    await setDoc(doc(db, 'incidents', currentIncident.id), {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      cancelledBy: currentUser.uid,
      timeline: [
        ...(currentIncident.timeline || []),
        {
          timestamp: new Date(),
          action: 'incident_cancelled',
          actor: 'client',
          note: 'Cancelled by user (false alarm)'
        }
      ],
      updatedAt: serverTimestamp()
    }, { merge: true });

    alert('✓ Emergency cancelled');
    showScreen('dashboard');
    currentIncident = null;
  } catch (error) {
    console.error('Error cancelling incident:', error);
    alert('Error cancelling emergency. Please call the control room.');
  }
}

// Location Functions
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
        console.warn('Geolocation error:', error);
        // Use default location if GPS fails
        resolve({
          latitude: 0,
          longitude: 0,
          accuracy: 0
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

// Reverse Geocoding - Convert GPS coordinates to DETAILED address with house number
async function reverseGeocodeLocation(lat, lng) {
  try {
    console.log('🔍 REVERSE GEOCODING:', lat, lng);

    // Use OpenStreetMap Nominatim API with addressdetails for structured address
    // Using zoom=19 for maximum precision to get house numbers
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=19&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ABC-Security-Emergency-Response-App'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    console.log('📍 Geocoding Response:', data);

    if (data && data.address) {
      // Construct detailed address from components
      const addr = data.address;
      console.log('🏠 Address Components:', addr);

      const parts = [];

      // House number + street (most important for emergency response)
      if (addr.house_number) {
        console.log('✅ House number found:', addr.house_number);
        parts.push(addr.house_number);
      } else {
        console.warn('⚠️ No house number in geocoding data');
      }

      if (addr.road) parts.push(addr.road);
      else if (addr.street) parts.push(addr.street);

      // Suburb/neighborhood
      if (addr.suburb) parts.push(addr.suburb);
      else if (addr.neighbourhood) parts.push(addr.neighbourhood);
      else if (addr.residential) parts.push(addr.residential);

      // City
      if (addr.city) parts.push(addr.city);
      else if (addr.town) parts.push(addr.town);
      else if (addr.village) parts.push(addr.village);

      // Province/State
      if (addr.state) parts.push(addr.state);

      // Postal code
      if (addr.postcode) parts.push(addr.postcode);

      // If we got structured address, use it
      if (parts.length > 0) {
        const finalAddress = parts.join(', ');
        console.log('✅ Final Address:', finalAddress);
        return finalAddress;
      }

      // Otherwise use full display_name
      if (data.display_name) {
        console.log('⚠️ Using display_name:', data.display_name);
        return data.display_name;
      }
    }

    // Fallback to coordinates if no address found
    console.warn('⚠️ No address found, using coordinates');
    return `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;

  } catch (error) {
    console.error('❌ Reverse geocoding error:', error);
    // Fallback to coordinates
    return `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

// Incident Report Handlers
let selectedCategory = null;

const categoryLabels = {
  'suspicious-behaviour': 'Suspicious Behaviour',
  'noise-complaint': 'Noise Complaint',
  'vandalism': 'Vandalism / Property Damage',
  'trespassing': 'Trespassing',
  'lost-found': 'Lost & Found',
  'traffic-incident': 'Traffic Incident',
  'other': 'Other'
};

function handleCategorySelection(e) {
  const button = e.currentTarget;
  selectedCategory = button.dataset.category;

  // Update the category display
  const categoryDisplay = document.getElementById('reportCategory');
  if (categoryDisplay) {
    categoryDisplay.textContent = categoryLabels[selectedCategory];
  }

  // Clear the form
  document.getElementById('reportDetails').value = '';
  document.getElementById('reportLocation').value = '';
  hideError('reportError');

  // Show the details screen
  showScreen('incidentReportDetails');
}

async function handleIncidentReportSubmit(e) {
  e.preventDefault();
  hideError('reportError');

  const details = document.getElementById('reportDetails').value;
  const location = document.getElementById('reportLocation').value;

  if (!selectedCategory) {
    showError('reportError', 'Please select a category');
    return;
  }

  if (!details.trim()) {
    showError('reportError', 'Please describe what you observed');
    return;
  }

  try {
    showLoading();

    // Get current GPS location
    const gpsLocation = await getCurrentLocation();
    const addressFromGPS = await reverseGeocodeLocation(gpsLocation.latitude, gpsLocation.longitude);

    // Get user data
    let userData = { profile: {} };

    if (!currentUser.uid.startsWith('demo-user-')) {
      let userDocRef = doc(db, 'users', currentUser.uid);
      let userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const q = query(collection(db, 'users'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          userDoc = querySnapshot.docs[0];
        }
      }

      if (userDoc.exists()) {
        userData = userDoc.data();
      }
    } else {
      userData.profile = {
        firstName: 'Demo',
        lastName: 'User',
        phone: '000-000-0000',
        address: 'Demo Address'
      };
    }

    // Create incident report
    const report = {
      type: 'incident-report',
      category: selectedCategory,
      categoryLabel: categoryLabels[selectedCategory],
      reportCategory: categoryLabels[selectedCategory], // For control room display
      reportDescription: details, // For control room display
      reportLocation: location || '', // Specific location if provided
      status: 'pending',
      priority: 'low',
      userId: currentUser.uid,
      userEmail: currentUser.email,
      accountNumber: userData.accountNumber || 'Not Linked',
      userProfile: userData.profile || {},
      companyId: companyConfig.companyId,
      details: details,
      location: {
        coordinates: {
          lat: gpsLocation.latitude,
          lng: gpsLocation.longitude,
          accuracy: gpsLocation.accuracy
        },
        address: addressFromGPS, // GPS-based address
        timestamp: serverTimestamp()
      },
      timeline: [{
        timestamp: new Date(),
        action: 'report_created',
        actor: 'client',
        note: `Incident report submitted: ${categoryLabels[selectedCategory]}`
      }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await addDoc(collection(db, 'incidents'), report);

    hideLoading();
    alert('✓ Report Submitted\n\nYour incident report has been received by the control room. You will be contacted if additional information is needed.');

    // Reset and go back to dashboard
    selectedCategory = null;
    document.getElementById('reportDetails').value = '';
    document.getElementById('reportLocation').value = '';
    showScreen('dashboard');

  } catch (error) {
    hideLoading();
    console.error('Error submitting report:', error);
    showError('reportError', 'Error submitting report. Please try again.');
  }
}

// Voice Input Handler
function handleVoiceInput() {
  const textarea = document.getElementById('reportDetails');
  const statusEl = document.getElementById('voiceStatus');
  const btn = document.getElementById('voiceInputBtn');

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  statusEl.textContent = '🎤 Listening... Speak now';
  statusEl.style.display = 'block';
  btn.disabled = true;
  btn.textContent = '🎤 Listening...';

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    textarea.value = transcript;
    statusEl.textContent = '✓ Voice input complete';
    statusEl.style.color = '#34C759';
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    statusEl.textContent = '✗ Error: ' + event.error;
    statusEl.style.color = '#FF3B30';
  };

  recognition.onend = () => {
    btn.disabled = false;
    btn.textContent = '🎤 Use Voice Input';
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  };

  recognition.start();
}

// Incident History Functions
async function loadIncidentHistory() {
  const container = document.getElementById('historyContainer');
  const loadingEl = document.getElementById('historyLoading');
  const noHistoryEl = document.getElementById('noHistoryMessage');

  // Show loading
  container.innerHTML = '';
  loadingEl.classList.remove('hidden');
  noHistoryEl.classList.add('hidden');

  try {
    // Query user's incidents ordered by creation date (newest first)
    const q = query(
      collection(db, 'incidents'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    // Hide loading
    loadingEl.classList.add('hidden');

    if (querySnapshot.empty) {
      noHistoryEl.classList.remove('hidden');
      return;
    }

    // Render incidents
    querySnapshot.forEach((doc) => {
      const incident = { id: doc.id, ...doc.data() };
      const incidentCard = createHistoryCard(incident);
      container.appendChild(incidentCard);
    });

  } catch (error) {
    console.error('Error loading incident history:', error);
    loadingEl.classList.add('hidden');
    container.innerHTML = `
      <div class="card card-metallic" style="text-align: center; padding: 2rem; color: var(--color-danger);">
        <h3>Error Loading History</h3>
        <p>${error.message}</p>
        <button class="btn btn-secondary" onclick="loadIncidentHistory()" style="margin-top: 1rem;">
          Try Again
        </button>
      </div>
    `;
  }
}

function createHistoryCard(incident) {
  const card = document.createElement('div');
  card.className = 'card card-metallic';
  card.style.marginBottom = '1rem';

  // Type labels and colors
  const typeConfig = {
    'panic': { label: '🚨 PANIC!!!!', color: '#FF3B30' },
    'ghost-panic': { label: '⚠️ GHOST ALARM', color: '#8B0000' },
    'medical': { label: '🏥 MEDICAL ASSISTANCE', color: '#007AFF' },
    'fire': { label: '🔥 FIRE & RESCUE', color: '#FF9500' },
    'technical': { label: '🔧 TECHNICAL DEPARTMENT', color: '#888' },
    'incident-report': { label: '📋 INCIDENT REPORT', color: '#9B59B6' }
  };

  const config = typeConfig[incident.type] || { label: incident.type, color: '#666' };

  // Status badges
  const statusConfig = {
    'pending': { label: '⏳ Pending', color: '#FF9500' },
    'dispatched': { label: '🚔 Dispatched', color: '#007AFF' },
    'resolved': { label: '✓ Resolved', color: '#34C759' },
    'cancelled': { label: '✕ Cancelled', color: '#888' }
  };

  const status = statusConfig[incident.status] || { label: incident.status, color: '#666' };

  // Format timestamp
  const timestamp = incident.createdAt?.toDate ? incident.createdAt.toDate() : new Date();
  const timeStr = timestamp.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Build report details if it's an incident report
  const reportDetails = incident.type === 'incident-report' ? `
    <div style="background: rgba(155,89,182,0.1); border: 1px solid rgba(155,89,182,0.3); border-radius: 8px; padding: 10px; margin-top: 10px;">
      <div style="font-weight: 600; color: #9B59B6; font-size: 0.85rem;">
        ${incident.reportCategory || incident.categoryLabel || 'Unknown Category'}
      </div>
      <div style="color: var(--color-silver); font-size: 0.8rem; margin-top: 5px;">
        ${incident.reportDescription || incident.details || 'No description'}
      </div>
    </div>
  ` : '';

  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
      <div>
        <div style="font-weight: 700; color: ${config.color}; font-size: 0.95rem;">
          ${config.label}
        </div>
        <div style="color: var(--color-silver); font-size: 0.75rem; margin-top: 4px;">
          ${timeStr}
        </div>
      </div>
      <div style="background: ${status.color}; color: #000; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
        ${status.label}
      </div>
    </div>

    ${reportDetails}

    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
      <div style="color: var(--color-silver); font-size: 0.8rem;">
        <strong>Location:</strong> ${incident.location?.address || 'No address'}
      </div>
      <div style="color: var(--color-silver); font-size: 0.75rem; margin-top: 4px;">
        ID: ${incident.id.substr(0, 8).toUpperCase()}
      </div>
    </div>
  `;

  return card;
}

// Error Messages
function getErrorMessage(errorCode) {
  const errorMessages = {
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later'
  };

  return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

// Make loadIncidentHistory available globally for inline onclick
window.loadIncidentHistory = loadIncidentHistory;

// ==================== EMERGENCY CONTACTS ====================
let emergencyContacts = [];

async function loadEmergencyContacts() {
  try {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists()) {
      emergencyContacts = userDoc.data().emergencyContacts || [];
      displayEmergencyContacts();
    }
  } catch (error) {
    console.error('Error loading emergency contacts:', error);
  }
}

function displayEmergencyContacts() {
  const container = document.getElementById('contactsList');
  const noContactsMsg = document.getElementById('noContactsMessage');

  if (emergencyContacts.length === 0) {
    container.innerHTML = '';
    noContactsMsg.classList.remove('hidden');
    return;
  }

  noContactsMsg.classList.add('hidden');
  container.innerHTML = emergencyContacts.map((contact, index) => `
    <div class="card card-metallic" style="margin-bottom: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div style="flex: 1;">
          <h4 style="color: var(--color-bronze); margin: 0 0 0.5rem 0;">${contact.name}</h4>
          <p style="color: var(--color-silver); font-size: 0.875rem; margin: 0.25rem 0;">📱 ${contact.phone}</p>
          <p style="color: var(--color-silver); font-size: 0.875rem; margin: 0.25rem 0;">👤 ${contact.relationship}</p>
        </div>
        <button onclick="deleteContact(${index})" class="btn btn-danger" style="padding: 0.5rem 1rem;">
          🗑️ Delete
        </button>
      </div>
    </div>
  `).join('');
}

async function handleAddContact(e) {
  e.preventDefault();

  const name = document.getElementById('contactName').value;
  const phone = document.getElementById('contactPhone').value;
  const relationship = document.getElementById('contactRelationship').value;

  const newContact = { name, phone, relationship };
  emergencyContacts.push(newContact);

  try {
    await setDoc(doc(db, 'users', currentUser.uid), {
      emergencyContacts: emergencyContacts
    }, { merge: true });

    document.getElementById('addContactForm').reset();
    displayEmergencyContacts();
    alert(`✓ Contact Added\n\n${name} will be notified during emergencies.`);
  } catch (error) {
    console.error('Error adding contact:', error);
    emergencyContacts.pop();
    alert('Error adding contact. Please try again.');
  }
}

window.deleteContact = async function(index) {
  if (!confirm(`Delete ${emergencyContacts[index].name}?`)) return;

  emergencyContacts.splice(index, 1);

  try {
    await setDoc(doc(db, 'users', currentUser.uid), {
      emergencyContacts: emergencyContacts
    }, { merge: true });

    displayEmergencyContacts();
    alert('✓ Contact deleted');
  } catch (error) {
    console.error('Error deleting contact:', error);
    alert('Error deleting contact. Please try again.');
  }
};

// ==================== ALERT MY FAMILY ====================
async function alertMyFamily() {
  try {
    // Load emergency contacts first
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const contacts = userDoc.exists() ? (userDoc.data().emergencyContacts || []) : [];

    if (contacts.length === 0) {
      if (confirm('No emergency contacts found.\n\nWould you like to add some now?')) {
        showScreen('emergencyContacts');
        loadEmergencyContacts();
      }
      return;
    }

    if (!confirm(`⚠️ ALERT MY FAMILY\n\nThis will send SMS alerts to ${contacts.length} emergency contact(s):\n${contacts.map(c => `• ${c.name}`).join('\n')}\n\nContinue?`)) {
      return;
    }

    showLoading();

    // Get current location
    const location = await getCurrentLocation();
    const address = await reverseGeocodeLocation(location.latitude, location.longitude);

    // Create family alert incident
    const familyAlert = {
      type: 'family-alert',
      status: 'pending',
      priority: 'high',
      userId: currentUser.uid,
      userEmail: currentUser.email,
      emergencyContacts: contacts,
      location: {
        coordinates: {
          lat: location.latitude,
          lng: location.longitude,
          accuracy: location.accuracy
        },
        address: address,
        timestamp: serverTimestamp()
      },
      message: `EMERGENCY ALERT: ${currentUser.email} has activated Family Alert`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await addDoc(collection(db, 'familyAlerts'), familyAlert);

    hideLoading();
    alert(`✓ Family Alert Sent!\n\nYour emergency contacts have been notified:\n${contacts.map(c => `• ${c.name} (${c.phone})`).join('\n')}\n\nControl Room has also been alerted.`);

  } catch (error) {
    hideLoading();
    console.error('Error sending family alert:', error);
    alert('Error sending family alert. Please call your contacts manually.');
  }
}

// ==================== LIVE LOCATION SHARING ====================
let locationSharingActive = false;
let locationInterval = null;

async function loadLocationStatus() {
  const statusEl = document.getElementById('locationStatus');
  const iconEl = document.getElementById('locationIcon');
  const btn = document.getElementById('toggleLocationBtn');

  if (locationSharingActive) {
    statusEl.textContent = '🟢 Sharing location every 30 seconds';
    statusEl.style.color = '#34C759';
    iconEl.textContent = '📍✅';
    btn.textContent = '🛑 STOP SHARING';
    btn.style.background = '#FF3B30';
    btn.style.color = '#fff';
    btn.style.fontWeight = '700';
    updateCurrentLocationDisplay();
  } else {
    statusEl.textContent = 'Not active';
    statusEl.style.color = '#888';
    iconEl.textContent = '📍';
    btn.textContent = '📍 START SHARING LOCATION';
    btn.style.background = '#D4AF37';
    btn.style.color = '#000';
    btn.style.fontWeight = '700';
  }
}

async function toggleLiveLocation() {
  if (locationSharingActive) {
    // Stop sharing
    locationSharingActive = false;
    if (locationInterval) {
      clearInterval(locationInterval);
      locationInterval = null;
    }

    // Update Firebase
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        liveLocation: {
          active: false,
          stoppedAt: serverTimestamp()
        }
      }, { merge: true });
    } catch (error) {
      console.error('Error stopping location sharing:', error);
    }

    alert('✓ Location sharing stopped');
    loadLocationStatus();
  } else {
    // Start sharing
    if (!confirm('📍 Share Live Location\n\nControl Room will see your real-time GPS position every 30 seconds.\n\nThis is useful when:\n• Walking alone at night\n• Entering unfamiliar areas\n• During emergencies\n\nContinue?')) {
      return;
    }

    locationSharingActive = true;
    shareLocationNow(); // Share immediately

    // Then share every 30 seconds
    locationInterval = setInterval(shareLocationNow, 30000);

    alert('✓ Location sharing started\n\nControl Room can now track your movement in real-time.');
    loadLocationStatus();
  }
}

async function shareLocationNow() {
  try {
    const location = await getCurrentLocation();
    const address = await reverseGeocodeLocation(location.latitude, location.longitude);

    await setDoc(doc(db, 'users', currentUser.uid), {
      liveLocation: {
        active: true,
        userEmail: currentUser.email,
        coordinates: {
          lat: location.latitude,
          lng: location.longitude,
          accuracy: location.accuracy
        },
        address: address,
        timestamp: serverTimestamp()
      }
    }, { merge: true });

    // Also add to location trail
    await addDoc(collection(db, 'locationTrail'), {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      coordinates: {
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy
      },
      address: address,
      timestamp: serverTimestamp()
    });

    updateCurrentLocationDisplay();
    console.log('✓ Location shared:', address);
  } catch (error) {
    console.error('Error sharing location:', error);
  }
}

async function updateCurrentLocationDisplay() {
  const container = document.getElementById('currentLocationInfo');
  try {
    const location = await getCurrentLocation();
    const address = await reverseGeocodeLocation(location.latitude, location.longitude);

    container.innerHTML = `
      <div style="color: var(--color-silver); font-size: 0.875rem; line-height: 1.6;">
        <p style="margin: 0.5rem 0;"><strong style="color: var(--color-bronze);">📍 Address:</strong><br>${address}</p>
        <p style="margin: 0.5rem 0;"><strong style="color: var(--color-bronze);">🌐 GPS:</strong><br>Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}</p>
        <p style="margin: 0.5rem 0;"><strong style="color: var(--color-bronze);">🎯 Accuracy:</strong> ${Math.round(location.accuracy)}m</p>
        <p style="margin: 0.5rem 0; color: var(--color-success);">✓ Last updated: ${new Date().toLocaleTimeString()}</p>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `<p style="color: var(--color-danger);">Error getting location</p>`;
  }
}

// ==================== ACCOUNT LINKING ====================
async function linkAccount() {
  const accountNumber = prompt('🔗 Link Your Account\n\nEnter your ABC Security account number:\n(e.g., ABC-12345)');

  if (!accountNumber) return;

  // Validate account number format
  if (!accountNumber.match(/^ABC-\d{5}$/)) {
    alert('❌ Invalid Format\n\nAccount number must be in format: ABC-12345\n\nPlease try again.');
    return;
  }

  try {
    showLoading();

    await setDoc(doc(db, 'users', currentUser.uid), {
      accountNumber: accountNumber,
      accountLinkedAt: serverTimestamp()
    }, { merge: true });

    hideLoading();

    // Update display
    const accountNumberEl = document.getElementById('accountNumber');
    if (accountNumberEl) {
      accountNumberEl.textContent = accountNumber;
      accountNumberEl.style.color = 'var(--color-success)';
    }

    alert(`✓ Account Linked!\n\nYour account ${accountNumber} has been successfully linked.\n\nControl Room can now identify you by your account number.`);

  } catch (error) {
    hideLoading();
    console.error('Error linking account:', error);
    alert('❌ Error linking account. Please try again.');
  }
}

// ==================== SAFETY CHECK-IN ====================
let checkInActive = false;
let checkInTimer = null;
let checkInTimeout = null;

async function loadCheckInStatus() {
  const statusEl = document.getElementById('checkInStatus');
  const iconEl = document.getElementById('checkInIcon');
  const btn = document.getElementById('toggleCheckInBtn');

  if (checkInActive) {
    const interval = document.getElementById('checkInInterval').value;
    statusEl.textContent = `🟢 Active - Checking every ${interval} min`;
    iconEl.textContent = '✅';
    btn.textContent = '🛑 Stop Check-In';
    btn.style.background = 'var(--color-danger)';
    btn.style.color = '#fff';
  } else {
    statusEl.textContent = 'Inactive';
    iconEl.textContent = '⏸️';
    btn.textContent = '🟢 Start Check-In';
    btn.style.background = 'var(--color-success)';
    btn.style.color = '#fff';
  }
}

async function toggleCheckIn() {
  if (checkInActive) {
    // Stop check-in
    checkInActive = false;
    if (checkInTimer) clearInterval(checkInTimer);
    if (checkInTimeout) clearTimeout(checkInTimeout);
    checkInTimer = null;
    checkInTimeout = null;

    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        safetyCheckIn: {
          active: false,
          stoppedAt: serverTimestamp()
        }
      }, { merge: true });
    } catch (error) {
      console.error('Error stopping check-in:', error);
    }

    alert('✓ Safety check-in stopped');
    loadCheckInStatus();
  } else {
    // Start check-in
    const interval = parseInt(document.getElementById('checkInInterval').value);
    const gracePeriod = parseInt(document.getElementById('checkInGracePeriod').value);

    if (!confirm(`✓ Start Safety Check-In\n\nYou will be asked to check in every ${interval} minutes.\n\nIf you don't respond within ${gracePeriod} minutes, an alert will be sent to Control Room and your emergency contacts.\n\nContinue?`)) {
      return;
    }

    checkInActive = true;

    // Start check-in timer
    checkInTimer = setInterval(() => {
      requestCheckIn(gracePeriod);
    }, interval * 60 * 1000);

    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        safetyCheckIn: {
          active: true,
          interval: interval,
          gracePeriod: gracePeriod,
          startedAt: serverTimestamp()
        }
      }, { merge: true });
    } catch (error) {
      console.error('Error starting check-in:', error);
    }

    alert(`✓ Safety check-in started\n\nYou'll receive your first check-in notification in ${interval} minutes.`);
    loadCheckInStatus();
  }
}

function requestCheckIn(gracePeriod) {
  const response = confirm('✓ SAFETY CHECK-IN\n\nAre you safe?\n\nPress OK to confirm you are safe.\n\nIf you do not respond within ${gracePeriod} minutes, an alert will be sent.');

  if (response) {
    // User confirmed safety
    recordCheckIn(true);
  } else {
    // User needs help or timeout
    checkInTimeout = setTimeout(() => {
      sendCheckInAlert();
    }, gracePeriod * 60 * 1000);
  }
}

async function recordCheckIn(safe) {
  try {
    await addDoc(collection(db, 'checkIns'), {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      safe: safe,
      timestamp: serverTimestamp()
    });

    if (safe) {
      console.log('✓ Check-in recorded: User is safe');
    }
  } catch (error) {
    console.error('Error recording check-in:', error);
  }
}

async function sendCheckInAlert() {
  try {
    const location = await getCurrentLocation();
    const address = await reverseGeocodeLocation(location.latitude, location.longitude);

    const alert = {
      type: 'missed-checkin',
      status: 'pending',
      priority: 'critical',
      userId: currentUser.uid,
      userEmail: currentUser.email,
      location: {
        coordinates: {
          lat: location.latitude,
          lng: location.longitude,
          accuracy: location.accuracy
        },
        address: address,
        timestamp: serverTimestamp()
      },
      message: 'User failed to respond to safety check-in',
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'incidents'), alert);

    alert('⚠️ MISSED CHECK-IN ALERT SENT\n\nControl Room and your emergency contacts have been notified that you did not respond to your safety check-in.');
  } catch (error) {
    console.error('Error sending check-in alert:', error);
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
