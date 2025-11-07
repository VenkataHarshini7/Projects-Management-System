# Troubleshooting Guide - Resource Allocation & Expense Issues

## Problem: Can't Allocate Employees or Add Expenses

### Quick Diagnostic Steps:

#### 1. Check Browser Console
1. Open your browser (Chrome/Firefox/Edge)
2. Press `F12` to open Developer Tools
3. Click on "Console" tab
4. Try to add expense or allocate resource
5. Look for error messages (red text)

#### 2. Verify Firebase Setup
- Make sure Firebase is configured correctly in `src/services/firebase.js`
- Check that Firestore is enabled in Firebase Console
- Verify you're logged in (check top-right corner of app)

#### 3. Common Issues & Solutions

**Issue: Buttons don't respond when clicked**
- **Solution**: Check browser console for errors
- **Cause**: Usually JavaScript error or Firebase not initialized

**Issue: Modal opens but submit doesn't work**
- **Solution**: Check Firestore security rules
- **Cause**: Usually permission denied errors

**Issue: "Permission denied" errors**
- **Solution**: Update Firestore rules to:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    match /projects/{projectId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 4. Step-by-Step Test

**Test Add Expense:**
1. Go to Manager → Projects
2. Find a project card
3. Click green "Add Expense" button
4. Modal should popup
5. Fill in:
   - Description: "Test Expense"
   - Amount: 100
   - Category: Select one
   - Date: Choose date
6. Click "Add Expense" button
7. Should see success alert
8. Check browser console for errors if it fails

**Test Allocate Resource:**
1. Go to Manager → Resources
2. Find a project section
3. Click blue "Allocate Resource" button at top
4. Modal should popup
5. Fill in:
   - Employee: Select from dropdown
   - Allocation %: Enter 50
   - Role: "Developer"
   - Dates: Optional
6. Click "Allocate Resource" button
7. Should see success alert
8. Check browser console for errors if it fails

#### 5. Check Firebase Data Structure

**Expected structure for projects:**
```javascript
{
  name: "Project Name",
  managerId: "user-id",
  budget: 10000,
  allocations: [
    {
      employeeId: "emp-id",
      employeeName: "John Doe",
      allocationPercentage: 50,
      role: "Developer"
    }
  ],
  expenses: [
    {
      id: "timestamp",
      description: "Expense desc",
      amount: 100,
      category: "labor",
      date: "2025-11-07"
    }
  ]
}
```

### Specific Error Messages & Solutions

**"Cannot read property 'id' of undefined"**
- You're not logged in properly
- Refresh the page and login again

**"Missing or insufficient permissions"**
- Update Firestore security rules (see above)
- Make sure you're logged in as Project Manager

**"allocations is not a function"**
- This is a data structure issue
- The project doesn't have allocations array initialized
- It will be created automatically when you add first allocation

**Modal opens but form is empty**
- This is normal for "Add" operations
- For "Edit" operations, this means data isn't loading properly

### Manual Test via Browser Console

Open browser console and test Firebase connection:

```javascript
// Test 1: Check if Firebase is loaded
console.log(window.firebase);

// Test 2: Check current user
console.log("Current User:", await firebase.auth().currentUser);

// Test 3: Try to read projects
const projectsRef = firebase.firestore().collection('projects');
const snapshot = await projectsRef.get();
console.log(`Found ${snapshot.size} projects`);
```

### If Nothing Works

1. **Clear browser cache:**
   - Chrome: Ctrl+Shift+Delete
   - Select "Cached images and files"
   - Click "Clear data"
   - Refresh page

2. **Check Network Tab:**
   - Open Dev Tools → Network tab
   - Try the action again
   - Look for failed requests (red)
   - Check the error details

3. **Restart Dev Server:**
   ```bash
   # In terminal, press Ctrl+C
   # Then run:
   npm run dev
   ```

4. **Check if you have data:**
   - Go to Firebase Console
   - Open Firestore Database
   - Check if `projects` collection exists
   - Check if `users` collection has employee data

### Getting Help

If issues persist, provide:
1. Screenshot of browser console errors
2. Screenshot of Firestore rules
3. Screenshot of what happens when you click the button
4. Your role (Admin/Manager/Employee)
5. Browser and version (e.g., Chrome 120)

### Quick Fix Script

If you need to reset and test, create a test project manually:

1. Go to Firebase Console → Firestore
2. In `projects` collection, click "Add Document"
3. Use this data:
```
Document ID: test-project-001
Fields:
- name (string): "Test Project"
- managerId (string): [YOUR USER ID]
- budget (number): 50000
- status (string): "active"
- allocations (array): []
- expenses (array): []
- progress (number): 0
- createdAt (timestamp): [now]
- updatedAt (timestamp): [now]
```

4. Try adding expense/allocation to this project
