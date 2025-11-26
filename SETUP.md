# WSN Guardian - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Firebase account (free tier is fine)
- Google Maps API key (for location features)
- Modern web browser

### Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project called "wsn-guardian"
3. Enable the following services:
   - **Authentication** (Email/Password provider)
   - **Cloud Firestore**
   - **Cloud Messaging**
   - **Hosting**

4. Get your Firebase config:
   - Project Settings → General → Your apps → Web app
   - Copy the configuration object

5. Update `firebase/config.json` with your Firebase credentials

### Step 2: Firestore Database Setup

1. Go to Firestore Database in Firebase Console
2. Create database in **production mode**
3. Set location to your nearest region (e.g., `europe-west`)
4. Create the following collections (they'll auto-create when first used):
   - `companies`
   - `users`
   - `incidents`
   - `controlRoomUsers`
   - `responseUnits`
   - `notifications`

5. Set up Security Rules:
   - Go to Firestore → Rules
   - Copy the rules from `firebase/database-schema.md`
   - Publish the rules

### Step 3: Create Indexes

Firestore will prompt you to create indexes when you first query. Or create manually:

1. Go to Firestore → Indexes
2. Create composite indexes:
   - Collection: `incidents`, Fields: `companyId` (Asc), `status` (Asc), `createdAt` (Desc)
   - Collection: `incidents`, Fields: `companyId` (Asc), `type` (Asc), `createdAt` (Desc)
   - Collection: `incidents`, Fields: `userId` (Asc), `createdAt` (Desc)

### Step 4: Authentication Setup

1. Go to Authentication → Sign-in method
2. Enable **Email/Password**
3. (Optional) Enable **Google** sign-in for easier access

### Step 5: Create First Company

1. Go to Firestore Database
2. Create a document in `companies` collection:

```json
{
  "companyId": "sss-security",
  "name": "SSS Security",
  "logo": "",
  "colors": {
    "primary": "#D4AF37",
    "secondary": "#C0C0C0",
    "accent": "#1a1a1a"
  },
  "contact": {
    "phone": "0123456789",
    "email": "control@sss-security.co.za",
    "address": "Kempton Park, SA"
  },
  "subscription": {
    "plan": "premium",
    "status": "active",
    "monthlyFee": 2500,
    "startDate": "2024-01-01T00:00:00Z"
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Step 6: Local Development

1. Install a local web server (if you don't have one):
   ```bash
   npm install -g http-server
   ```

2. Navigate to the client-app directory:
   ```bash
   cd client-app
   ```

3. Start the server:
   ```bash
   http-server -p 8080
   ```

4. Open browser to `http://localhost:8080`

### Step 7: Deploy to Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize hosting:
   ```bash
   firebase init hosting
   ```
   - Select your project
   - Set public directory to `client-app`
   - Configure as single-page app: Yes
   - Don't overwrite index.html

4. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

## 🔧 Configuration

### Branding

Edit `firebase/config.json` to customize:
- Company name and display name
- Colors (bronze, silver, black)
- Contact information
- Emergency types

### Google Maps (Optional)

1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API and Geocoding API
3. Add key to `firebase/config.json` under `maps.apiKey`

## 📱 Testing

### Test User Registration
1. Open the app
2. Click "Create Account"
3. Fill in details
4. Register

### Test Emergency Button
1. Login with test user
2. Click any emergency button
3. Confirm the alert
4. Check Firestore for new incident document

### Test Control Room (Coming Soon)
Control room dashboard will be in `control-dashboard/` folder

## 🔐 Security Checklist

- [ ] Update Firebase security rules
- [ ] Enable App Check (prevents abuse)
- [ ] Set up environment variables for sensitive data
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set up rate limiting on Cloud Functions

## 📞 Support

For issues or questions:
- Email: info@wsnsecurity.co.za
- Phone: 0674016057

## 🎯 Next Steps

1. Build Control Room Dashboard
2. Implement real-time GPS tracking
3. Add SMS notifications
4. Create admin panel for WSN
5. Build mobile apps (React Native/Flutter)
