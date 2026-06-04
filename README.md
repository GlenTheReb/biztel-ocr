# Biztel OCR: AI-Powered Workflow Automation System

A web application prototype built to digitize handwritten/semi-structured operational documents and convert them into structured, reviewable operational records with analytics and validation workflows. 

Built as an assignment for BiztelAI.

## 🚀 Tech Stack & Architecture

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, Lucide React.
- **Backend:** Next.js API Routes.
- **Database:** Neon Serverless Postgres via Drizzle ORM.
- **AI Engine:** Google Gemini 3.5 Flash (via `@google/generative-ai` SDK) for multimodal OCR and structured JSON extraction.

### Core Architecture Workflow
1. **Upload Phase:** A user uploads a document (Image/PDF) via the drag-and-drop interface.
2. **AI Extraction Phase (Multi-Row):** The image is sent directly to the Gemini 3.5 vision model alongside a strict prompt enforcing a JSON array schema. The AI reads tabular ledgers and extracts *multiple* rows simultaneously, assigning a `confidenceScore` (0.0 to 1.0) for every field.
3. **Database Insertion:** The raw AI extraction array is saved to the Neon database via Drizzle ORM batch-insert, grouping all rows under a unique Batch ID.
4. **Bulk Review Phase:** The user is redirected to a side-by-side Bulk Review UI. Fields with low confidence (< 80%) or validation failures are dynamically highlighted. The user can seamlessly iterate, add missing rows, or remove rows.
5. **Approval:** The user corrects the data and clicks "Approve All", completing a Bulk Save transaction to the database.

## ✅ Core Requirements Checklist
1. **Document Upload:** Users can upload images/PDFs via Drag-and-Drop, preview them, and view history.
2. **AI-Based Data Extraction:** Gemini 3.5 Flash natively extracts strict schema JSON arrays directly from tabular images.
3. **Bulk Review Workflow:** Side-by-side UI for human-in-the-loop validation, allowing users to iterate over multiple extracted rows at once.
4. **Confidence Scoring:** Gemini assigns a confidence score (0.0 - 1.0) for every extracted field.
5. **Validation/Highlights:** Any field missing, with <80% confidence, or violating business rules is dynamically highlighted in red/amber.
6. **Analytics Dashboard:** KPI cards displaying total uploads, pending vs approved records, and manufacturing aggregates.
7. **Search & History:** A comprehensive data table showing all past uploads grouped by image.
8. **Global Notifications (Bonus):** A Google Cloud-style Navbar notification system tracking real-time async events, persisted locally.

## 🛠 Setup Instructions

### Prerequisites
- Node.js 20+
- A Neon Postgres Database
- A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GlenTheReb/biztel-ocr.git
   cd biztel-ocr
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Rename `.env.example` to `.env.local` and add your keys:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"
   GEMINI_API_KEY="your_google_gemini_api_key"
   ```

4. **Initialize the Database:**
   Push the Drizzle schema to your Neon database:
   ```bash
   npx drizzle-kit push
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🧠 Assumptions & Tradeoffs

1. **Local File Storage vs Cloud Storage:** For the sake of prototyping speed, uploaded files are written directly to the Next.js `public/uploads` directory. In a production environment (or when deploying to a serverless platform like Vercel), an object storage solution like AWS S3 or Vercel Blob would be required.
2. **Authentication:** User authentication (via NextAuth) was deliberately omitted to focus purely on the core OCR extraction and validation workflow within the 48-hour limit. The app acts as a single-tenant operational dashboard.
3. **AI Vision over Tesseract:** We assumed the manufacturing documents would be messy and handwritten. Instead of using traditional OCR (which requires brittle Regex parsing), we passed the images directly to a multimodal LLM to extract meaning and structure simultaneously.

## 🤖 AI Workflow Documentation
Please see the attached [AI_WORKFLOW.md](./AI_WORKFLOW.md) and [AGENTS.md](./AGENTS.md) files for a detailed breakdown of the AI-native engineering processes used to build this prototype.
