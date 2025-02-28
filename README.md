# Insight - Meditation Diary

## Overview
**Insight** is a meditation diary web app designed to help users log their meditation sessions, set timers, and track their progress. The app integrates Firebase authentication, a React-based UI, and various interactive features such as note-taking and calendar-based tracking.

## Features
- **User Authentication**: Sign in and sign out with Firebase authentication.
- **Meditation Timer**: Start, pause, and restart meditation sessions with customizable countdown settings.
- **Notes & Journaling**: Take notes for each meditation session with a rich text editor.
- **Calendar Integration**: Select dates and view meditation history.
- **Theming**: Custom Material-UI theme for a smooth user experience.
- **Gong Sounds**: Play a gong sound at the start and end of meditation sessions.

## Technologies Used
- **Frontend**: React, Material-UI, ReactQuill, Firebase Authentication
- **Backend**: Node.js, Express.js (API for storing meditation logs and notes)
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Date Management**: Day.js

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/stavkinrot/Insight.git
   cd Insight
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## Configuration
- Set up Firebase authentication in `firebaseConfig.js`.
- Ensure backend API is running and accessible at `http://localhost:5000`.

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

