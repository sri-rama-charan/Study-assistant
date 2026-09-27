# AI Study Quiz

An interactive, AI-powered study quiz application built with React, Node.js, Express, and the Groq SDK. The application generates customized 5-question quizzes on any topic with structured difficulty levels, tracks answers, calculates scores, and provides comprehensive answer reviews with AI-generated explanations.

---

## 1. Overview

AI Study Quiz allows learners to quickly test their understanding of any subject:

1. **Enter a Topic:** Input any free-form study topic (e.g., *"React Hooks"*, *"JavaScript Closures"*, *"Photosynthesis"*).
2. **Select Difficulty:** Choose between **Easy**, **Medium**, or **Hard**.
3. **Generate Quiz:** The backend queries the Groq API using structured JSON schema output to produce a 5-question quiz.
4. **Answer Sequentially:** Navigate through 5 single-choice questions one at a time.
5. **Receive Score:** Instant score calculation displayed on a dedicated result screen with performance-based feedback.
6. **Review Answers & Explanations:** Review all questions, selected choices, correct answers, and AI-generated explanations.
7. **Try Again or Start Fresh:** Retake the same quiz immediately without a new API request, or start a new quiz with a different topic.

---

## 2. Features

* **Free-Form Topic Input:** Flexible text input with client-side validation to prevent empty submissions.
* **Difficulty Selection:** Clean, responsive toggle for Easy, Medium, and Hard difficulty tiers.
* **AI-Generated Quizzes:** Structured, schema-enforced quiz generation powered by Groq.
* **Strict Contract Adherence:** Exactly 5 questions per quiz, exactly 4 choices per question, with exactly one valid correct answer.
* **Sequential Navigation:** One question presented at a time with clear progress indicator (`Question X of 5`).
* **Answer Tracking:** Stores user selections across questions without revealing answers early.
* **Instant Scoring:** Automatically computes correct answers upon finishing the quiz.
* **Result Screen:** Clear score display (`4 / 5`, percentage) with tailored feedback.
* **Comprehensive Review Screen:** Inspects user answers vs. correct answers, visual status badges (Correct/Incorrect), and AI explanations.
* **In-Memory "Try Again":** Retake the identical quiz without re-fetching or consuming additional API credits.
* **"New Quiz" Flow:** Smoothly resets the view and returns to the topic form.
* **Loading & Concurrency Protection:** Spinner indicator with disabled controls to prevent duplicate submissions while generating.
* **Sanitized Error Handling:** Prevents raw JSON, Groq stack traces, or schema validation dumps from leaking to the UI.
* **Backend Structural Validation:** Multi-tier validation pipeline verifying object shapes, option IDs, and answer references before responding.
* **Secure API Key Storage:** Groq API key is kept strictly on the backend server and is never exposed in client bundles.
* **Mobile-Responsive UI:** Fully responsive layout built with Tailwind CSS, tested down to 320px viewports.

---

## 3. Tech Stack

### Frontend
* **React 19 (`react` 19.2.8, `react-dom` 19.2.8):** Modern functional components with hooks (`useState`).
* **Vite (`vite` 8.3.0, `@vitejs/plugin-react` 6.1.1):** Fast development server and module bundler.
* **Tailwind CSS (`tailwindcss` 4.3.3, `@tailwindcss/vite` 4.3.3):** Utility-first styling with responsive design.
* **Oxlint (`oxlint` 1.81.0):** High-performance JavaScript linter.
* **JavaScript (ES Modules):** Native ES module syntax across the frontend codebase.

### Backend
* **Node.js (`type: "module"`):** Modern ES module runtime.
* **Express (`express` 4.21.2):** Minimalist web framework for routing and middleware.
* **Groq SDK (`groq-sdk` 1.6.0):** Official client for Groq's high-speed inference engine.
* **CORS (`cors` 2.8.5):** Cross-Origin Resource Sharing middleware.
* **Dotenv (`dotenv` 16.4.7):** Environment variable management.

### AI Model
* **Model:** `openai/gpt-oss-20b` (hosted on Groq).
* **Format:** Structured Outputs (`response_format: { type: 'json_schema', strict: true, ... }`).
* **Token Budget:** Configured with `max_completion_tokens: 3000` to prevent output truncation.

