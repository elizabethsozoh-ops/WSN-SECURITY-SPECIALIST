// ABC Security - Production Version with Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, setDoc, doc, getDoc, getDocs, query, where, orderBy, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

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
const storage = getStorage(app);

// App State
let currentUser = null;
let currentIncident = null;
let reportUploadedFiles = []; // Files uploaded in report form
let incidentUploadedFiles = []; // Files uploaded in incident tracking

// Company Config
const companyConfig = {
  companyId: "wsn-group",
  displayName: "abc security",
  tagline: "Powered by WSN Security Specialist",
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
    if (user) {
      currentUser = user;
      loadUserProfile(user.uid);
    } else {
      currentUser = null;
      showScreen('login');
      hideLoading();
    }
  });

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
  const screens = ['loginScreen', 'registerScreen', 'dashboardScreen', 'incidentScreen', 'reportScreen'];
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
  console.log('✅ Setting up event listeners...');
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

  // Ghost Panic Button
  document.getElementById('ghostPanicBtn')?.addEventListener('click', handleGhostPanic);

  // Logout button
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

  // Safety Tools
  document.getElementById('liveLocationBtn')?.addEventListener('click', handleLiveLocation);
  document.getElementById('alertFamilyBtn')?.addEventListener('click', handleAlertFamily);
  document.getElementById('safetyCheckBtn')?.addEventListener('click', handleSafetyCheck);
  document.getElementById('manageContactsBtn')?.addEventListener('click', handleManageContacts);

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

  // Incident Report Handlers
  document.getElementById('fileUploadContainer')?.addEventListener('click', () => {
    document.getElementById('reportFiles').click();
  });

  document.getElementById('reportFiles')?.addEventListener('change', handleFileSelect);
  document.getElementById('incidentReportForm')?.addEventListener('submit', handleReportSubmit);
  document.getElementById('cancelReportBtn')?.addEventListener('click', () => {
    showScreen('dashboard');
  });
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

      // Update welcome message
      const welcomeMessage = document.getElementById('welcomeMessage');
      if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${profile.firstName || currentUser.email.split('@')[0]}`;
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
  console.log('🚨 Emergency button clicked:', e);
  const button = e.currentTarget;
  const emergencyType = button.dataset.type;
  console.log('Emergency type:', emergencyType);

  // Handle Incident Report separately
  if (emergencyType === 'incident-report') {
    showReportScreen();
    return;
  }

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

// Ghost Panic Handler
async function handleGhostPanic() {
  console.log('👻 Ghost Panic activated!');
  // NO CONFIRMATION - Silent and immediate
  try {
    // 1. Get location silently
    const location = await getCurrentLocation();

    // 2. Create silent incident
    const incident = {
      type: 'ghost-panic', // Special type for control room
      status: 'pending',
      priority: 'critical',
      userId: currentUser.uid,
      userEmail: currentUser.email,
      companyId: companyConfig.companyId,
      location: {
        coordinates: {
          lat: location.latitude,
          lng: location.longitude,
          accuracy: location.accuracy
        },
        // Don't wait for address reverse geocoding to be faster
        address: `GPS: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
        timestamp: serverTimestamp()
      },
      timeline: [{
        timestamp: new Date(),
        action: 'ghost_panic_activated',
        actor: 'client',
        note: 'GHOST PANIC ACTIVATED - SILENT ALARM'
      }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // 3. Send to Firebase
    await addDoc(collection(db, 'incidents'), incident);

    // 4. "Close" the app immediately
    // We can't actually close the browser tab via JS usually, so we simulate it
    // by replacing the body with a generic error or blank page to look like a crash/exit
    document.body.innerHTML = '';
    document.body.style.background = '#000';

    // Optional: Redirect to Google or generic page
    window.location.href = 'https://www.google.com';

  } catch (error) {
    console.error('Ghost panic error:', error);
    // Even if error, try to close/hide app
    window.location.href = 'https://www.google.com';
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

// Incident Report Functions
function showReportScreen() {
  // Auto-fill location
  const locationInput = document.getElementById('reportLocation');
  if (locationInput) {
    locationInput.value = 'Fetching location...';
    getCurrentLocation().then(async (loc) => {
      const address = await reverseGeocodeLocation(loc.latitude, loc.longitude);
      locationInput.value = address;
    }).catch(err => {
      console.error('Location error:', err);
      locationInput.value = 'Location unavailable';
    });
  }

  showScreen('report');
}

let selectedFiles = [];

async function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  if (files.length > 0) {
    await handleReportFileSelection(files);
  }
}

