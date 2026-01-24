# Firebase & Firestore Setup Guide

## Overview
This project uses Firebase for backend services, specifically Firestore for storing sacrament form submissions.

## Initial Setup

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase Project
```bash
firebase init
```

Select the following options:
- ✅ Firestore
- ✅ Hosting (already configured)

### 4. Create or Link Firebase Project
Either create a new Firebase project or link to an existing one through the Firebase Console:
- Go to https://console.firebase.google.com/
- Create a new project or select an existing one
- Enable Firestore Database (in Build > Firestore Database)

### 5. Get Firebase Configuration
1. Go to Project Settings in Firebase Console
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web (</>) icon
4. Register your app and copy the configuration object

### 6. Update Environment Files
Update the Firebase configuration in both environment files:

**Development:** `apps/lourdes-website/src/environments/environment.ts`
**Production:** `apps/lourdes-website/src/environments/environment.prod.ts`

Replace the placeholder values with your actual Firebase config:
```typescript
export const environment = {
  production: false, // or true for prod
  firebase: {
    apiKey: 'YOUR_ACTUAL_API_KEY',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abc123',
    measurementId: 'G-ABC123XYZ' // Optional, for Analytics
  }
};
```

### 7. Deploy Firestore Rules and Indexes
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Project Structure

### Services
- **`firebase.service.ts`**: Core Firebase service with CRUD operations
- **`sacrament-submission.service.ts`**: Specialized service for sacrament form submissions

### Firestore Collections

#### `sacrament-submissions`
Stores all sacrament form submissions with the following structure:
```typescript
{
  id: string;                    // Auto-generated document ID
  type: SacramentType;           // Type of sacrament
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  formData: any;                 // The actual form data
  submittedAt: string;           // ISO timestamp
  processedAt?: string;          // ISO timestamp (when admin processes)
  notes?: string;                // Admin notes
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}
```

**Sacrament Types:**
- `mass-intentions`
- `donations`
- `baptism`
- `holy-communion`
- `confirmation`
- `wedding`
- `anointing`
- `consecration`

### Firestore Security Rules
Located in `firestore.rules`:
- Anyone can submit forms (create)
- Only admins can read, update, or delete submissions
- Admins are identified by custom claims (`admin: true`)

### Firestore Indexes
Located in `firestore.indexes.json`:
- Composite index on `type` + `submittedAt`
- Composite index on `status` + `submittedAt`
- Composite index on `type` + `status` + `submittedAt`

These indexes optimize queries for filtering and sorting submissions.

## Usage Examples

### In a Component
```typescript
import { Component, inject } from '@angular/core';
import { SacramentSubmissionService } from '../../shared/services/sacrament-submission.service';
import { MassIntentions } from '@fmm/shared/models';

export class MassIntentionsComponent {
  private sacramentService = inject(SacramentSubmissionService);

  async onSubmit(formData: MassIntentions) {
    try {
      const submissionId = await this.sacramentService.submitForm(
        'mass-intentions',
        formData
      );
      console.log('Form submitted successfully:', submissionId);
      // Show success message to user
    } catch (error) {
      console.error('Error submitting form:', error);
      // Show error message to user
    }
  }
}
```

### Query Submissions
```typescript
// Get all pending baptism submissions
const pendingBaptisms = await this.sacramentService.getSubmissions(
  'baptism',
  'pending'
);

// Get all submissions of a specific type
const allWeddings = await this.sacramentService.getSubmissions('wedding');

// Get a specific submission
const submission = await this.sacramentService.getSubmission('doc-id-123');
```

### Update Status
```typescript
// Approve a submission
await this.sacramentService.updateSubmissionStatus(
  'doc-id-123',
  'approved',
  'Everything looks good!'
);
```

## Local Development with Emulator

For local testing without affecting production data:

### 1. Install Firebase Emulator
```bash
firebase init emulators
```

Select Firestore emulator.

### 2. Start Emulator
```bash
firebase emulators:start
```

### 3. Connect Your App to Emulator
Update `firebase.service.ts` to connect to the emulator in development:
```typescript
import { connectFirestoreEmulator } from 'firebase/firestore';

constructor() {
  this.app = initializeApp(environment.firebase);
  this.db = getFirestore(this.app);
  
  // Connect to emulator in development
  if (!environment.production) {
    connectFirestoreEmulator(this.db, 'localhost', 8080);
  }
}
```

## Deployment

### Deploy Everything
```bash
firebase deploy
```

### Deploy Only Firestore
```bash
firebase deploy --only firestore
```

### Deploy Only Hosting
```bash
firebase deploy --only hosting
```

## Monitoring

Monitor your Firestore usage and performance in the Firebase Console:
- Database > Firestore Database
- Analytics > Dashboard
- Usage and billing

## Security Best Practices

1. **Never commit environment files with real credentials** to version control
2. Use environment variables or secret management for production
3. Regularly review and update Firestore security rules
4. Enable App Check to prevent abuse
5. Set up budget alerts in Firebase Console
6. Regularly audit submitted data for spam or malicious content

## Troubleshooting

### Common Issues

1. **Permission Denied Error**
   - Check Firestore security rules
   - Ensure the operation is allowed for anonymous users

2. **Missing Index Error**
   - Firestore will provide a link to create the required index
   - Or deploy indexes: `firebase deploy --only firestore:indexes`

3. **Network Error**
   - Check Firebase configuration in environment files
   - Verify project ID and API key are correct

4. **Quota Exceeded**
   - Review Firebase usage in console
   - Consider upgrading to Blaze (pay-as-you-go) plan

## Next Steps

1. Set up Firebase Authentication (optional)
2. Create an admin dashboard to manage submissions
3. Add email notifications for new submissions
4. Implement file upload to Firebase Storage
5. Add analytics tracking for form completions
