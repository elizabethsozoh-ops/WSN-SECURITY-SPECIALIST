# 🚀 Quick Start Guide

## Get Your App Running in 5 Minutes!

### Step 1: Set Up Firebase (5 minutes)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Click "Add project"
   - Name it: `wsn-guardian`
   - Disable Google Analytics (optional)
   - Click "Create project"

2. **Enable Authentication**
   - Click "Authentication" in left menu
   - Click "Get started"
   - Click "Email/Password"
   - Enable it and save

3. **Create Firestore Database**
   - Click "Firestore Database" in left menu
   - Click "Create database"
   - Start in **production mode**
   - Choose location: `europe-west` (or closest to you)
   - Click "Enable"

4. **Get Your Config**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Click "Project settings"
   - Scroll down to "Your apps"
   - Click the web icon (`</>`)
   - Register app with nickname: `wsn-guardian-client`
   - Copy the `firebaseConfig` object

5. **Update Your Config File**
   - Open `firebase/config.json`
   - Replace the `firebase` section with your config
   - Save the file

### Step 2: Set Up Security Rules (2 minutes)

1. In Firebase Console, go to **Firestore Database**
2. Click the **Rules** tab
3. Replace the content with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click **Publish**

> **Note:** These are permissive rules for testing. See `firebase/database-schema.md` for production rules.

### Step 3: Run Locally (1 minute)

#### Option A: Using Python (if installed)
```bash
cd client-app
python -m http.server 8080
```

#### Option B: Using Node.js (if installed)
```bash
cd client-app
npx http-server -p 8080
```

#### Option C: Using VS Code
1. Install "Live Server" extension
2. Right-click `client-app/index.html`
3. Click "Open with Live Server"

### Step 4: Test the App

1. Open browser to `http://localhost:8080`
2. Click "Create Account"
3. Fill in your details:
   - Email: `test@example.com`
   - Password: `password123`
   - Name, phone, address
4. Click "Create Account"
5. You should see the dashboard with emergency buttons!

### Step 5: Test Emergency Button

1. Click the **🚨 Armed Response** button
2. Confirm the alert
3. You should see the incident screen
4. Check Firebase Console → Firestore Database
5. You'll see a new document in the `incidents` collection!

---

## 🎉 Success!

Your app is now running! Here's what you can do next:

### Immediate Next Steps
- [ ] Customize branding in `firebase/config.json`
- [ ] Add your company logo to `shared/logo.png`
- [ ] Test all emergency buttons
- [ ] Create multiple test users

### Deploy to Production
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
firebase deploy --only hosting
```

Your app will be live at: `https://wsn-guardian.web.app`

---

## 🆘 Troubleshooting

### "Failed to initialize app"
- Check that you updated `firebase/config.json` with your Firebase credentials
- Make sure you enabled Authentication and Firestore in Firebase Console

### "Permission denied" errors
- Check that you published the Firestore security rules
- Make sure you're logged in (check browser console for auth errors)

### GPS not working
- Make sure you're using HTTPS (or localhost)
- Allow location permissions when prompted
- Check browser console for errors

### Can't create account
- Check Firebase Console → Authentication to see if user was created
- Check browser console for error messages
- Make sure email/password provider is enabled

---

## 📞 Need Help?

- **Email:** info@wsnsecurity.co.za
- **Phone:** 0674016057
- **Check:** Browser console (F12) for error messages
- **Review:** `firebase/database-schema.md` for detailed setup

---

## 🎯 What's Next?

Once you have the client app working, we'll build:

1. **Control Room Dashboard** - For operators to manage incidents
2. **Google Maps Integration** - Visual location tracking
3. **SMS Notifications** - Alert operators via SMS
4. **Admin Panel** - Manage companies and users

**You're off to a great start! 🚀**
