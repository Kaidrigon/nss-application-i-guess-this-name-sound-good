# NSS Management & Community Engagement System

## Frontend ↔ Backend Integration Instructions

> **IMPORTANT:** This GitHub repository currently contains the **backend only**.
>
> The frontend is being developed separately by another team using **HTML, CSS, and JavaScript**.
>
> The frontend code is currently stored locally on the frontend developers' computers and has **NOT been uploaded to this GitHub repository**.
>
> Therefore, if you are an AI assisting with frontend integration, you MUST inspect this backend repository first and then ask the frontend developer to provide their existing frontend files/structure before making frontend changes.

---

# 1. What This Repository Contains

This repository contains the backend for the:

**NSS Management & Community Engagement System**

The backend is built using:


Python
FastAPI
MongoDB Atlas
JWT Authentication
ImageKit


The backend is deployed on:


Render

The frontend is a separate project using:


HTML
CSS
JavaScript


The frontend team has already built the UI and currently uses dummy/mock data for development.

The goal is to connect that existing frontend to this backend.

---

# 2. VERY IMPORTANT — THE FRONTEND IS NOT IN THIS REPOSITORY

Do NOT search this repository expecting to find:


index.html
login.html
dashboard.html
style.css
script.js
frontend/

They may not exist here.

That is expected.

The frontend developers have their own local project.

The AI should therefore NOT say:

> "I cannot find the frontend."

Instead, it should understand:


GitHub Repository
        ↓
Backend only

Frontend Developer's Computer
        ↓
Existing HTML/CSS/JS frontend


These two projects need to be connected.

---

# 3. FIRST TASK — INSPECT THE BACKEND COMPLETELY

Before asking the frontend developer to change anything, inspect this repository carefully.

Understand the backend architecture.

Inspect:


app/
requirements.txt
.env configuration requirements
main.py
database configuration
authentication
routers
schemas
dependencies
models
reports
events
attendance
file/image handling

Do not assume that every feature listed in this README has already been implemented.

The **actual backend code is the source of truth**.

---

# 4. Understand the API Before Touching the Frontend

Inspect the FastAPI routes and schemas.

Determine:

* Available endpoints
* HTTP methods
* Request bodies
* Response bodies
* Path parameters
* Query parameters
* Authentication requirements
* Role requirements
* Validation rules
* Error responses
* File upload requirements

The backend should also provide Swagger documentation.

The Swagger documentation is available at:


https://nss-application-i-guess-this-name-sound.onrender.com/docs

For example:

https://nss-application-i-guess-this-name-sound.onrender.com/docs


Use the actual Render URL once provided.

---

# 5. Backend URL

The frontend will communicate with the deployed backend through this URL:


https://nss-application-i-guess-this-name-sound.onrender.com

### IMPORTANT

The backend developer should replace:


https://nss-application-i-guess-this-name-sound.onrender.com


with the actual Render URL.

For example:


https://nss-application-i-guess-this-name-sound.onrender.com


Do NOT add /docs to the API base URL.

Correct:


https://nss-application-i-guess-this-name-sound.onrender.com



Swagger:


https://nss-application-i-guess-this-name-sound.onrender.com/docs

---

# 6. SECOND TASK — ASK THE FRONTEND DEVELOPER FOR THEIR EXISTING FRONTEND

After inspecting the backend, ask the frontend developer to provide access to their existing frontend project.

Because the frontend is NOT in this GitHub repository, the AI needs the frontend code before it can safely integrate anything.

Ask them for either:

### Option A — Upload the frontend project

The developer can upload the frontend project as a ZIP.

For example:


frontend.zip


### Option B — Provide the folder structure

Ask them to show something like:


frontend/
│
├── index.html
├── login.html
├── dashboard.html
│
├── css/
│   └── style.css
│
└── js/
    ├── login.js
    ├── dashboard.js
    └── ...


### Option C — If everything is in one file

That is completely acceptable.

They may have:


index.html


containing:


HTML
CSS
JavaScript


all in one file.

