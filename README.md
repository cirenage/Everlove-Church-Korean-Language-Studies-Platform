# Everlove Church — Korean Language Studies Platform
**South Korea (늘사랑교회)**  
**Project Lead:** Joy Jieun Choi, Committee Leader  
**Software Architecture:** Eric E. Egan  

---

## 1. Executive Summary & Purpose

The **Everlove Church Korean Language Studies Platform** is an end-to-end, database-connected application and class-organization platform designed for foreign residents living in South Korea. It enables learners to submit digital applications, allows authorized church administrators to manage submissions, dynamically edit and reconcile questionnaires, and perform explainable, human-confirmed learner–instructor matching.

---

## 2. Branding & Visual System

- **Primary Green:** `#008C50`
- **Fresh Green:** `#4AA83C`
- **Warm Orange:** `#F3981B`
- **Dark Charcoal:** `#333333`
- **Light Background:** `#F5F7F5`
- **Official Church Logo:** `/assets/aistudio/Logo-everlove_7b5be5cf.png`
- **Typography:** `Inter` (English) and `Noto Sans KR` (Korean)

---

## 3. Implemented Modules

### Module A — Public Website & Program Information
- Hero section matching the Figma design: *"Your next chapter starts with Korean."*
- Learning levels guide: **Beginner** (*New to Korean*), **Elementary** (*Build your foundations*), **Intermediate** (*Grow your confidence*).
- 3-Stage Pathway: 01 Apply online → 02 Application review → 03 Instructor matching.
- Bilingual localization toggle (English / 한국어).
- Frequently Asked Questions accordion and learner support notices.
- Provisional disclaimer: *"Committee review concept · Program details are not yet confirmed."*

### Module B — Dynamic Application Form Builder
- Full mapping and reconciliation of all **36 original source questions** across 8 sections from the church paper application form.
- Configurable field types: `short_text`, `long_text`, `radio`, `checkbox`, `dropdown`, `email`, `phone`, `date`, `consent`.
- Reorder questions, toggle required/optional, toggle active/disabled.
- Save Draft to Firestore `formTemplates`.
- Versioned publishing workflow (e.g., `v1.0` → `v1.1`) ensuring historical applications are never altered.
- Export questionnaire configuration as JSON.

