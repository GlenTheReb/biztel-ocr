# AI Agent Rules of Engagement

This project was built utilizing an AI-Native Engineering workflow, specifically leveraging **Antigravity (Gemini 3.1 Pro)** as an autonomous IDE pair-programmer. 

To ensure the AI produced production-ready code without hallucinating or taking destructive actions, the following strict Rules of Engagement were enforced by the human operator:

1. **Explicit Permission Required (Zero-Trust Execution):** The AI was explicitly barred from running terminal commands (like `npm install`), creating files, or modifying Git history without first presenting a detailed Implementation Plan and receiving a literal "yes" from the human operator.
2. **Modern Stack Compliance:** The AI was strictly instructed to ignore legacy React defaults and exclusively use the provided modern stack: Next.js 16 (App Router), Tailwind v4, and Drizzle ORM.
3. **Git Identity Management:** To maintain a pristine commit history, the human operator intervened to force the AI to execute a "nuclear" git rewrite (`rm -rf .git`) to squash messy automated commits and enforce a clean `GlenTheReb` GitHub identity.
4. **Code Auditing & Correction:** The human operator actively audited the AI's code generation, specifically catching hallucinated version strings (`gemini-1.5-flash` vs `gemini-3.5-flash`) and forcing the AI to refactor both the UI and backend logic to reflect reality.
5. **Deep System Debugging:** When the Vercel Blob migration introduced a silent failure (empty image URLs), the AI agent autonomously executed test scripts and queried the database to isolate a Next.js stream exhaustion bug, demonstrating advanced full-stack debugging capabilities.

*For a detailed breakdown of the exact prompting and debugging workflows, please see [AI_WORKFLOW.md](./AI_WORKFLOW.md).*
