## Development Log

### August 11, 2025 - Login Page Implementation

#### Context

- This project is the final module of an internship course, focusing on building a Budget Tracking App using React + Vite (TypeScript), Tailwind CSS, and Node.js/Express with MongoDB.
- The initial task was to develop the Login page as the entry point, following Figma designs provided by the user.
- The goal is to create a responsive UI with form validation, dummy login logic, and placeholder routes for Dashboard, SignUp, and ResetPassword pages.

#### Implementation Details

- **UI/UX:**
  - Designed a split-layout page with a form on the left and an illustration on the right, separated by a custom image (`separator-line.png`).
  - Used Tailwind CSS for styling, with a color scheme including purple (`#6D28D9`) for buttons and links, blue (`#EFF6FF`) for input borders, and red (`#EF4444`) for error messages.
  - Incorporated Poppins font family for consistency with the design.
  - Added a toggle for password visibility using Heroicons (eye/eye-slash icons), with plans to replace with custom icons if provided.
- **Functionality:**
  - Implemented form handling with React Hook Form, requiring email and password fields with basic validation.
  - Added dummy login logic: redirects to `/dashboard` if email is "test@gmail.com" and password is "password123", else shows "Invalid email or password" error.
  - Used React Router for navigation between Login, SignUp, ResetPassword, and Dashboard (placeholder) pages.
- **Technical Decisions:**
  - Chose to use inline style fallbacks (`style={{ color: '#6D28D9' }}` for links, `style={{ backgroundColor: '#6D28D9' }}` for the button, `style={{ color: '#EF4444' }}` for errors) to ensure colors display while debugging Tailwind issues. These will be removed once Tailwind rendering is confirmed.
  - Opted for a vertical separator image instead of a CSS border, as per user preference, with the image file imported from `src/assets`.
  - Decided to complete frontend UI/UX (Login, SignUp, ResetPassword) before starting backend integration to align design with functionality later.
- **Challenges and Resolutions:**
  - Encountered issues with Tailwind colors not applying (button invisible, links black, error messages black), potentially due to caching or build issues. Added fallbacks and suggested clearing the `.vite` cache.
  - Resolved TypeScript errors (e.g., `SubmitHandler` type import) by using `import type` with `"verbatimModuleSyntax": true` in `tsconfig.app.json`.
  - Fixed casing issues with file names (e.g., `SignUp.tsx`) to ensure consistency.

#### Next Steps

- Verify the Login page UI matches the Figma design (e.g., error messages in red, link colors, button visibility).
- Proceed to implement the SignUp page once UI/UX details are provided by the user.
- Plan to integrate backend (Node.js/Express, MongoDB Atlas, JWT auth) after completing frontend UI/UX.

#### Review Notes

- Please check the red color application for error messages and confirm image file paths (`logo.png`, `login-illustration.png`, `separator-line.png`).
- Suggest testing on different screen sizes for responsiveness.
- Review the dummy login logic and plan for real authentication in the next phase.
