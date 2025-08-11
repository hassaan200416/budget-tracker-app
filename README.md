## Development Log

### August 11, 2025 - Login and SignUp Page Implementation

#### Context

- This project focus on building a Budget Tracking App using React + Vite (TypeScript), Tailwind CSS, and Node.js/Express with MongoDB.
- The task progressed from developing the Login page to the SignUp page, following Figma designs provided by the user.
- The goal is to create a responsive UI with form validation, dummy logic, and placeholder routes for Dashboard, SignUp, and ResetPassword pages.

#### Implementation Details

- **UI/UX:**
  - Designed a split-layout for both Login and SignUp pages, with forms on the left, a custom separator image (`separator-line.png`), and illustrations on the right.
  - Used Tailwind CSS for styling, with a color scheme including purple (`#6D28D9`) for buttons and links, blue (`#EFF6FF`) for input borders, and red (`#EF4444`) for error messages.
  - Incorporated Poppins font family for consistency with the design.
  - Added a toggle for password visibility using Heroicons (eye/eye-slash icons), with plans to replace with custom icons if provided.
- **Functionality:**
  - Implemented form handling with React Hook Form for both pages, requiring fields with basic validation.
  - Login page: Dummy logic redirects to `/dashboard` if email is "test@gmail.com" and password is "password123", else shows "Invalid email or password" error.
  - SignUp page: Added First Name, Last Name, Email, Password, Confirm Password, and Budget Limit fields. Validates that Password and Confirm Password match, with a redirect to `/dashboard` on success.
  - Used React Router for navigation between Login, SignUp, ResetPassword, and Dashboard (placeholder) pages.
- **Technical Decisions:**
  - Chose to use inline style fallbacks (`style={{ color: '#6D28D9' }}` for links, `style={{ backgroundColor: '#6D28D9' }}` for buttons, `style={{ color: '#EF4444' }}` for errors) to ensure colors display while debugging Tailwind issues. These will be removed once Tailwind rendering is confirmed.
  - Opted for a vertical separator image instead of a CSS border, as per user preference, with the image file imported from `src/assets/images`.
  - Updated image import paths to reflect the new `src/assets/images/` folder structure.
  - Decided to complete frontend UI/UX (Login, SignUp, ResetPassword) before starting backend integration to align design with functionality later.
- **Challenges and Resolutions:**
  - Encountered issues with Tailwind colors not applying (button invisible, links black, error messages black), potentially due to caching or build issues. Added fallbacks and suggested clearing the `.vite` cache.
  - Resolved TypeScript errors (e.g., `SubmitHandler` type import) by using `import type` with `"verbatimModuleSyntax": true` in `tsconfig.app.json`.
  - Fixed casing issues with file names (e.g., `SignUp.tsx`) to ensure consistency.

#### Next Steps

- Verify the SignUp page UI matches the Figma design (e.g., error messages in red, link colors, button visibility, image loading).
- Proceed to implement the ResetPassword page once UI/UX details are provided by the user.
- Plan to integrate backend (Node.js/Express, MongoDB Atlas, JWT auth) after completing frontend UI/UX.

#### Review Notes

- Please check the image loading from `src/assets/images/` and confirm file paths (`logo.png`, `login-illustration.png` or `signup-illustration.png`, `separator-line.png`).
- Suggest testing on different screen sizes for responsiveness.
- Review the dummy sign-up logic and plan for real authentication in the next phase.