Do NOT force them to restructure the frontend before integration.

---

# 7. DO NOT ASSUME THEIR FRONTEND STRUCTURE

The frontend could be:


index.html
login.html
dashboard.html
css/
js/


or:


index.html
style.css
script.js


or:


one giant HTML file


or another organization entirely.

The AI must inspect what actually exists.

Do not invent filenames.

Do not tell the developer to edit a file that does not exist.

---

# 8. AFTER RECEIVING THE FRONTEND — INSPECT IT FIRST

Once the frontend files are provided, do NOT immediately rewrite them.

First inspect:

### HTML

Find:

* Login forms
* Registration forms
* Dashboard
* Event pages
* Attendance pages
* Reports
* Profile
* Admin pages
* Coordinator pages
* Volunteer pages
* Buttons
* Forms
* Tables
* Cards
* Navigation

### CSS

Understand:

* Existing layout
* Responsive design
* Classes
* IDs
* Components
* Existing UI patterns

### JavaScript

Find:

* Login logic
* Dummy authentication
* Dummy users
* Dummy events
* Dummy attendance
* Dummy reports
* Hardcoded data
* localStorage usage
* sessionStorage usage
* Existing fetch/API calls
* Form submission handlers
* Navigation logic
* Role handling

---

# 9. IMPORTANT — THE FRONTEND ALREADY WORKS AS A DEMO

The frontend team has already created the UI.

It may currently behave like:


User enters ANY username/password
        ↓
Frontend accepts it
        ↓
Dashboard opens


This is dummy/demo behavior.

The objective is to replace this with:


User enters credentials
        ↓
Frontend sends API request
        ↓
FastAPI
        ↓
MongoDB
        ↓
Credentials verified
        ↓
JWT returned
        ↓
Frontend stores JWT
        ↓
Dashboard opens


Do NOT redesign the login page.

Keep the existing login page.

Only replace the dummy authentication logic.

---

# 10. MAIN OBJECTIVE

Convert:


Existing frontend
+
Dummy data
+
Fake authentication


into:


Existing frontend
+
Real FastAPI API
+
Real MongoDB data
+
Real JWT authentication


The existing UI should remain as unchanged as reasonably possible.

---

# 11. DO NOT REBUILD THE FRONTEND

Do NOT:

* Create a new frontend
* Replace the existing design
* Convert it to React
* Convert it to Vue
* Convert it to Next.js
* Introduce a framework unnecessarily
* Replace all HTML
* Replace all CSS
* Rewrite working pages unnecessarily

The frontend stack is:


HTML
CSS
JavaScript


Use normal JavaScript fetch() unless the existing project already uses another appropriate API mechanism.

---

# 12. Backend Is the Source of Truth

When integrating the frontend, use the actual backend implementation.

Do NOT guess endpoint names.

Do NOT guess request fields.

Do NOT guess response fields.

Do NOT assume a feature exists just because it is mentioned in this README.

Instead:


Backend code
      +
Swagger documentation
      ↓
Source of truth


If Swagger says:


POST /auth/login


use that.

If the request body has specific fields, use those exact fields.

---

# 13. Authentication

The backend uses JWT authentication.

The frontend should replace its fake login system with the real authentication API.

The general flow is:


Login Form
     ↓
JavaScript
     ↓
POST /auth/login
     ↓
FastAPI
     ↓
MongoDB
     ↓
JWT access token
     ↓
Frontend
     ↓
localStorage


The exact request body must be taken from the backend Swagger documentation.

---

# 14. JWT Storage

After successful login, the frontend should store the returned access token.

Recommended:

localStorage.setItem(
    "access_token",
    response.access_token
);


The exact response property must be verified from the actual backend response.

Do NOT assume the backend returns a property unless confirmed.

---

# 15. Authenticated Requests

Authenticated API requests should include:


Authorization: Bearer <JWT>


Prefer creating one reusable API helper.

For example:


