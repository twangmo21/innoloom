# Innoloom — Grade IX DTI Frontend Prototype

A plain HTML, CSS and JavaScript prototype. It runs in VS Code with Live Server; no Node.js install or build step is required.

## Run in VS Code

1. Extract the ZIP archive.
2. Open the `innoloom-vscode-project` folder in VS Code.
3. Install the **Live Server** extension if it is not already installed.
4. Open `index.html`, right-click, and choose **Open with Live Server**.
5. Create an account using Sign Up. Select Student or Teacher to test the corresponding pages.

## Included features

- Larger Innoloom prototype logo in the header and authentication pages.
- Navigation order: Courses, Resources, Feedback, About.
- Separate Login and Sign Up pages with client-side validation.
- No visible demo credentials and no pre-created demo accounts.
- Homepage Achievement Spotlight with criteria calculated from student activity: Progress Leader, Badge Collector and Assessment Star.
- Course overview, Chapter 13 introduction and overview.
- Persistent course menu and fixed progress tracker.
- Sequential course navigation: users must complete a section and mark it complete before opening the next section.
- Module 1: Internet/WWW infographic and a six-item drag-and-drop grading assessment (no separate MCQ assessment).
- Module 2: downloadable interactive Web Server sample video with two checkpoint questions, playback-speed selection and an 8-question graded MCQ assessment.
- Module 3: four clickable reading sections (Web Browser, HTTP, HTTPS and Differences), a Back to four sections button, and an 8-question graded MCQ assessment.
- Module 4: downloadable interactive Website sample video, two subtopics and an 8-question graded MCQ assessment.
- Module 5: HTML lessons, a browser-based Interactive HTML Coding Lab with four sequential challenges (heading, paragraph, hyperlink and complete webpage), live preview, Run Code feedback, hints, saved drafts and a required hyperlink quick check; plus mini-project, extension challenge and an 8-question graded MCQ assessment.
- Module 6: I DO / WE DO / YOU DO and an 8-question graded MCQ assessment.
- Course Summary: integrated Chapter 13 revision guide with expandable topics, comparison tables, HTML examples, quick facts and exam-style questions.
- MCQ pass mark is 70%; unsuccessful attempts can be retried.
- Module completion badge pop-ups and an overall course completion badge.
- Teacher dashboard to create classes, assign registered students by email and view class progress.
- Resources page with exactly three entries: the downloadable Internet and WWW infographic, W3Schools HTTP learning page, and GeeksforGeeks Web Browser article. Sample videos remain downloadable from their respective module lessons.

## Resources

External learning links open in a new browser tab. Local assets (infographic and sample videos) are downloadable from the Resources page and learning lessons.

## Important limitations

This is a frontend-only prototype. Accounts, course progress, assessment attempts, badges, classes and feedback are stored in the browser's `localStorage`. This is not a secure multi-user system and is not suitable for real student accounts or real personal data. Before deployment, move authentication and progress storage to a backend/database, hash passwords on the server, enforce course and teacher permissions server-side, use secure sessions and HTTPS, and add appropriate student privacy protections.

## Sample videos

The Web Server and Website videos in `assets/videos/` are short original sample slide-videos. Each pauses for two checkpoint questions, supports playback speeds from 0.5× to 2×, and includes a download link. Replace the sample MP4 files with approved course videos when they are ready. Keep the same filenames or update `js/app.js`.

## Assessment notes

- Modules 2–6 each have an 8-question multiple-choice graded assessment.
- Module 1 uses its six-item drag-and-drop activity as its only graded assessment; there is no separate Module 1 MCQ assessment.
- Correct answer positions are varied across the options; they are not all placed first.
- The overall course assessment has 10 questions.
- The pass mark is 70%; an unsuccessful attempt can be retried.

## Resource links checked

The external learning links point to official MDN Web Docs, W3Schools and Cloudflare learning pages. These links were opened and checked during preparation. External websites may update their page addresses or content over time.


## Module 3 reading content

The four Module 3 sections use the uploaded `Reading material (Wb).docx` as their content source, including its browser examples image, HTTP request/response diagram, HTTPS encrypted-response diagram and HTTP/HTTPS comparison chart. Each reading page has a completion action and a Back to the four sections button. The next reading tile unlocks after the current one has been marked complete.


## Interactive HTML Coding Lab

The Module 5 “Build the Page Step by Step” item is now an in-course coding lab. Students write HTML in the provided editor, click Run Code, see the result in a sandboxed browser preview, and receive feedback against the challenge success checks. Four challenges unlock in sequence: create a heading, introduce yourself with a paragraph, create a hyperlink with an `href`, and combine all three in a complete webpage. The final `href` quick check is required before the lab section is marked complete. Drafts and challenge progress are saved in the browser. The preview runs HTML only; scripts are disabled for safety.


## Colour palette update

The interface now uses the supplied soft-blue palette: page background **#F1F6FC**, white content panels **#FFFFFF**, soft-blue borders **#DCE8F5**, and the established dark-navy text **#1D3557**. The header uses the pale page background and the navigation bar retains a dark-navy fill for contrast.


## Reference design update

The visual styling follows the supplied feedback-page reference: full-page very soft blue background (#F1F6FC) with layered curved blue waves, a pale-blue header strip, dark navy navigation and pill-shaped Login / Sign Up links, a large circular Innoloom logo, white rounded content cards with soft-blue borders (#DCE8F5), navy text, and a centred feedback card with icon, divider, labels and rounded fields. The layout is responsive for mobile screens.