---

## 4. Project Structure

```text
Study_Quiz/
├── client/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── DifficultySelector.jsx   # 3-column difficulty toggle buttons
│   │   │   ├── QuizForm.jsx             # Topic and difficulty input form
│   │   │   ├── QuizResult.jsx           # Score display and Try Again / Review actions
│   │   │   ├── QuizReview.jsx           # Answer breakdown and AI explanations view
│   │   │   ├── QuizView.jsx             # Active question presenter & screen router
│   │   │   └── StatusAlert.jsx          # Warning and error alert banner
│   │   ├── hooks/
│   │   │   └── useQuiz.js               # Custom hook for question state & scoring logic
│   │   ├── services/
│   │   │   └── quizApi.js               # Frontend fetch and HTTP API client
│   │   ├── utils/
│   │   │   └── errorUtils.js            # User-friendly error sanitization utility
│   │   ├── App.jsx                      # Main UI orchestration and application state
│   │   ├── index.css                    # Tailwind CSS import
│   │   └── main.jsx                     # React DOM root entry point
│   ├── index.html                       # HTML shell
│   ├── package.json                     # Client scripts and dependencies
│   └── vite.config.js                   # Vite and Tailwind plugin configuration
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── quizController.js        # Request validation and route controller
│   │   ├── schemas/
│   │   │   └── quizSchema.js            # JSON Schema for Groq structured output
│   │   ├── services/
│   │   │   └── quizService.js           # Groq SDK client, prompt, and retry logic
│   │   ├── validators/
│   │   │   └── quizValidator.js         # Authoritative quiz structural validator
│   │   └── index.js                     # Express app setup, CORS, and route mounting
│   ├── .env.example                     # Environment variable template
│   └── package.json                     # Server scripts and dependencies
│
├── .gitignore                           # Git ignore rules for node_modules and .env
└── README.md                            # Project documentation
```

---

## 5. Architecture

### Component Hierarchy
```text
App.jsx (UI State: topic, difficulty, loading, error, quiz)
   │
   ├── QuizForm.jsx (when quiz === null)
   │      ├── DifficultySelector.jsx
   │      └── StatusAlert.jsx
   │
   └── QuizView.jsx (when quiz !== null)
          │
          ├── useQuiz.js (Custom Hook: index, selectedAnswers, score, navigation)
          │
          ├── [Active Question View] (default)
          ├── QuizResult.jsx (when showResult === true)
          └── QuizReview.jsx (when showReview === true)
```

### Data & API Flow
```text
[React Client: App.jsx]
       │
       ▼
[quizApi.js] ─────────────── POST /api/generate-quiz ───────────────┐
                                                                    ▼
                                                        [Express: index.js]
                                                                    │
                                                                    ▼
                                                        [quizController.js]
                                                        (validates topic & difficulty)
                                                                    │
                                                                    ▼
                                                        [quizService.js]
                                                        (builds prompt & invokes Groq)
                                                                    │
                                                                    ▼
                                                        [Groq API: openai/gpt-oss-20b]
                                                        (structured JSON response)
                                                                    │
                                                                    ▼
                                                        [JSON.parse()]
                                                                    │
                                                                    ▼
                                                        [quizValidator.js]
                                                        (authoritative structural check)
                                                                    │
[App.jsx / errorUtils.js] ◄─── HTTP 200 { success: true, quiz } ────┘
(displays quiz or clean error)
```

### Module Responsibilities
* **`App.jsx`:** Manages high-level UI states (`topic`, `difficulty`, `isLoading`, `apiError`, `quiz`) and swaps between `QuizForm` and `QuizView`.
* **`QuizForm.jsx`:** Captures user input, handles form submission, and displays validation/API alerts.
* **`QuizView.jsx`:** Pure presentation component that renders the active question, choices, or result/review screens.
* **`useQuiz.js`:** Custom React hook encapsulating question index progression, selected answers map, score computation, and view transitions.
* **`quizApi.js`:** Isolates network `fetch()` calls, URL resolution, response parsing, and error creation.
* **`errorUtils.js`:** Framework-independent utility converting raw errors or network failures into safe user-facing text.
* **`quizController.js`:** Validates request parameters and delegates to the service layer.
* **`quizService.js`:** Initializes the Groq client, structures prompt rules, enforces schema output, and includes a transient-error retry loop.
* **`quizSchema.js`:** Defines the JSON Schema passed to Groq Structured Outputs.
* **`quizValidator.js`:** Authoritative validator that verifies question count, option counts, unique option IDs, and answer integrity.