async function handleReportSubmit(e) {
  e.preventDefault();
  hideError('reportError');

  const category = document.getElementById('reportCategory').value;
  const description = document.getElementById('reportDescription').value;
  const locationText = document.getElementById('reportLocation').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if (!category) {
    showError('reportError', 'Please select a category');
    return;
  }

  try {
    showLoading();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting Report...';

    // Get Coordinates
    const location = await getCurrentLocation();

    // Create Incident with uploaded files
    const incident = {
      type: 'incident-report',
      reportCategory: category,
      reportDescription: description,
      status: 'pending',
      priority: 'medium',
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userProfile: {
        firstName: currentUser.displayName?.split(' ')[0] || '',
        lastName: currentUser.displayName?.split(' ')[1] || '',
        phone: currentUser.phoneNumber || ''
      },
      companyId: companyConfig.companyId,
      location: {
        coordinates: {
          lat: location.latitude,
          lng: location.longitude,
          accuracy: location.accuracy
        },
        address: await getAddressFromCoordinates(location.latitude, location.longitude),
        timestamp: serverTimestamp()
      },
      reportLocation: locationText,
      attachments: reportUploadedFiles, // Use new upload array
      timeline: [{
        timestamp: new Date(),
        action: 'report_submitted',
        actor: 'client',
        note: `Report submitted: ${category}`
      }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'incidents'), incident);

    // Reset form and upload state
    document.getElementById('incidentReportForm').reset();
    document.getElementById('filePreview').innerHTML = '';
    document.getElementById('filePreview').classList.add('hidden');
    reportUploadedFiles = []; // Reset uploaded files
    selectedFiles = [];

    alert('✓ Report submitted successfully');
    showScreen('dashboard');

  } catch (error) {
    console.error('Report error:', error);
    showError('reportError', 'Error submitting report: ' + error.message);
  } finally {
    hideLoading();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Report';
  }
}

// Safety Tool Functions
let liveLocationWatchId = null;
let liveShareId = null;

async function handleLiveLocation() {
  const btn = document.getElementById('liveLocationBtn');

  if (liveLocationWatchId) {
    // STOP SHARING
    navigator.geolocation.clearWatch(liveLocationWatchId);
    liveLocationWatchId = null;

    if (liveShareId) {
      await setDoc(doc(db, 'live_shares', liveShareId), {
        active: false,
        endedAt: serverTimestamp()
      }, { merge: true });
      liveShareId = null;
    }

    btn.innerHTML = '📍 SHARE LIVE LOCATION';
    btn.style.background = 'linear-gradient(135deg, #004d40 0%, #000000 100%)';
    btn.classList.remove('pulse-animation');
    alert('Live location sharing stopped.');

  } else {
    // START SHARING
    if (!confirm('Start sharing your real-time location with the control room and emergency contacts?')) return;

    try {
      showLoading();

      // Create share session
      const shareDoc = await addDoc(collection(db, 'live_shares'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        startTime: serverTimestamp(),
        active: true,
        locations: []
      });
      liveShareId = shareDoc.id;

      // Start watching
      liveLocationWatchId = navigator.geolocation.watchPosition(
        async (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          };

          // Update Firestore (append to array)
          // Note: In a real app, we might overwrite the "current" location to save writes
          // But for history, we append.
          await setDoc(doc(db, 'live_shares', liveShareId), {
            currentLocation: loc,
            lastUpdated: serverTimestamp()
          }, { merge: true });
        },
        (error) => console.error('Location watch error:', error),
        { enableHighAccuracy: true }
      );

      hideLoading();
      btn.innerHTML = '🛑 STOP SHARING LOCATION';
      btn.style.background = 'linear-gradient(135deg, #b71c1c 0%, #000000 100%)';
      btn.classList.add('pulse-animation');
      alert('✅ Live location sharing ACTIVE. Control room can see you.');

    } catch (error) {
      hideLoading();
      console.error('Live location error:', error);
      alert('Error starting live location: ' + error.message);
    }
  }
}

