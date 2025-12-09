# User Storage Fix - Summary

## Problem
Users were not being stored correctly in MongoDB. The `users` collection was empty or not created.

## Root Cause
The old `Admin` model was still being referenced in some places, causing data to be stored in the `admins` collection instead of the new `users` collection.

## Solution

### 1. Created Migration Script
**File**: [utils/migrateToUsers.js](file:///home/priya/gym-backend/utils/migrateToUsers.js)

This script:
- Migrates data from `admins` collection to `users` collection
- Adds missing `name` field to old admin records
- Drops the old `admins` collection after migration

### 2. Ran Migration
```bash
node utils/migrateToUsers.js
```

**Result**: Successfully migrated all users to the `users` collection

### 3. Verified Database

**Current Collections**:
- `users` ✅ (4 documents)
- `members`
- `sessions`
- `attendances`

**Current Users**:
1. Admin User (admin@gymmini.com) - admin
2. Test User (user@gymmini.com) - user
3. Test User 2 (testuser@example.com) - user
4. Priya (priya@gmail.com) - user

### 4. Tested Authentication

✅ **Admin Login**: Working
✅ **User Login**: Working
✅ **Registration**: Working
✅ **Data Persistence**: Working

## How to Check Users in MongoDB

```bash
# View all collections
mongosh gymmini --eval "db.getCollectionNames()"

# Count users
mongosh gymmini --eval "db.users.countDocuments()"

# View all users
mongosh gymmini --eval "db.users.find().pretty()"

# View users (name, email, role only)
mongosh gymmini --eval "db.users.find({}, {name:1, email:1, role:1, _id:0}).pretty()"
```

## Migration Script Usage

If you need to run the migration again in the future:

```bash
node utils/migrateToUsers.js
```

This is safe to run multiple times - it uses `upsert` to avoid duplicates.

## Files Updated

- ✅ [models/User.js](file:///home/priya/gym-backend/models/User.js) - Unified user model
- ✅ [controllers/authController.js](file:///home/priya/gym-backend/controllers/authController.js) - Uses User model
- ✅ [middleware/auth.js](file:///home/priya/gym-backend/middleware/auth.js) - Uses User model
- ✅ [utils/seedAdmin.js](file:///home/priya/gym-backend/utils/seedAdmin.js) - Seeds to users collection
- ✅ [utils/migrateToUsers.js](file:///home/priya/gym-backend/utils/migrateToUsers.js) - Migration script

## Status

✅ **FIXED** - Users are now properly stored in the `users` collection and all authentication endpoints are working correctly.