async function apiRequest(endpoint, options = {}) {

    const token =
        localStorage.getItem("access_token");

    const headers = {
        ...(options.headers || {})
    };

    if (token) {
        headers["Authorization"] =
            `Bearer ${token}`;
    }

    if (
        options.body &&
        !(options.body instanceof FormData)
    ) {
        headers["Content-Type"] =
            "application/json";
    }

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail ||
            "Something went wrong"
        );
    }

    return data;
}

However, if the frontend already has an API helper, inspect and reuse it rather than creating another one.

---

# 16. If the Frontend Has No API Helper

Create one appropriate file based on the frontend's actual structure.

For example:


js/api.js


But if the frontend has another structure, place the API helper appropriately.

Do NOT blindly create:


js/api.js


without checking the project structure first.

---

# 17. Replace Dummy Data

Search the frontend for:


dummy
mock
fake
sample
demo
test
hardcoded


Also look for JavaScript such as:

const users = [...]
const events = [...]
const reports = [...]
const attendance = [...]


or:


if (username === "admin")


or:


loginSuccessful = true;


These may represent dummy behavior.

Replace them with actual backend requests.

---

# 18. Preserve Existing UI

Suppose the frontend currently displays:


Blood Donation Camp

15 / 50 Registered

Register


Do not redesign it.

Change the data source from:


dummyEvents


to:


await apiGet("/actual/backend/endpoint");


Then map the real response into the existing UI.

The desired result is:


SAME UI
+
REAL DATA


---

# 19. User Roles

The backend contains role-based access control.

Actual roles should be determined from the backend implementation.

The frontend may display different interfaces for:


Volunteer
Coordinator
Admin


but do not assume the role structure without checking the backend.

The frontend can use role information to:


Show/hide UI
Change navigation
Display appropriate dashboard


But:

**Frontend role checks are NOT security.**

The backend remains responsible for permission enforcement.

---

# 20. Events

Inspect the backend event routes.

Then connect the existing event UI to the real endpoints.

Possible functionality may include:


View events
View event details
Create event
Update event
Delete event
Publish event
Cancel event
Event templates


But only implement what actually exists in the backend.

Do not invent missing endpoints.

---

# 21. Attendance

Inspect the backend attendance routes.

Then connect the existing attendance UI.

If the frontend currently displays fake attendance:


Present
Absent
Hours


replace the source with real API responses.

Keep the existing UI whenever possible.

---

# 22. Reports

Inspect the backend report implementation.

The frontend may currently contain dummy report information.

Connect it to the actual report endpoints.

Possible report functionality may include:


Event reports
Volunteer reports
Service hours
Achievements
Photos
Certificates


Only use functionality actually implemented by the backend.

---

# 23. Image and File Uploads

The project may use ImageKit for image/file storage.

The frontend should NOT receive or contain private ImageKit credentials.

The frontend should communicate with the backend according to the actual upload API.

If the backend expects:

multipart/form-data


use:


const formData = new FormData();

formData.append(
    "file",
    selectedFile
);

await apiRequest(
    "/actual/upload/endpoint",
    {
        method: "POST",
        body: formData
    }
);


Do NOT manually set:


Content-Type: application/json


when using FormData.

The actual upload endpoint and field name must be taken from the backend.

---

# 24. Do Not Expose Backend Secrets

The frontend must NEVER contain:


MongoDB username
MongoDB password
MongoDB connection string
JWT_SECRET
ADMIN_SETUP_KEY
ImageKit private key
Render environment variables


The frontend only needs the public backend API URL.

---

# 25. CORS

The FastAPI backend has CORS configured.

The frontend does not need to install a CORS package.

If the browser reports a CORS error:

1. Check the backend CORS configuration.
2. Check the API URL.
3. Check the browser Network tab.
4. Check the Render backend logs.

Do not attempt to disable browser security.

---

# 26. Error Handling

Real API requests can fail.

Examples:


400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
422 Validation Error
500 Internal Server Error


The frontend should handle these appropriately.

Use the existing notification/toast/error UI if one exists.

Do not unnecessarily create a new notification system.

---

# 27. Loading States

