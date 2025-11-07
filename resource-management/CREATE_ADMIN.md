# Creating the First Admin User

Since admin signup has been removed from the public signup page for security, you need to create the first admin user manually.

## Method 1: Using Firebase Console (Recommended)

### Step 1: Create User in Firebase Authentication

1. Go to Firebase Console: https://console.firebase.google.com/project/eastman-eb9cf/authentication/users
2. Click **"Add user"**
3. Enter:
   - Email: `admin@yourcompany.com`
   - Password: Choose a strong password
4. Click **"Add user"**
5. Copy the **User UID** (you'll need this)

### Step 2: Create User Profile in Firestore

1. Go to Firestore Database: https://console.firebase.google.com/project/eastman-eb9cf/firestore
2. Click on the **"users"** collection (or create it if it doesn't exist)
3. Click **"Add document"**
4. For Document ID, paste the **User UID** from Step 1
5. Add these fields:

```
Field Name          | Type      | Value
--------------------|-----------|---------------------------
email               | string    | admin@yourcompany.com
fullName            | string    | Admin User
role                | string    | admin
department          | string    | Administration
designation         | string    | System Administrator
compensation        | number    | 0
status              | string    | active
skills              | array     | [] (empty array)
certifications      | array     | [] (empty array)
joiningDate         | string    | 2025-11-07T00:00:00.000Z
createdAt           | timestamp | (click "Set to server timestamp")
updatedAt           | timestamp | (click "Set to server timestamp")
```

6. Click **"Save"**

### Step 3: Login

1. Go to your app: http://localhost:5174/login
2. Login with:
   - Email: `admin@yourcompany.com`
   - Password: (the password you set in Step 1)

## Method 2: Using UserManagement Page (After First Admin)

Once you have one admin user created:

1. Login as admin
2. Go to **Admin Dashboard** → **Users**
3. Click **"Add User"**
4. Select Role: **Admin**
5. Fill in details and create

## Method 3: Temporary Signup Enable (Quick Setup)

If you need to quickly create an admin during development:

### Option A: Temporarily Enable Admin Signup

1. Open `src/pages/Signup.jsx`
2. Temporarily add back the admin option:
   ```jsx
   <option value="admin">Admin</option>
   ```
3. Sign up as admin
4. Remove the option again

### Option B: Modify Existing User to Admin

1. Create a regular user through signup (as employee or manager)
2. Go to Firestore Console
3. Find the user document in the `users` collection
4. Change the `role` field from `employee` or `project_manager` to `admin`
5. Login again

## Security Note

⚠️ **Important**:
- Only create admin users through secure methods
- Do not leave admin signup enabled in production
- Use strong passwords for admin accounts
- Limit the number of admin users
- Regularly audit admin access

## Default Admin Credentials (for testing)

After creating your first admin, you can use the User Management interface to:
- Create additional admins
- Create managers
- Create employees
- Manage all user roles and permissions

## Troubleshooting

**Q: I can't login after creating the user**
- Make sure the User UID in Firestore matches the UID in Authentication
- Check that the role field is exactly "admin" (lowercase)

**Q: Login works but redirects to wrong page**
- Clear browser cache and cookies
- Check the role field in Firestore

**Q: Getting "permission denied" errors**
- Check Firestore security rules
- Make sure test mode is enabled or rules allow the operation
