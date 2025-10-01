# Firebase Index Setup

## Issue
The application requires a composite index in Firebase Firestore for the `campaigns` collection to query by `userId` and order by `createdAt`.

## Error Message
```
Runtime FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/emailmarkeeting-423fc/firestore/indexes?create_composite=...
```

## Solutions

### Option 1: Create Index via Firebase Console (Recommended)
1. Click the link provided in the error message
2. Or go to [Firebase Console](https://console.firebase.google.com/)
3. Select your project: `emailmarkeeting-423fc`
4. Go to Firestore Database → Indexes
5. Click "Create Index"
6. Set the following:
   - **Collection ID**: `campaigns`
   - **Fields**:
     - `userId` (Ascending)
     - `createdAt` (Descending)
7. Click "Create"

### Option 2: Use Firebase CLI
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init firestore`
4. Deploy indexes: `firebase deploy --only firestore:indexes`

### Option 3: Use the Provided Index File
1. Use the `firestore-indexes.json` file in this project
2. Import it via Firebase Console or CLI

## Current Workaround
The application has been updated to work without the index by:
- Removing the `orderBy` clause from the query
- Sorting results on the client side
- This works but may be slower for large datasets

## Index Configuration
```json
{
  "collectionGroup": "campaigns",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "userId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    }
  ]
}
```

## Performance Impact
- **Without Index**: Client-side sorting, slower for large datasets
- **With Index**: Server-side sorting, faster and more efficient

## Recommendation
Create the index using Option 1 (Firebase Console) for the best performance.
