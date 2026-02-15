# 🔥 Firebase Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `car-rental-tracker`
4. Disable Google Analytics (not needed)
5. Click **"Create project"**

### Step 2: Register Web App

1. In your Firebase project, click the **Web icon** (`</>`)
2. Enter app nickname: `Car Rental Web App`
3. **Don't** check "Firebase Hosting"
4. Click **"Register app"**
5. Copy the **firebaseConfig** object (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "car-rental-tracker.firebaseapp.com",
  projectId: "car-rental-tracker",
  storageBucket: "car-rental-tracker.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxxxxxxxxxx"
};
```

### Step 3: Enable Firestore Database

1. In Firebase Console, go to **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (allows read/write for 30 days)
4. Choose location closest to India: **asia-south1 (Mumbai)**
5. Click **"Enable"**

### Step 4: Update Your Code

1. Open `firebase-config.js` in your project
2. **Replace** the placeholder config with your copied config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_PROJECT.firebaseapp.com",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

### Step 5: Update Security Rules (Important!)

After 30 days, test mode expires. Before that, update Firestore rules:

1. Go to **Firestore Database** → **Rules** tab
2. Replace with these rules (allows everyone to write, only logged users to delete):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: true;  // For now, open access
    }
  }
}
```

**For production (more secure):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trips/{tripId} {
      allow read: true;
      allow create: true;
      allow delete: if request.auth != null;  // Only authenticated users
    }
    match /maintenance/{maintenanceId} {
      allow read: true;
      allow create: true;
      allow delete: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

---

## ✅ Testing

1. Open your app
2. Submit a trip as driver
3. Open dashboard - you should see the trip!
4. Try from different device/browser - data syncs!

---

## 📊 View Your Data

Go to Firebase Console → Firestore Database → Data tab
You'll see two collections:
- `trips` - All trip submissions
- `maintenance` - All maintenance records

---

## 🆓 Free Limits (More than enough!)

- **Storage**: 1 GB
- **Reads**: 50,000/day
- **Writes**: 20,000/day
- **Deletes**: 20,000/day

For your use case, this is **unlimited** practically!

---

## 🔒 Recovery Email

Configured: `saratheie2015@gmail.com`

---

## ❓ Troubleshooting

**"Firebase not configured" in console?**
- You haven't replaced the config in `firebase-config.js`

**Data not saving?**
- Check Firestore rules are set to test mode or public
- Check browser console for errors

**Need help?**
- Email Firebase support or ask me!

---

**Done! Your app now syncs across all devices in real-time! 🎉**