Dummy data appears instantly.

Real API requests may take time.

When connecting real APIs, preserve or add appropriate loading states.

Example:


Loading events...


Then:


Events displayed


Do not make the application appear broken while waiting for the backend.

---

# 28. Unauthorized Requests

If the backend returns:


401 Unauthorized


the frontend should generally:


Remove invalid access token
        ↓
Return user to login


Adapt this behavior to the existing frontend navigation.

---

# 29. If Everything Is in One HTML File

That is okay.

If the frontend developer has:


index.html


containing:


HTML
CSS
JavaScript


all together, do not force a complete restructure.

Connect the existing JavaScript to the backend first.

You may recommend splitting the file later if it becomes difficult to maintain, but this is not the primary task.

---

# 30. If the Frontend Is Already Well Structured

If the frontend has:


js/
services/
utils/
api/


or an existing API layer:

**Use it.**

Do not create duplicate API systems.

Before creating a new `api.js`, search for existing:


fetch()
XMLHttpRequest
API functions
service files
request helpers


and adapt the existing architecture if reasonable.

---

# 31. Integration Strategy

The AI should integrate the frontend incrementally.

Recommended order:


1. Inspect backend
        ↓
2. Inspect frontend
        ↓
3. Map frontend features to backend endpoints
        ↓
4. Create/adapt API communication layer
        ↓
5. Connect login
        ↓
6. Connect JWT
        ↓
7. Connect current user
        ↓
8. Connect dashboard
        ↓
9. Connect events
        ↓
10. Connect event registration
        ↓
11. Connect attendance
        ↓
12. Connect reports
        ↓
13. Connect file/image uploads
        ↓
14. Connect admin/coordinator functionality
        ↓
15. Remove dummy production behavior
        ↓
16. Test everything


---

# 32. IMPORTANT — Do Not Make Huge Changes at Once

Do not modify 30 frontend files before testing.

Work feature-by-feature.

For example:


Login
 ↓
Test
 ↓
Dashboard
 ↓
Test
 ↓
Events
 ↓
Test
 ↓
Attendance
 ↓
Test


This makes errors easier to identify.

---

# 33. Frontend ↔ Backend Mapping

After inspecting both projects, create a mapping like:


Frontend Feature          Backend Endpoint

Login                     POST /actual/path
Current User              GET /actual/path
Events                    GET /actual/path
Event Details             GET /actual/path/{id}
Event Registration        POST /actual/path
Attendance                GET/POST /actual/path
Reports                   GET /actual/path
File Upload               POST /actual/path
Admin Actions             POST/PATCH/DELETE /actual/path


The exact paths must come from the actual backend.

---

# 34. Ask the Frontend Developer When Necessary

If something is unclear, ASK instead of guessing.

For example:

> "I have inspected the backend. Please upload the frontend ZIP so I can inspect the existing login implementation."

Or:

> "Please show me the JavaScript file that currently handles the dummy login."

Or:

> "Please provide the frontend folder structure."

Or:

> "The frontend has an event registration button, but I need to know which file currently handles its click event."

This is preferable to making assumptions.

---

# 35. What the AI Should NOT Do

Do NOT:


❌ Rebuild the frontend
❌ Replace the existing design
❌ Assume React
❌ Assume a particular folder structure
❌ Invent API endpoints
❌ Invent request fields
❌ Invent response fields
❌ Delete working UI unnecessarily
❌ Expose backend secrets
❌ Connect directly to MongoDB
❌ Put MongoDB credentials in JavaScript
❌ Put JWT_SECRET in JavaScript
❌ Put ImageKit private credentials in JavaScript
❌ Replace all frontend code without inspection


---

# 36. What the AI SHOULD Do


✅ Inspect the backend thoroughly
✅ Understand the real API
✅ Ask for the frontend code
✅ Inspect the frontend before modifying it
✅ Identify dummy functionality
✅ Reuse existing frontend structure
✅ Reuse existing API helpers where possible
✅ Connect real authentication
✅ Connect JWT
✅ Connect real data
✅ Preserve existing UI
✅ Use actual Swagger schemas
✅ Test each feature
✅ Explain changes clearly