async function handleAlertFamily() {
  if (!confirm('Send distress alert to your Emergency Contacts?')) return;

  try {
    showLoading();
    const location = await getCurrentLocation();
    const address = await reverseGeocodeLocation(location.latitude, location.longitude);

    await addDoc(collection(db, 'family_alerts'), {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      location: {
        lat: location.latitude,
        lng: location.longitude,
        address: address
      },
      timestamp: serverTimestamp(),
      status: 'sent'
    });

    hideLoading();
    alert('✅ Distress alert sent to all emergency contacts!');

  } catch (error) {
    hideLoading();
    console.error('Family alert error:', error);
    alert('Error sending alert: ' + error.message);
  }
}

function handleSafetyCheck() {
  alert('⏱️ Safety Check-in\n\nThis feature will allow you to set a timer (e.g. 30 mins). If you don\'t check in before it expires, an alert will be sent automatically.\n\n(Coming in next update)');
}

function handleManageContacts() {
  alert('👥 Manage Contacts\n\nHere you will be able to add email/phone numbers for family members to receive alerts.\n\n(Coming in next update)');
}

// ==================== FILE UPLOAD FUNCTIONS ====================

/**
 * Handle file selection for incident report form
 */
async function handleReportFileSelection(files) {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'video/mp4', 'video/quicktime'];

  for (const file of files) {
    // Validate file size
    if (file.size > maxSize) {
      showMessage(`File "${file.name}" is too large. Maximum size is 100MB.`, 'error');
      continue;
    }

    // Validate file type
    if (!validTypes.includes(file.type)) {
      showMessage(`File "${file.name}" is not a supported format.`, 'error');
      continue;
    }

    try {
      // Upload to Firebase Storage
      const downloadURL = await uploadFileToStorage(file, 'report', null);

      // Add to uploaded files array
      reportUploadedFiles.push({
        name: file.name,
        url: downloadURL,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        size: file.size,
        uploadedAt: new Date()
      });

      // Update preview
      displayReportFilePreview();

    } catch (error) {
      console.error('Error uploading file:', error);
      showMessage(`Failed to upload "${file.name}": ${error.message}`, 'error');
    }
  }
}

/**
 * Handle file upload for active incident tracking screen
 */
