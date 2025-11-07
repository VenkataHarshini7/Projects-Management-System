# Resource Management Platform

A comprehensive full-stack web application for managing employees, projects, and resources across an organization. Built with React, Firebase, and Tailwind CSS.

## Features

### Admin Module
- **Dashboard**: Real-time organization-level KPIs and analytics
  - Total employees, active projects, budget utilization
  - Department distribution charts
  - Project status visualization
  - Resource utilization tracking
- **User Management**: Complete CRUD operations for users
  - Onboard/offboard employees and managers
  - Manage user profiles and compensation
  - Role-based access control
  - User status management

### Project Manager Module
- **Dashboard**: Project-level KPIs and performance metrics
  - Budget utilization tracking
  - Resource allocation overview
  - Over-allocation alerts
  - Project timeline management
- **Project Management**:
  - Create and manage projects
  - Set budgets and timelines
  - Track project expenses
  - Monitor project status
- **Resource Allocation**:
  - Allocate employees to projects
  - Set allocation percentages (e.g., 40% to Project A, 60% to Project B)
  - View employee availability in real-time
  - Track resource utilization across projects
  - Identify over-allocated resources

### Employee Module
- **Dashboard**: Personal performance and project overview
  - Current project assignments
  - Utilization metrics
  - Allocation distribution charts
- **Profile Management**:
  - Update personal information
  - Manage skills and certifications
  - View organizational hierarchy
  - Track career progress

## Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: Firebase
  - Authentication: Firebase Auth
  - Database: Cloud Firestore
  - Storage: Firebase Storage
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Date Handling**: date-fns

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable the following services:
   - Authentication (Email/Password)
   - Cloud Firestore
   - Storage (optional)
4. Go to Project Settings > General
5. Scroll down to "Your apps" and click on the web icon (</>)
6. Register your app and copy the configuration

### 3. Update Firebase Config

Open `src/services/firebase.js` and replace the placeholder values with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Firestore Security Rules

Set up the following security rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        (request.auth.uid == userId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

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

### 5. Run the Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173`

### 6. Create Initial Admin User

1. Click on "Sign up" in the login page
2. Fill in the form and select Role: **Admin**
3. Click "Create Account"

## Project Structure

```
resource-management/
├── src/
│   ├── components/          # Reusable components
│   ├── contexts/            # React contexts
│   ├── pages/               # Page components
│   │   ├── admin/
│   │   ├── manager/
│   │   └── employee/
│   ├── services/            # Firebase services
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── package.json
└── README.md
```

## User Roles

- **Admin**: Full access to all features
- **Project Manager**: Project and resource management
- **Employee**: Personal dashboard and profile management

## Build for Production

```bash
npm run build
```

## License

Created for educational and demonstration purposes.