---

# 37. Swagger Documentation

Once the backend is deployed, the frontend developer can open:


https://nss-application-i-guess-this-name-sound.onrender.com/docs


This allows them to inspect and test the API.

For example:


https://nss-application-i-guess-this-name-sound.onrender.com/docs


The frontend developer does NOT need access to:


MongoDB Atlas
Render environment variables
JWT secret
ImageKit private configuration


They only need the public API.

---

# 38. Definition of Done

The integration is complete when:


[ ] Backend is reachable from the frontend

[ ] Existing frontend UI is preserved

[ ] Dummy login has been replaced

[ ] Real login works

[ ] JWT is stored correctly

[ ] Authenticated requests work

[ ] Current user comes from backend

[ ] Real events appear

[ ] Event registration works

[ ] Attendance uses real backend data

[ ] Reports use real backend data

[ ] File uploads use the actual backend flow

[ ] Volunteer functionality works

[ ] Coordinator functionality works

[ ] Admin functionality works

[ ] Backend permissions are respected

[ ] Loading states work

[ ] API errors are handled

[ ] Logout works

[ ] Invalid/expired authentication is handled

[ ] No backend secrets exist in frontend code

[ ] Dummy production data has been removed/replaced

[ ] Existing frontend design still works


---

# 39. FINAL INSTRUCTIONS FOR ANY AI READING THIS REPOSITORY

### Phase 1 — Backend

**Do this first.**

Inspect this entire repository.

Understand:


FastAPI application
Routes
Schemas
Authentication
JWT
Roles
Events
Attendance
Reports
Database
Image/file handling
Dependencies


Do not make assumptions.

---

### Phase 2 — Frontend

The frontend is NOT in this repository.

Ask the frontend developer to provide their existing frontend project.

They may:


Upload a ZIP


or:


Provide the folder structure


or:


Provide the relevant HTML/CSS/JS files


If everything is in one HTML file, work with that.

---

### Phase 3 — Understand

Before modifying the frontend:


Inspect existing UI
Inspect existing JavaScript
Find dummy authentication
Find dummy data
Find existing API logic
Find navigation
Find role handling
Find forms
Find event logic
Find attendance logic
Find reports
Find uploads


---

### Phase 4 — Map

Map:


Existing frontend feature
        ↓
Actual backend endpoint
        ↓
Request format
        ↓
Response format


---

### Phase 5 — Integrate

Replace dummy behavior with real API calls.

Preserve the existing frontend.

---

### Phase 6 — Test

Test one feature at a time.

Do not assume that because the API call succeeded, the UI integration is complete.

Verify:


Frontend
   ↓
API request
   ↓
FastAPI
   ↓
Database
   ↓
Response
   ↓
Frontend UI


---

# 40. FINAL GOAL

The final architecture should be:


┌───────────────────────────────┐
│        EXISTING FRONTEND      │
│                               │
│       HTML + CSS + JS         │
│                               │
│   Existing UI / Design        │
└───────────────┬───────────────┘
                │
                │ HTTPS
                │ JSON / FormData
                ▼
┌───────────────────────────────┐
│          FASTAPI              │
│          BACKEND              │
│                               │
│   Authentication              │
│   Events                      │
│   Attendance                  │
│   Reports                     │
│   User Management             │
└───────────────┬───────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
┌──────────────┐   ┌──────────────┐
│ MongoDB Atlas│   │   ImageKit   │
└──────────────┘   └──────────────┘


The frontend should communicate **only with the public FastAPI API**.

The backend handles the database, authentication, permissions, and private credentials.

---

## The most important instruction

**Do not start by building anything.**

First inspect this backend repository.

Then ask the frontend developer for their existing local frontend project.

Then inspect that frontend.

Then connect the two.

The objective is:

> **Take the frontend that the team has already built and make it use the real backend without unnecessarily rebuilding or redesigning it.**