### Module C — Learner Application Workflow
- Multi-step questionnaire adhering to the Figma design:
  - **Step 0:** Guide (*Before you start your application*)
  - **Step 1:** Personal & contact (*Let's start with you*)
  - **Step 2:** Residence & background (*Tell us a little about your background*)
  - **Step 3:** Korean experience & proficiency (*Where are you with Korean today?*)
  - **Step 4:** Goals & preferences (*What would you like Korean to open up?*)
  - **Step 5:** Availability & schedule (*Interactive KST 7-day × 3-time-window grid*)
  - **Step 6:** Additional information, provisional privacy notice & consent declaration
  - **Step 7:** Section-by-section review with Edit buttons
  - **Step 8:** Submission confirmation with generated reference code (e.g. `SAMPLE-EL-2026-0042`)
- **"Fill Example Data (Avery)"** shortcut button for instantaneous 5-second committee demonstration testing.
- Client-side auto-save and draft recovery from browser storage.

### Module D — Authentication & Role-Based Access
- Real Firebase Authentication (`firebase/auth`) with Google Sign-In popup.
- Trusted database role assignments (`superAdmin`, `churchAdmin`, `instructor`, `applicant`, `committeeReviewer`).
- Role simulation selector for committee walkthroughs.
- Hardened `firestore.rules` preventing unauthorized writes and enforcing zero-trust ABAC rules.

### Module E — Administrator Dashboard
- Real-time Firestore analytics:
  - Total Applications
  - New Submissions (Needs Review)
  - Under Review
  - Ready for Matching
  - Matched Learners
  - Available Instructor Slots
- Interactive charts using `recharts` for status distribution and self-assessed proficiency.
- Recent applications feed and quick-action shortcuts.

### Module F — Application Management
- Full applicant directory with search by name, email, or reference number.
- Filters by status, Korean level, and class format (in-person vs online).
- Detailed modal displaying answers organized by section.
- Status workflow: `Submitted` → `Under Review` → `Information Required` → `Ready for Matching` → `Matched` → `Waitlisted` → `Withdrawn` → `Closed`.
- Internal administrative review notes with full audit history events.
- Direct shortcut to launch matching workspace.
- Export applications report to JSON.

### Module G — Instructor Management
- Working directory of church instructors.
- Add and edit instructor profiles with:
  - Supported Korean proficiency levels
  - Language support capabilities (English, Spanish, Chinese, Korean)
  - Class format (in-person, online, hybrid)
  - Operating locations (Daejeon, KAIST campus, Online)
  - Weekly availability time slots
  - Maximum student capacity & currently assigned students.

### Module H — Student–Instructor Matching Workspace
- Transparent, explainable rule-based matching engine comparing:
  1. Korean level compatibility (+35 pts)
  2. Class format compatibility (+20 pts)
  3. Weekly schedule overlap (+30 pts)
  4. Language support (+10 pts)
  5. Slot capacity (+5 pts)
- Algorithmic breakdown displaying transparent reasons for each recommendation.
- One-click confirmation modal that atomically records the assignment in `matches`, updates the application status to `matched`, and increments the instructor's student count.

### Module J — Committee Feedback & Review Registry
- Dedicated **Committee Review** tab.
- Global **"Give Feedback"** button accessible on every screen.
- Committee members can classify each feature as:
  - `Approved` (Confirmed for production baseline)
  - `Requires Changes` (Policy or copy adjustment needed)
  - `Deferred` (Pending church committee decision)
- Submissions stored independently in Firestore `committeeFeedback` collection.

### Demonstration Mode (Fictional Data)
- Prominent `DEMONSTRATION MODE` banner.
- **1-Click Seed Sample Data:** Generates 5 realistic fictional applicants (Avery Example, Carlos Gomez, Linh Nguyen, Sarah Jenkins, Kenji Sato), 4 instructors, sample matches, and sample committee reviews.
- **1-Click Clear Demo Data:** Safely wipes only synthetic records tagged with `isDemo: true`.

---

## 4. Completed, Partial, and Deferred Feature Status

| Module / Feature | Status | Implementation Details |
| :--- | :--- | :--- |
| **Public Landing Page** | **Complete** | Pixel-accurate replication of Figma Page 1 with level cards, pathway, FAQs, and logo. |
| **Dynamic Form Engine** | **Complete** | Database-driven template with all 36 original source questions, draft/publish versions. |
| **Learner Application Wizard** | **Complete** | 6-step flow matching Figma Pages 2–10 with KST timetable, review screen, and confirmation. |
| **Firebase Auth & Firestore** | **Complete** | Initialized with dedicated `firestoreDatabaseId`, tested connection, deployed rules. |
| **Admin Dashboard** | **Complete** | Live KPI cards, Recharts visualizations, and recent applications feed. |
| **Application Review Workflow** | **Complete** | Status transition engine, internal review notes, and traceable history events. |
| **Instructor Directory** | **Complete** | Instructor CRUD, capacity management, format, and availability windows. |
| **Rule-Based Matching** | **Complete** | Explainable scoring, schedule overlap intersection, and match assignment. |
| **Committee Feedback System**| **Complete** | Floating review modal, decision tracking (Approved/Changes/Deferred), and dashboard. |
| **Demo Seeding & Wipe** | **Complete** | 1-click synthetic data generation and safe removal without touching real records. |
| **Email / SMS Notifications** | *Deferred* | Intentionally deferred per prompt until church approves sender credentials & templates. |
| **Payment / LMS / Video Class**| *Excluded* | Intentionally excluded per project brief (not a full LMS). |
