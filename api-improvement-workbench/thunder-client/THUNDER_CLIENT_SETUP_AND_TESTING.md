# Thunder Client Setup and API Testing (VS Code)

Generated on: 2026-04-06

## A) What Thunder Client Is

1. Thunder Client.
Definition: a lightweight REST API client extension inside VS Code (similar to Postman).

2. Collection.
Definition: a folder of saved API requests (auth, profile, AI, etc.) so you can rerun tests easily.

3. Environment Variables.
Definition: reusable variables like `baseUrl`, `token`, `refreshToken` to avoid rewriting values.

## B) Install Thunder Client in VS Code

1. Open VS Code.
Definition: use your project root folder (`Nextaro`).

2. Go to Extensions (`Ctrl+Shift+X`).
Definition: search marketplace extensions.

3. Search `Thunder Client` and click Install.
Definition: extension by `rangav`.

4. Open Thunder Client panel from left sidebar.
Definition: lightning icon opens request workspace.

## C) Import Ready Collection

1. In Thunder Client, click `Collections`.
Definition: section where grouped requests are stored.

2. Click `Import`.
Definition: import JSON collection files.

3. Select file:
`api-improvement-workbench/thunder-client/nextaro-api-thunder-collection.json`
Definition: prepared request set for your Nextaro backend.

4. Create Environment in Thunder Client with these keys.
Definition: allows dynamic request values.
- `baseUrl = http://localhost:5000`
- `token =` (empty initially)
- `refreshToken =` (empty initially)
- `email =` (test account email)
- `password =` (test account password)
- `userId =` (public profile id)

## D) API Testing Steps (List-Wise)

1. Health Check.
Definition: verifies server process is reachable.
Request: `GET {{baseUrl}}/health`
Expected: `200` + `{ "status": "ok" }`.

2. Signup.
Definition: creates a new user account.
Request: `POST {{baseUrl}}/api/auth/signup`
Body JSON:
```json
{
  "fullName": "Test User",
  "email": "{{email}}",
  "password": "{{password}}"
}
```
Expected: `201` + account creation message.

3. Login.
Definition: obtains access/refresh JWT tokens.
Request: `POST {{baseUrl}}/api/auth/login`
Body JSON:
```json
{
  "email": "{{email}}",
  "password": "{{password}}"
}
```
Expected: `200` + `token` and `refreshToken`.
Action: copy tokens into environment variables.

4. Refresh Token.
Definition: gets a new access token using refresh token.
Request: `POST {{baseUrl}}/api/auth/refresh`
Body JSON:
```json
{
  "refreshToken": "{{refreshToken}}"
}
```
Expected: `200` + new `token`.

5. Get Profile.
Definition: fetches authenticated user profile.
Request: `GET {{baseUrl}}/api/profile`
Header: `Authorization: Bearer {{token}}`
Expected: `200` + profile object.

6. Update Profile.
Definition: edits profile fields.
Request: `PUT {{baseUrl}}/api/profile`
Header: `Authorization: Bearer {{token}}`
Body JSON:
```json
{
  "jobTitle": "Software Engineer",
  "experienceLevel": "intermediate",
  "careerGoal": "Become a senior backend engineer",
  "skills": ["node.js", "mongodb", "express"]
}
```
Expected: `200` + updated profile.

7. Dashboard Overview.
Definition: returns computed metrics/activity/recommendations.
Request: `GET {{baseUrl}}/api/dashboard/overview`
Header: `Authorization: Bearer {{token}}`
Expected: `200` + `overviewStats`, `trajectory`, `activityFeed`.

8. Ask AI.
Definition: normal AI response endpoint with persistence.
Request: `POST {{baseUrl}}/api/ai/ask`
Header: `Authorization: Bearer {{token}}`
Body JSON:
```json
{
  "question": "Give me a 30-day backend upskilling plan"
}
```
Expected: `200` + `{ answer, success, providerUsed }`.

9. AI History.
Definition: fetch stored user/assistant chat messages.
Request: `GET {{baseUrl}}/api/ai/history`
Header: `Authorization: Bearer {{token}}`
Expected: `200` + `messages[]`.

10. Generate Career Plan.
Definition: AI creates and stores structured plan.
Request: `POST {{baseUrl}}/api/career-plan/generate`
Header: `Authorization: Bearer {{token}}`
Expected: `200` + `savedPlan`.

11. Get Career Plan.
Definition: returns saved plan document.
Request: `GET {{baseUrl}}/api/career-plan`
Header: `Authorization: Bearer {{token}}`
Expected: `200` + plan object.

12. Update Milestone.
Definition: marks milestone complete/incomplete by index.
Request: `PATCH {{baseUrl}}/api/career-plan/milestone/0`
Header: `Authorization: Bearer {{token}}`
Body JSON:
```json
{
  "completed": true
}
```
Expected: `200` + updated plan.

13. Upload Resume.
Definition: multipart file upload endpoint.
Request: `POST {{baseUrl}}/api/resume/upload`
Header: `Authorization: Bearer {{token}}`
Body: `form-data`, key=`resume` (File)
Expected: `200` + file metadata.

## E) How to Test Errors Intentionally

1. Missing token test.
Definition: remove Authorization header and call protected endpoints.
Expected: `401`.

2. Invalid login test.
Definition: wrong password at login.
Expected: `401 Invalid credentials`.

3. Rate limit test.
Definition: send many auth/AI requests quickly.
Expected: `429` with rate-limit message.

4. Invalid milestone index test.
Definition: call index that does not exist.
Expected: `404 Milestone not found`.

5. No file upload test.
Definition: call resume upload without file.
Expected: `400 No file uploaded`.
