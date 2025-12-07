# Firebase Setup Instructions

## Firestore Security Rules

Your Firestore database needs proper security rules to allow read/write access. Follow these steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `certificate-generator-7f99f`
3. Navigate to **Firestore Database** in the left menu
4. Click on the **Rules** tab
5. Replace the existing rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to templates collection
    match /templates/{templateId} {
      allow read, write: if true;
    }
    
    // Allow read/write access to certificates collection
    match /certificates/{certId} {
      allow read, write: if true;
    }
  }
}
```

6. Click **Publish** to save the rules

⚠️ **Note**: These rules allow anyone to read/write data. For production, you should add authentication and proper permissions.

## Firebase Storage Rules

You also need to set up Storage rules for certificate images and template backgrounds:

1. In Firebase Console, navigate to **Storage** in the left menu
2. Click on the **Rules** tab
3. Replace the existing rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read/write for certificate images
    match /certificates/{certId} {
      allow read, write: if true;
    }
    
    // Allow read/write for template background images
    match /templates/{templateId}/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

4. Click **Publish** to save the rules

## Production Security (Recommended)

For production use, implement authentication and update rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /templates/{templateId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /certificates/{certId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

This requires users to be authenticated before they can create templates or certificates, but allows anyone to verify certificates.
