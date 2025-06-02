# Expense Tracker

Expense Tracker is a web application designed to help users manage their finances effectively. It allows users to log expenses, categorize them, visualize spending patterns, and set budgets. The application is deployed on Vercel for seamless performance and scalability.

## Features

- **Expense Tracking**: Log and categorize daily expenses.
- **Visual Analytics**: Interactive charts and graphs for better insights.
- **Budget Management**: Set budgets for different categories and track progress.
- **Authentication**: Secure login and signup using Firebase.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Export Data**: Download expense data as CSV files.
- **Real-Time Updates**: Firebase Firestore integration for real-time data.

## Live Demo

Visit the live application at: [Expense Tracker](https://expense-tracker-iota-three.vercel.app)

## Firebase Setup Guide

To set up Firebase for this project, follow these steps:

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/).
   - Click on "Add Project" and follow the instructions.

2. **Enable Firebase Services**:
   - Enable Authentication (Email/Password and Google).
   - Enable Firestore Database.

3. **Add Firebase Configuration**:
   - Copy the Firebase configuration from your Firebase project settings.
   - Replace the placeholder values in `firebase.js` or `lib/firebase.ts`:

     ```javascript
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID",
       measurementId: "YOUR_MEASUREMENT_ID",
     };
     ```

4. **Install Firebase SDK**:
   - Run the following command to install Firebase:
     ```bash
     pnpm install firebase
     ```

5. **Initialize Firebase**:
   - Ensure Firebase is initialized in `firebase.js` or `lib/firebase.ts`:

     ```javascript
     import { initializeApp } from "firebase/app";
     import { getAuth, GoogleAuthProvider } from "firebase/auth";
     import { getFirestore } from "firebase/firestore";

     const app = initializeApp(firebaseConfig);

     export const db = getFirestore(app);
     export const auth = getAuth(app);
     export const provider = new GoogleAuthProvider();
     ```

## Project Structure

The project is organized as follows:

- **app/**: Contains Next.js pages and layouts.
- **components/**: Reusable React components.
- **lib/**: Utility functions and Firebase configuration.
- **hooks/**: Custom React hooks.
- **public/**: Static assets like images and icons.
- **styles/**: Global and component-specific styles.
- **types/**: TypeScript type definitions.

## Getting Started

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/expense-tracker.git
   cd expense-tracker
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Run the Development Server**:
   ```bash
   pnpm dev
   ```

4. **Open in Browser**:
   Navigate to `http://localhost:3000`.

## Deployment

The application is deployed on Vercel. To deploy your own version:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy the Application**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   - Add Firebase configuration as environment variables in Vercel.

## Environment Variables

Ensure the following environment variables are set:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## License

This project is licensed under the MIT License.

## Contact

For any inquiries, contact [Rakesh Gupta](https://www.linkedin.com/in/rakesh-gupta-developer).
