# Insight – Meditation Diary  

## Overview  
**Insight** is a meditation diary web app designed to help users log their meditation sessions, set timers, and track their progress. The app integrates Firebase authentication, a React-based UI, and interactive features such as note-taking and calendar-based tracking.

## Demo  
Watch the app in action: [Insight Demo](https://drive.google.com/file/d/1w5R6dxoqG4f4dDwiMdGbU5dd5pChehts/view?usp=drive_link)

## Features  
- **User Authentication**: Sign in and sign out with Firebase authentication.  
- **Meditation Timer**: Start, pause, and restart meditation sessions with customizable countdown settings.  
- **Notes & Journaling**: Take notes for each meditation session.  
- **Calendar Integration**: Select dates and view meditation history.  
- **Gong Sounds**: Play a gong sound at the start and end of meditation sessions.  
- **Theming**: Custom Material-UI theme for a smooth user experience.  

## Technologies Used  
- **Frontend**: React, Material-UI, ReactQuill, Firebase Authentication  
- **Backend**: Node.js, Express.js (API for storing meditation logs and notes)  
- **State Management**: React Hooks (useState, useEffect, useRef)  
- **Date Management**: Day.js  

## Getting Started  

### 1. Clone the Repository  
```sh
git clone https://github.com/yourusername/insight.git
cd insight
```  

### 2. Install Dependencies  
```sh
npm install
```  

### 3. Set Up Firebase  
1. Go to [Firebase Console](https://console.firebase.google.com/).  
2. Create a project and register a web app.  
3. Install Firebase SDK:  
   ```sh
   npm install firebase
   ```  
4. Create a `.env` file in the project root and add your Firebase credentials:  
   ```
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   VITE_FIREBASE_PROJECT_ID=your_project_id_here
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   VITE_FIREBASE_APP_ID=your_app_id_here
   ```  
5. Ensure `.env` is listed in `.gitignore` to keep credentials secure.  

### 4. Run the Development Server  
```sh
npm run dev
```  

Open [http://localhost:5173](http://localhost:5173) in your browser.  

## Usage  
1. Sign in using Firebase authentication.  
2. Use the calendar to select a date and view past meditation logs.  
3. Start a meditation session with or without a countdown.  
4. Take notes and save them for future reference.  
5. Log out when done.  

## Future Enhancements  
- Google Calendar integration  
- Customizable meditation sounds  
- Mobile-friendly UI improvements  

## License  
This project is licensed under the MIT License.  
