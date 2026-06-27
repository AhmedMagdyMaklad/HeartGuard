# HeartGuard

HeartGuard is a comprehensive, AI-driven health assessment system designed to monitor and evaluate heart health risks. It features a cross-platform mobile application and a web-based dashboard, empowering users to track vital signs, upload ECG data, and receive intelligent health risk reports. 

## Key Features

- **AI-Driven Health Assessment**: Leverage advanced algorithms to evaluate cardiovascular health risks based on user-provided vitals.
- **ECG Upload & Analysis**: Securely upload electrocardiogram (ECG) data for automated analysis.
- **Heart Health Risk Reports**: Get detailed risk scores and comprehensive reports on your overall heart health status.
- **Intelligent Chatbot Integration**: Interactive AI chatbot to guide users through the assessment process and provide context-aware insights.
- **Cross-Platform Mobile App**: A seamless experience across iOS and Android, built with Flutter.
- **Web Dashboard**: An intuitive, React-based web dashboard for data management and broader analytics.

## Project Structure

This repository is organized into a full-stack monorepo:

- **`/mobile`**: The Flutter mobile application containing the primary user interface (Assessments, Dashboard, Chat, ECG Upload).
- **`/src`**: The web frontend dashboard built with React, Vite, TypeScript, and Tailwind CSS.
- **`/server` & `/api`**: The backend infrastructure (Node.js) that powers API requests, handles ECG data, and communicates with the AI models.
- **`heartguard-schema.sql`**: The database schema used for persisting health records and user data.

## Tech Stack

- **Mobile Application**: Flutter, Dart
- **Web Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **AI/ML**: Core AI logic for parsing and predicting heart-related risks

## Getting Started

### Prerequisites
- Node.js (v18+)
- Flutter SDK (latest stable)
- PostgreSQL (if running the database locally)

### Running the Web Dashboard & Backend

1. Navigate to the root directory and install dependencies:
   ```bash
   npm install
   ```
2. Set up your environment variables in a `.env` file at the root.
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### Running the Mobile Application

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Fetch the Flutter dependencies:
   ```bash
   flutter pub get
   ```
3. Run the app on your preferred emulator or connected device:
   ```bash
   flutter run
   ```

## Design & Architecture

For more details on the backend architecture and data flow, please refer to the `BACKEND_ARCHITECTURE_GUIDE.md`.

## License

This project is licensed under the MIT License.