---

## 6. Prerequisites

Ensure you have the following installed on your system:

* **Node.js:** v18.0.0 or higher (v20+ recommended).
* **npm:** v9.0.0 or higher.
* **Groq API Key:** A free API key obtained from [Groq Console](https://console.groq.com/keys).

---

## 7. Environment Variables

All environment variables belong exclusively to the backend server. **Never place API keys in the client application.**

### Backend (`server/.env`)

Create a file named `.env` in the `server/` directory (you can copy `server/.env.example`):

```env
# Server Port
PORT=5000

# Client URL (for CORS allowance)
CLIENT_URL=http://localhost:5173

# Groq API Key (Required)
GROQ_API_KEY=your_groq_api_key_here
```

### Frontend (`client/.env`)

Optional. By default, `client/src/services/quizApi.js` communicates with `http://localhost:5000` via:

```js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

If your backend runs on a different port or host, create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

> **Security Note:** The `.gitignore` file is configured to prevent `.env` files from being committed to Git. Only `.env.example` is tracked.

---

## 8. Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Study_Quiz
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Configure Backend Environment Variables:**
   ```bash
   cp .env.example .env
   ```
   Open `server/.env` and replace `your_groq_api_key_here` with your actual Groq API key.

4. **Install Frontend Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

---

## 9. Running the Application

The backend and frontend run in separate terminal sessions.

### Terminal 1: Backend Server

From the `server/` directory:

```bash
cd server
npm run dev
```

* Runs `node --watch src/index.js`.
* Server listens on: `http://localhost:5000`.
* Health check endpoint: `http://localhost:5000/api/health`.

*(Alternatively, run `npm start` for production execution without file watching).*

### Terminal 2: Frontend Client

From the `client/` directory:

```bash
cd client
npm run dev
```

* Runs Vite development server.
* Client is accessible at: `http://localhost:5173`.

---

## 10. Usage & Evaluation Flow

For evaluators testing the application, follow this end-to-end flow:

1. **Open Frontend:** Navigate to `http://localhost:5173` in your browser.
2. **Form Validation Check:** Click **Generate Quiz** with an empty topic input. Verify that a warning alert appears: *"Please enter a quiz topic before submitting."*
3. **Submit Valid Topic:** Enter a topic (e.g., *"JavaScript Promises"*) and select a difficulty (e.g., **Medium**).
4. **Loading State:** Click **Generate Quiz**. Observe the spinner and *"Generating quiz..."* button label. The button is disabled to prevent duplicate submissions.
5. **Answer Questions:**
   * Question 1 displays with 4 distinct options.
   * Clicking an option highlights it with an active border and background.
   * Click **Next** to proceed to Question 2.
   * Repeat through Question 5.
6. **Finish Quiz:** On Question 5, the action button changes to **Finish**. Clicking it calculates the score and routes to the result screen.
7. **Result Screen:** Verify your score is shown in `X / 5` format with percentage and contextual feedback.
8. **Review Answers:** Click **Review Answers**. Verify that all 5 questions display:
   * The user's selected choice.
   * A **Correct** (green) or **Incorrect** (red) status badge.
   * The correct answer (if the user was incorrect).
   * A detailed AI-generated explanation.
9. **Back to Result:** Click **Back to Result** to return to the score card.
10. **Try Again:** Click **Try Again**. Verify the quiz resets to Question 1 with cleared answers, without triggering any network request.
11. **New Quiz:** Click **New Quiz** in the header. Verify the application returns to the topic entry form.

---

## 11. AI Integration & Output Validation

### Model & Configuration
The service connects to Groq using the `openai/gpt-oss-20b` model with Structured Outputs:

```javascript
const chatCompletion = await groq.chat.completions.create({
  model: 'openai/gpt-oss-20b',
  max_completion_tokens: 3000,
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'quiz',
      strict: true,
      schema: quizSchema,
    },
  },
  messages: [{ role: 'user', content: prompt }],
});
```

### Schema & Structural Verification Pipeline
1. **Schema Enforcement:** Groq enforces `quizSchema` at inference time.
2. **JSON Parsing:** `quizService.js` safely parses the raw string response via `JSON.parse()`.
3. **Authoritative Validator (`quizValidator.js`):** Validates the parsed object against strict programmatic rules:
   * Root must be a non-null object (not an array).
   * `title` must be a non-empty string.
   * `questions` must be an array of **exactly 5** elements.
   * Each question must contain non-empty `id`, `question`, `options`, `correctAnswer`, and `explanation`.
   * Each question must contain **exactly 4** options.
   * Option IDs within each question must be unique.
   * `correctAnswer` must match one of the question's option IDs.
4. **Auto-Retry:** If the LLM produces a transient formatting glitch, `quizService.js` automatically retries once before surfacing an error.

> **Important Notice on AI Output:** While multi-tiered structural validation guarantees that the JSON strictly matches the expected quiz contract, it **does not guarantee the factual accuracy** of the AI-generated subject matter.

---

## 12. Error Handling

The application implements defense-in-depth error handling across both layers:

| Failure Scenario | Where Handled | User-Facing Behavior |
| :--- | :--- | :--- |
| **Empty Topic** | `App.jsx` | Shows warning alert: *"Please enter a quiz topic before submitting."* |
| **Invalid Difficulty** | `App.jsx` & `quizController.js` | Shows warning alert: *"Please select a valid difficulty: Easy, Medium, or Hard."* |
| **Duplicate Submission** | `App.jsx` & `QuizForm.jsx` | Button disabled, `if (isLoading) return;` guard blocks extra requests. |
| **Backend Offline / Network Error** | `quizApi.js` & `errorUtils.js` | Shows error alert: *"Unable to connect to the quiz service. Please check your connection and try again."* |
| **Non-JSON Server Error (e.g. 502/HTML)** | `quizApi.js` & `errorUtils.js` | Shows error alert: *"Something went wrong while generating the quiz. Please try again."* |
| **Rate Limit / High Traffic (429)** | `errorUtils.js` | Shows error alert: *"The quiz service is currently experiencing high demand. Please wait a moment and try again."* |
| **Malformed / Incomplete AI Payload** | `quizValidator.js` & `quizApi.js` | Shows error alert: *"The quiz response was incomplete. Please try again."* |
| **Raw Groq / Schema Technical Dumps** | `quizController.js` & `errorUtils.js` | Shielded. Stack traces and raw JSON are logged to backend console; frontend receives a sanitized, friendly message. |

---

## 13. AI Usage Note

In accordance with academic and internship disclosure guidelines, this project was developed with the assistance of AI tools:

* **Antigravity (Google DeepMind):** Used as an agentic coding assistant for scaffolding, implementing component architecture, performing incremental refactoring, managing Tailwind CSS styling, and debugging integration issues.
* **ChatGPT (OpenAI):** Used for technical research, understanding Structured Outputs on Groq, evaluating state-management trade-offs (custom hooks vs. state libraries), and reviewing error-handling patterns.

All AI-suggested code, schemas, and configurations were reviewed, tested, debugged, and evaluated during development rather than being accepted blindly.

---

## 14. Known Limitations

* **Factual Accuracy:** AI-generated quiz questions may occasionally contain hallucinated facts or outdated technical information despite passing structural validation.
* **API Dependency:** The application requires an active internet connection and an operational Groq API service with a valid API key.
* **State Volatility:** Quiz state is held in React component memory (`useState`). Reloading the browser page resets the application back to the topic entry form.
* **Fixed Quiz Dimensions:** The quiz format is intentionally fixed to 5 questions with 4 choices per question as specified by the assignment requirements.
* **No Persistence or Authentication:** There is intentionally no user account system, persistent database, or historical score tracking.

---

## 15. Time Spent

**Approximately 8–9 hours** (covering planning, base frontend/backend setup, Groq Structured Outputs integration, backend validation pipeline, interactive UI and navigation, scoring, review screen, mobile responsiveness pass, and architectural refactoring).
