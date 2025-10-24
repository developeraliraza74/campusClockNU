# CampusClock: Intelligent Timetable Assistant

This document outlines the CampusClock project, from problem identification to its innovative solution, as a smart assistant for students.

---

### 01. Problem Understanding & Research

#### The Problem: Inefficient and Stressful Schedule Management for Students

University and college students constantly juggle complex, often changing, class schedules. The traditional method of managing these timetables involves:
1.  **Manual Data Entry:** Tediously inputting each class, room number, and time into a digital calendar or setting dozens of individual alarms.
2.  **High Cognitive Load:** Constantly checking the time and location for the next class, which adds to mental clutter and stress.
3.  **Risk of Human Error:** A single mistake in setting an alarm can lead to a missed class, academic penalties, or falling behind on crucial coursework.

This problem is particularly acute for students who struggle with executive functions, such as those with ADHD, where time management and organization are significant challenges.

#### Why It's Important:

-   **Academic Performance:** Missing classes directly impacts grades. A study from Harvard University found a strong correlation between class attendance and final grades.
-   **Student Well-being:** According to the American College Health Association, **over 60% of students** report feeling "overwhelming anxiety." Poor time management and the fear of missing obligations are major contributors to this stress.
-   **Real-Life Example:** A student has back-to-back classes in buildings on opposite sides of campus. A simple "class starts in 10 minutes" alarm is useless; they need an intelligent reminder to start packing and leave their *current* class *before* it even ends.

---

### 02. Proposed Solution

#### The Idea: CampusClock - An AI-Powered Timetable Assistant

CampusClock is a web application designed to eliminate the manual work and anxiety associated with managing a student's schedule. It acts as a smart personal assistant that understands a student's academic life.

#### How It Solves the Problem:

1.  **Effortless Onboarding:** Instead of manual entry, a student simply **uploads an image** of their timetable. The app uses AI to instantly digitize it.
2.  **Intelligent Alarms:** CampusClock goes beyond simple time-based reminders. It uses AI-driven logic to provide context-aware alerts. For example, it can trigger a "Time to pack up!" reminder before a consecutive class or a "Get ready for your first class" alarm in the morning.
3.  **Centralized & Clear View:** It presents the entire week's schedule in a clean, easy-to-read interface, automatically calculating free periods and highlighting consecutive classes.
4.  **Reduces Cognitive Load:** By automating reminders and schedule management, the app frees up mental energy, allowing students to focus on their studies rather than on logistics.

---

### 03. Prototype / Model Demonstration

The current application is a fully functional prototype that demonstrates the core features:

1.  **Timetable Upload:** The user is greeted with a welcome screen and prompted to upload an image. A dialog allows them to select a photo of their schedule.

2.  **AI-Powered OCR and Analysis:** On upload, the image is sent to a Genkit AI flow. This flow uses the **Gemini 2.5 Vision** model to perform Optical Character Recognition (OCR), extracting the subject, room number, time, and day for each class into a structured format.

3.  **Dynamic Schedule Display:** The extracted data is immediately processed and displayed in a user-friendly tabbed view, organized by day of the week. Free periods are automatically calculated and shown.

4.  **Context-Aware Reminders:** An `AlarmManager` component runs in the background, checking the time every minute. It uses AI flows to reason about the user's schedule and triggers full-screen, un-missable reminders for upcoming classes or when it's time to move between consecutive classes.

5.  **Full CRUD Functionality:** Users can easily **edit** class details or **delete** a class directly from the UI, giving them full control over their digitized schedule.

---

### 04. Feasibility & Technology Used

The solution is highly feasible and built using a modern, scalable tech stack. No complex server infrastructure is required, as it leverages serverless functions and browser capabilities.

#### Core Technologies:

-   **Frontend Framework:** **Next.js (App Router)** for a high-performance, server-rendered React application.
-   **UI Components:** **shadcn/ui** and **Tailwind CSS** for a professional, responsive, and aesthetically pleasing design system.
-   **Generative AI:**
    -   **Genkit:** An open-source AI framework from Google used to build robust, production-ready AI flows.
    -   **Google's Gemini Models:** The `gemini-2.5-flash-image-preview` model is used for its powerful vision capabilities to analyze the timetable image. The text model is used for the reasoning behind the intelligent alarms.
-   **State Management:** **React Context API** and **`localStorage`** are used to manage and persist the user's schedule on the client-side, ensuring the data is available even after closing the browser.
-   **Utilities:** **`date-fns`** for reliable date/time calculations and **`lucide-react`** for icons.

The application is designed to be deployed on modern hosting platforms like Netlify or Firebase App Hosting, which can handle the serverless AI functions seamlessly.

---

### 05. Impact & Innovation

#### Expected Impact:

-   **Reduced Student Stress:** By automating a tedious and anxiety-inducing task, CampusClock directly contributes to better student mental health.
-   **Improved Academic Consistency:** Reliable and intelligent reminders help prevent missed classes, leading to better attendance and improved academic outcomes.
-   **Increased Accessibility:** The app provides crucial support for students with executive function disorders like ADHD, leveling the playing field by offering an external "scaffold" for time management.

#### What Makes It Innovative:

-   **Zero-Effort Setup:** The "image-to-schedule" feature is the core innovation. It transforms a high-friction task (manual data entry) into a simple, two-click process.
-   **Contextual AI Reasoning:** Unlike a standard calendar, CampusClock doesn't just know *when* a class is; it understands the *context*—such as a class being consecutive—and uses AI to generate more helpful, proactive reminders.
-   **Social Impact:** This is more than a utility app; it's a tool for well-being and academic equity. By simplifying a universal student challenge, it has the potential to make a tangible, positive impact on the daily lives of millions of students.
