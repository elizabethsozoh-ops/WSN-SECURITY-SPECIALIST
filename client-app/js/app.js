// WSN Guardian - Demo Mode (UI Only)
// This version shows the interface without requiring Firebase setup

// App State
let appConfig = {
    defaultCompany: {
        displayName: "SSS Guardian",
        tagline: "Powered by WSN Security Specialist",
        colors: {
            primary: "#D4AF37",
            secondary: "#C0C0C0"
        },
        contact: {
            phone: "0123456789"
        }
    }
};

// Initialize App
function initApp() {
    console.log('🎨 WSN Guardian - Demo Mode');

    // Apply branding
    applyBranding();

    // Show login screen
    showScreen('login');
    hideLoading();

    // Setup event listeners
    setupEventListeners();

    // Show demo banner
    showDemoBanner();
}

// Apply Branding
function applyBranding() {
    const company = appConfig.defaultCompany;
    document.title = `${company.displayName} - ${company.tagline}`;

    const appTitle = document.getElementById('appTitle');
    if (appTitle) {
        appTitle.textContent = company.displayName.toUpperCase();
    }

    document.documentElement.style.setProperty('--color-bronze', company.colors.primary);
    document.documentElement.style.setProperty('--color-silver', company.colors.secondary);
}

// Show Demo Banner
function showDemoBanner() {
    const banner = document.createElement('div');
    banner.style.cssText = 'position: fixed; top: 10px; right: 10px; background: rgba(212, 175, 55, 0.95); color: black; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: bold; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
    banner.innerHTML = '🎨 DEMO MODE - UI Preview Only<br><small style="font-weight:normal;">Set up Firebase to enable features</small>';
    document.body.appendChild(banner);
}

// Screen Management
function showScreen(screenName) {
    const screens = ['loginScreen', 'registerScreen', 'dashboardScreen', 'incidentScreen'];
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

    // Login Form - Demo Mode
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('🎨 DEMO MODE\n\nThis is a UI preview only.\nSet up Firebase to enable login functionality.\n\nFor now, click OK to see the dashboard.');
        showScreen('dashboard');
    });

    // Register Form - Demo Mode
    document.getElementById('registerForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('🎨 DEMO MODE\n\nThis is a UI preview only.\nSet up Firebase to enable registration.\n\nFor now, click OK to see the dashboard.');
        showScreen('dashboard');
    });

    // Emergency Buttons
    document.querySelectorAll('.emergency-button').forEach(btn => {
        btn.addEventListener('click', handleEmergencyButton);
    });

    // Quick Actions
    document.getElementById('viewHistoryBtn')?.addEventListener('click', () => {
        alert('📜 Incident History\n\nThis feature will show:\n- Past emergencies\n- Response times\n- Incident details\n\n(Coming soon!)');
    });

    document.getElementById('manageDependantsBtn')?.addEventListener('click', () => {
        alert('👥 Manage Dependants\n\nThis feature will allow you to:\n- Add family members\n- Give them emergency access\n- Manage their permissions\n\n(Coming soon!)');
    });

    document.getElementById('callControlBtn')?.addEventListener('click', () => {
        const phone = appConfig.defaultCompany.contact.phone;
        if (confirm(`📞 Call Control Room\n\nDial: ${phone}?`)) {
            window.location.href = `tel:${phone}`;
        }
    });

    // Incident Actions
    document.getElementById('backToDashboardBtn')?.addEventListener('click', () => {
        showScreen('dashboard');
    });

    document.getElementById('cancelIncidentBtn')?.addEventListener('click', () => {
        if (confirm('Cancel this emergency?\n\nThis should only be done for false alarms.')) {
            alert('✓ Emergency cancelled');
            showScreen('dashboard');
        }
    });

    document.getElementById('callUnitBtn')?.addEventListener('click', () => {
        alert('📞 Call Responding Unit\n\nIn the live version, this will call the officer directly.');
    });
}

// Emergency Button Handler
function handleEmergencyButton(e) {
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
        `🎨 DEMO MODE: This will show the incident screen.\n\n` +
        `In the live version, this would:\n` +
        `- Capture your GPS location\n` +
        `- Alert the control room\n` +
        `- Dispatch a response unit\n\n` +
        `Press OK to see the incident screen.`
    );

    if (!confirmed) return;

    showIncidentScreen(emergencyType);
}

// Show Incident Screen
function showIncidentScreen(type) {
    const emergencyLabels = {
        panic: '🚨 Armed Response',
        medical: '🏥 Medical Emergency',
        fire: '🔥 Fire & Rescue',
        technical: '🔧 Technical Support'
    };

    document.getElementById('incidentType').textContent = emergencyLabels[type];
    document.getElementById('incidentId').textContent = 'DEMO' + Math.random().toString(36).substr(2, 4).toUpperCase();
    document.getElementById('incidentStatusText').textContent = 'Pending';
    document.getElementById('incidentLocation').textContent = 'Kempton Park, Gauteng';
    document.getElementById('incidentTime').textContent = 'Just now';

    showScreen('incident');

    // Simulate status updates in demo mode
    setTimeout(() => {
        document.getElementById('incidentStatusText').textContent = 'Dispatched';
        const statusBadge = document.getElementById('incidentStatus');
        statusBadge.className = 'status-badge status-dispatched';
        statusBadge.innerHTML = '<span class="status-dot"></span> Unit En Route';

        // Show unit info
        document.getElementById('unitInfo').classList.remove('hidden');
        document.getElementById('unitName').textContent = 'Alpha 1';
        document.getElementById('officerName').textContent = 'Officer Smith';
        document.getElementById('unitETA').textContent = '5-7 minutes';
    }, 2000);
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