async function handleIncidentFileUpload(files) {
  if (!currentIncident) {
    showMessage('No active incident to attach files to', 'error');
    return;
  }

  const maxSize = 100 * 1024 * 1024; // 100MB
  const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'video/mp4', 'video/quicktime'];

  for (const file of files) {
    // Validate file size
    if (file.size > maxSize) {
      showMessage(`File "${file.name}" is too large. Maximum size is 100MB.`, 'error');
      continue;
    }

    // Validate file type
    if (!validTypes.includes(file.type)) {
      showMessage(`File "${file.name}" is not a supported format.`, 'error');
      continue;
    }

    try {
      // Upload to Firebase Storage
      const downloadURL = await uploadFileToStorage(file, 'incident', currentIncident);

      // Add to uploaded files array
      const fileData = {
        name: file.name,
        url: downloadURL,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        size: file.size,
        uploadedAt: new Date()
      };

      incidentUploadedFiles.push(fileData);

      // Update Firestore with new attachment
      const incidentRef = doc(db, 'incidents', currentIncident);
      const incidentDoc = await getDoc(incidentRef);
      const existingAttachments = incidentDoc.data().attachments || [];

      await setDoc(incidentRef, {
        attachments: [...existingAttachments, fileData],
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Update preview
      displayIncidentFilePreview();
      showMessage(`File "${file.name}" uploaded successfully!`, 'success');

    } catch (error) {
      console.error('Error uploading file:', error);
      showMessage(`Failed to upload "${file.name}": ${error.message}`, 'error');
    }
  }
}

/**
 * Upload file to Firebase Storage with progress tracking
 */
function uploadFileToStorage(file, context, incidentId) {
  return new Promise((resolve, reject) => {
    try {
      // Create storage reference
      const userId = currentUser?.uid || 'anonymous';
      let storagePath;

      if (context === 'report') {
        storagePath = `report/${userId}/${Date.now()}_${file.name}`;
      } else if (context === 'incident' && incidentId) {
        storagePath = `incidents/${incidentId}/${Date.now()}_${file.name}`;
      } else {
        storagePath = `uploads/${userId}/${Date.now()}_${file.name}`;
      }

      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Get progress elements
      const progressContainer = context === 'report'
        ? document.getElementById('reportUploadProgress')
        : document.getElementById('incidentUploadProgress');
      const progressBar = context === 'report'
        ? document.getElementById('reportProgressBar')
        : document.getElementById('incidentProgressBar');
      const progressText = context === 'report'
        ? document.getElementById('reportProgressText')
        : document.getElementById('incidentProgressText');

      if (progressContainer) progressContainer.classList.remove('hidden');

      // Monitor upload progress
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progressBar) progressBar.style.width = progress + '%';
          if (progressText) progressText.textContent = `Uploading ${file.name}: ${Math.round(progress)}%`;
        },
        (error) => {
          console.error('Upload error:', error);
          if (progressContainer) progressContainer.classList.add('hidden');
          reject(error);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            if (progressContainer) progressContainer.classList.add('hidden');
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Display file preview for report form
 */
function displayReportFilePreview() {
  const previewContainer = document.getElementById('filePreview');
  if (!previewContainer) return;

  previewContainer.innerHTML = '';
  previewContainer.classList.remove('hidden');

  reportUploadedFiles.forEach((file, index) => {
    const fileCard = document.createElement('div');
    fileCard.style.cssText = 'position: relative; width: 100px; height: 100px; border-radius: 8px; overflow: hidden; background: #222;';

    if (file.type === 'image') {
      fileCard.innerHTML = `
        <img src="${file.url}" style="width: 100%; height: 100%; object-fit: cover;">
        <button onclick="removeReportFile(${index})" style="position: absolute; top: 5px; right: 5px; background: rgba(255,59,48,0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 16px; line-height: 1;">×</button>
      `;
    } else {
      fileCard.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 40px;">🎥</div>
        <button onclick="removeReportFile(${index})" style="position: absolute; top: 5px; right: 5px; background: rgba(255,59,48,0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 16px; line-height: 1;">×</button>
      `;
    }

    previewContainer.appendChild(fileCard);
  });
}

/**
 * Display file preview for incident tracking screen
 */
function displayIncidentFilePreview() {
  const previewContainer = document.getElementById('incidentFilePreview');
  if (!previewContainer) return;

  previewContainer.innerHTML = '';
  previewContainer.classList.remove('hidden');

  incidentUploadedFiles.forEach((file) => {
    const fileCard = document.createElement('div');
    fileCard.style.cssText = 'width: 100px; height: 100px; border-radius: 8px; overflow: hidden; background: #222;';

    if (file.type === 'image') {
      fileCard.innerHTML = `<img src="${file.url}" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
      fileCard.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 40px;">🎥</div>`;
    }

    previewContainer.appendChild(fileCard);
  });
}

/**
 * Remove file from report upload array
 */
window.removeReportFile = function (index) {
  reportUploadedFiles.splice(index, 1);
  displayReportFilePreview();

  if (reportUploadedFiles.length === 0) {
    const previewContainer = document.getElementById('filePreview');
    if (previewContainer) previewContainer.classList.add('hidden');
  }
};


// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
