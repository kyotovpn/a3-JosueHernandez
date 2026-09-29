## 10 Second Clicker Challenge
===

https://a3-josuehernandez.onrender.com/

A retro-styled clicker game: click a button as many times as you can in 10 seconds, then submit your score with a short note to a shared leaderboard. Scores persist in MongoDB and are tied to your GitHub account, so you can only edit or delete your own entries.

- **Goal**: build a two-tier web app (Express + MongoDB) with authenticated CRUD on user-owned data, styled with a CSS framework.
- **Challenges**: wiring up Passport's GitHub OAuth session flow (serialize/deserialize, callback URL handling between local dev and the Render deployment) and enforcing per-user ownership on edit/delete so one player can't modify or remove another's score.
- **Authentication strategy**: GitHub OAuth via passport-github2. Chosen over a username/password scheme because it avoids storing credentials and was the more natural fit for a lightweight game leaderboard.
- **CSS framework**: NES.css, chosen deliberately as the exception the assignment allows for game-like sites — it gives the leaderboard and clicker UI a retro arcade look with minimal custom CSS.

## Technical Achievements
- **Tech Achievement 1**: OAuth authentication via the GitHub strategy (passport-github2), gating score submission, editing, and deletion behind `req.isAuthenticated()`.
- **Tech Achievement 2**: Lighthouse test score: Performance 98, Accessibility 100, Best Practices 100, SEO 100
 - Performance is hard to get 100% because of the css framework.
![Lighthouse scores](lighthouse-score.png)
- **Tech Achievement 3**: Express middleware packages used:
  - `express-session` — manages signed session cookies so a logged-in user stays authenticated across requests.
  - `passport` — handles authentication state, serializing/deserializing the logged-in user into the session.
  - `passport-github2` — implements the GitHub OAuth2 strategy used by Passport to authenticate users.
### Design/Evaluation Achievements
None

