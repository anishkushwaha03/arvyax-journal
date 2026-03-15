# ArvyaX AI-Assisted Journal System

**Live Demo:** [[arvyax-journal-pi.vercel.app](https://arvyax-journal-pi.vercel.app/)]

A full-stack web application built for the ArvyaX assignment. This system allows users to write journal entries after completing immersive nature sessions (forest, ocean, mountain) and uses Google's Gemini LLM to analyze the emotional state and extract keywords from the text. 

## Tech Stack
* **Frontend:** React (built with Vite), standard CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **AI Integration:** Google Generative AI (Gemini 2.5 Flash)

## Prerequisites
Before running the application, make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v16 or higher)
* A [MongoDB](https://www.mongodb.com/) database (local or Atlas)
* A free [Google AI Studio](https://aistudio.google.com/) API Key for the LLM integration.

## Environment Variables
Navigate to the `server` directory and create a `.env` file. Add the following variables:

\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
LLM_API_KEY=your_gemini_api_key_here
\`\`\`

## Installation & Setup

The project is divided into a `client` and `server` folder. You will need to install dependencies for both.

### 1. Backend Setup
Open a terminal and navigate to the backend folder:
\`\`\`bash
cd server
npm install
\`\`\`

### 2. Frontend Setup
Open a new, separate terminal and navigate to the frontend folder:
\`\`\`bash
cd client
npm install
\`\`\`

## Running the Application

To run the application locally, you need both the server and client running simultaneously.

**Start the Backend Server:**
\`\`\`bash
cd server
npm run dev
\`\`\`
*(The server will start on http://localhost:5000)*

**Start the Frontend Client:**
\`\`\`bash
cd client
npm run dev
\`\`\`
*(Vite will provide a local URL, usually http://localhost:5173)*

## API Endpoints Overview
* \`POST /api/journal\`: Creates a new journal entry and saves it to the database.
* \`GET /api/journal/:userId\`: Retrieves all past journal entries for a specific user.
* \`POST /api/journal/analyze\`: Sends the journal text to the Gemini API and strictly returns a JSON object with the user's emotion, keywords, and a short summary.
* \`GET /api/journal/insights/:userId\`: Uses MongoDB aggregation to return total entries, top emotion, most used ambience, and recent keywords.

*(Note: For the scope of this assignment's minimal frontend, the `userId` is hardcoded to `"123"`).*