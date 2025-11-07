# Firebase Setup Guide

## Important: Get Your Web App Configuration

### Step 1: Get Firebase Web Config (NOT Service Account)

1. Go to: https://console.firebase.google.com/project/eastman-eb9cf/settings/general
2. Scroll to **"Your apps"** section
3. If no web app exists:
   - Click the **Web icon** `</>`
   - Name it: "Resource Management"
   - Click "Register app"
4. Copy the `firebaseConfig` object shown

### Step 2: Enable Required Services

#### A. Enable Authentication
1. Go to: https://console.firebase.google.com/project/eastman-eb9cf/authentication
2. Click "Get Started"
3. Click "Sign-in method" tab
4. Enable **Email/Password**
5. Click "Save"

#### B. Enable Firestore Database
1. Go to: https://console.firebase.google.com/project/eastman-eb9cf/firestore
2. Click "Create database"
3. Select **"Start in test mode"** (for development)
4. Choose a location (closest to you)
5. Click "Enable"

#### C. Set Firestore Security Rules
After creating the database:
1. Go to "Rules" tab
2. Replace with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        (request.auth.uid == userId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    // Projects collection
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'project_manager'];
      allow update, delete: if request.auth != null &&
        (resource.data.managerId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

3. Click "Publish"

### Step 3: Update Firebase Config in Code

Once you have your config from Step 1, update `src/services/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_FROM_CONSOLE",
  authDomain: "eastman-eb9cf.firebaseapp.com",
  projectId: "eastman-eb9cf",
  storageBucket: "eastman-eb9cf.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Quick Links for Your Project

- Firebase Console: https://console.firebase.google.com/project/eastman-eb9cf
- Authentication: https://console.firebase.google.com/project/eastman-eb9cf/authentication
- Firestore: https://console.firebase.google.com/project/eastman-eb9cf/firestore
- Settings: https://console.firebase.google.com/project/eastman-eb9cf/settings/general

### Security Warning

⚠️ **NEVER use service account credentials in your frontend code!**
- Service account credentials are for server-side/admin use only
- Frontend apps use the Web SDK config (apiKey, authDomain, etc.)
- The apiKey in Web SDK config is safe to expose publicly
