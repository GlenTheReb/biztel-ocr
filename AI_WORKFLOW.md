# AI Workflow Documentation

This document outlines the AI-assisted engineering workflow used to build the Biztel OCR prototype.

## AI Tools Used
*   **Antigravity (Gemini 3.1 Pro):** Used as the primary autonomous pair-programmer inside the IDE to plan architecture, scaffold the Next.js 16 app, generate Drizzle schemas, build Tailwind v4 UI components, and execute Git commands.
*   **Google Gemini 3.5 Flash (via API):** Used as the multimodal backend extraction engine to process images and return structured JSON with confidence scores.

## How AI tools were used during development
1.  **Architecture Planning:** The AI agent analyzed the requirements and generated a `task.md` and `implementation_plan.md` using Next.js, Drizzle, and Tailwind.
2.  **Scaffolding:** The AI autonomously ran `create-next-app` and installed dependencies via the terminal.
3.  **UI Generation:** The AI built the responsive Layout, Sidebar, Navbar, and Drag-and-Drop upload components using `lucide-react` and `clsx/tailwind-merge`.
4.  **AI Integration:** The AI wrote the Next.js API route that interfaces with the Gemini 3.5 SDK, handling file buffering and structured JSON prompting.

## Prompting/Debugging Workflows & Manual Intervention
*   **Version Correction (Manual Intervention):** The AI initially hallucinated older versions of frameworks. Manual intervention was required to correct it to Next.js 16 and Gemini 3.5.
*   **Execution Safeguards (Debugging):** The AI attempted to install utility dependencies (`clsx`, `tailwind-merge`) without prior permission. A strict "ask before doing anything" rule was enforced to reign in the autonomous behavior.
*   **Git Identity Management (Manual Intervention):** The AI's initial commits used an incorrect git config (`GlenRebello1`). Manual intervention directed the AI to perform a "nuclear" Git history rewrite (`rm -rf .git`) to ensure all commits were properly attributed to `GlenTheReb`.
*   **Prompt Engineering (AI Assisted):** The prompt used in `/api/upload` was crafted by the AI to enforce strict JSON schemas and return parallel `confidenceScores` for every single field extracted from the handwritten image.
*   **UI Auditing (Manual Intervention):** While the backend logic was updated to use Gemini 3.5, the user manually caught and directed the AI to fix hardcoded string discrepancies in the Sidebar UI.
*   **API Model String Crash (Debugging):** The AI stubbornly left the SDK model string as `"gemini-1.5-flash"` in the API route, causing a 404 crash on the first upload attempt. The user had to manually intervene again to force the AI to update the actual code string to `"gemini-3.5-flash"`.

## Areas where AI helped most
*   **Speed:** Setting up Drizzle ORM schemas and the Next.js App Router boilerplate.
*   **Multimodal OCR:** Instead of writing complex Regex pipelines with Tesseract, using Gemini 3.5 Flash allowed us to map visual handwritten data directly to a TypeScript interface in one API call.
*   **UI/UX:** Rapidly generating premium dark-mode Tailwind v4 components with proper hover states and active route highlighting.
