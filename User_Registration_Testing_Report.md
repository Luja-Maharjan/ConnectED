# User Registration Testing Report
## ConnectED – Sign Up / Registration Module

---

## 1. Introduction

This document describes the possible tests that can be performed on the **User Registration** (Sign Up) feature of the ConnectED platform. Registration is implemented as a REST API endpoint (`POST /api/auth/signup`) and a client-side form (`/sign-up`). The backend validates input, hashes passwords, stores users in MongoDB, and returns the created user (without password). The frontend collects username, email, password, and account type (student/admin), submits to the API, and redirects to Sign In on success.

---

## 2. Scope of Testing

| Component | Technology | Purpose |
|-----------|------------|---------|
| API endpoint | Express.js, MongoDB | Validate input, hash password, create user, return response |
| Frontend form | React, fetch API | Collect data, submit, show errors, redirect on success |
| User model | Mongoose | Store username (unique), email (unique), password, role |

**Registration flow:**
1. User fills username, email, password, account type (student/admin).
2. Frontend sends `POST /api/auth/signup` with JSON body.
3. Backend validates required fields and role, hashes password, saves user.
4. Backend returns `201` with user object (excluding password).
5. Frontend redirects to Sign In; on error, displays error message.

---

## 3. Test Categories and Test Cases

### 3.1 **Functional Testing – API (Backend)**

| Test ID | Test Case | Input | Expected Result | Priority |
|---------|-----------|--------|-----------------|----------|
| **F-API-01** | Valid registration (student) | `username`, `email`, `password` (role omitted or `"student"`) | `201 Created`, `success: true`, user object with `username`, `email`, `role: "student"`, no `password` | High |
| **F-API-02** | Valid registration (admin) | `username`, `email`, `password`, `role: "admin"` | `201 Created`, `success: true`, user object with `role: "admin"`, no `password` | High |
| **F-API-03** | Missing username | `email`, `password` only | `400 Bad Request`, error message: *"Username, email, and password are required."* | High |
| **F-API-04** | Missing email | `username`, `password` only | `400 Bad Request`, same message as F-API-03 | High |
| **F-API-05** | Missing password | `username`, `email` only | `400 Bad Request`, same message as F-API-03 | High |
| **F-API-06** | Invalid role | `username`, `email`, `password`, `role: "teacher"` (or any value not `admin`/`student`) | `400 Bad Request`, error message: *"Invalid role. Must be admin or student."* | Medium |
| **F-API-07** | Duplicate username | Same `username`, different `email`; user with that username already exists | Error (e.g. `500` or `409`), message indicates duplicate/conflict | High |
| **F-API-08** | Duplicate email | Same `email`, different `username`; user with that email already exists | Error (e.g. `500` or `409`), message indicates duplicate/conflict | High |
| **F-API-09** | Empty body | `{}` or no body | `400 Bad Request`, same message as F-API-03 | Medium |
| **F-API-10** | Password hashing | Register with known password, inspect DB | Stored `password` is bcrypt hash, not plain text | High |
| **F-API-11** | Response excludes password | Successful registration | Response JSON does **not** contain `password` field | High |

---

### 3.2 **Functional Testing – Frontend (UI)**

| Test ID | Test Case | Steps | Expected Result | Priority |
|---------|-----------|--------|-----------------|----------|
| **F-FE-01** | Successful sign up and redirect | Fill valid username, email, password, select Student → Submit | Loading state during request, then redirect to `/sign-in`, no error shown | High |
| **F-FE-02** | Sign up as Admin | Fill valid data, select Admin → Submit | Redirect to `/sign-in` after success | Medium |
| **F-FE-03** | Required fields – empty submit | Leave all fields empty → Submit | Browser validation and/or API error; form does not succeed without required data | High |
| **F-FE-04** | Email format validation | Enter invalid email (e.g. `notanemail`) | `type="email"` validation or API error; registration fails with appropriate message | Medium |
| **F-FE-05** | API error handling | Use duplicate email/username or invalid data | Error message displayed (e.g. below form), no redirect to Sign In | High |
| **F-FE-06** | Submit button loading state | Submit form | Button shows “loading...” or disabled during request, prevents double submit | Medium |
| **F-FE-07** | Link to Sign In | Click “Sign In” link | Navigate to `/sign-in` | Low |

---

### 3.3 **Boundary & Input Validation Testing**

| Test ID | Test Case | Input | Expected Result | Priority |
|---------|-----------|--------|-----------------|----------|
| **B-01** | Very long username | 200+ character username | Either validation error or DB constraint; no crash | Medium |
| **B-02** | Very long email | 200+ character email | Validation/error; no crash | Medium |
| **B-03** | Very short password | Single character password | Allowed by current implementation; can be used to argue need for minimum length | Low |
| **B-04** | Special characters in username | `user@123`, `user_name`, `user name` | Accepted if model allows; document actual behaviour | Low |
| **B-05** | Whitespace-only fields | Username/email/password as only spaces | Preferably rejected (trim + validation); document behaviour | Medium |
| **B-06** | SQL/NoSQL injection attempts | Inputs with `$`, `{`, `}`, etc. | No security breach; safe handling by Mongoose | High |

---

### 3.4 **Integration Testing**

| Test ID | Test Case | Steps | Expected Result | Priority |
|---------|-----------|--------|-----------------|----------|
| **I-01** | End-to-end registration then login | 1. Register new user via UI. 2. Sign In with same credentials | User can log in successfully; session/token works | High |
| **I-02** | Registration → access protected resource | 1. Register. 2. Sign In. 3. Access e.g. “My Complaints” or profile | User is authenticated and can access protected routes | High |
| **I-03** | CORS and credentials | Register from frontend (e.g. `localhost:5173`) with `credentials: 'include'` | Request succeeds; no CORS errors when cookies are used for auth | Medium |
| **I-04** | Content-Type | Send `POST /api/auth/signup` with `Content-Type: application/json` and valid JSON | Request accepted; user created | Medium |

---

### 3.5 **Security-Oriented Testing**

| Test ID | Test Case | Purpose | Expected Result | Priority |
|---------|-----------|---------|-----------------|----------|
| **S-01** | Password not in API response | Inspect signup response JSON | No `password` (plain or hashed) in response | High |
| **S-02** | Password hashed in database | Check user document in MongoDB after signup | `password` field is bcrypt hash | High |
| **S-03** | Signup over HTTPS (production) | Use HTTPS in production | Traffic encrypted; no credentials sent in clear | High |
| **S-04** | Role escalation | Send `role: "admin"` in signup request | If allowed by design: admin created; document as intended. If not: rejected | Medium |

---

### 3.6 **Negative / Error Path Testing**

| Test ID | Test Case | Input | Expected Result | Priority |
|---------|-----------|--------|-----------------|----------|
| **N-01** | Wrong HTTP method | `GET` or `PUT` to `/api/auth/signup` | `404` or `405`; no user created | Low |
| **N-02** | Malformed JSON body | Invalid JSON in request body | `400` or `500` with error; no user created | Medium |
| **N-03** | Missing Content-Type | POST with body but no `Content-Type: application/json` | Server may not parse body; expect validation failure or error | Low |
| **N-04** | Extra/unexpected fields | Valid required fields + extra fields (e.g. `isAdmin: true`) | Registration succeeds; extra fields ignored (or handled as per implementation) | Low |

---

## 4. Test Data Examples

Use these for repeatable tests:

| Scenario | Username | Email | Password | Role |
|----------|----------|--------|----------|------|
| Valid student | `student1` | `student1@test.com` | `Test@123` | `student` |
| Valid admin | `admin1` | `admin1@test.com` | `Admin@456` | `admin` |
| Duplicate username | `student1` | `other@test.com` | `Test@123` | `student` |
| Duplicate email | `otheruser` | `student1@test.com` | `Test@123` | `student` |
| Invalid role | `user2` | `user2@test.com` | `Test@123` | `teacher` |

---

## 5. Suggested Test Execution Order

1. **Smoke:** F-API-01, F-API-10, F-API-11, F-FE-01, F-FE-05.  
2. **Core validation:** F-API-03, F-API-04, F-API-05, F-API-06, F-FE-03, F-FE-04.  
3. **Duplicates & errors:** F-API-07, F-API-08, F-FE-05.  
4. **Security:** S-01, S-02.  
5. **Integration:** I-01, I-02.  
6. **Boundary & negative:** B-01, B-02, B-06, N-01, N-02.

---

## 6. Tools and Environment

- **API:** REST client (Postman, Insomnia, or `curl`) for `POST /api/auth/signup`.
- **Frontend:** Manual UI testing or automation (e.g. React Testing Library, Cypress).
- **Database:** MongoDB (local or test) to verify stored user and password hash.
- **Example API request:**
  ```http
  POST /api/auth/signup
  Content-Type: application/json

  {
    "username": "student1",
    "email": "student1@test.com",
    "password": "Test@123",
    "role": "student"
  }
  ```

---

## 7. Reporting Results

For each test, record:

- **Test ID**
- **Pass / Fail**
- **Actual result** (status code, response body, UI behaviour)
- **Environment** (browser, API base URL, DB)
- **Remarks** (e.g. bug found, improvement suggested)

---

## 8. Summary

| Category | Number of Test Cases | Focus |
|----------|----------------------|--------|
| Functional – API | 11 | Validation, roles, duplicates, hashing, response |
| Functional – Frontend | 7 | Form, redirect, errors, loading |
| Boundary & Input | 6 | Length, special chars, injection |
| Integration | 4 | E2E, auth flow, CORS |
| Security | 4 | Password handling, HTTPS, role |
| Negative | 4 | Method, malformed JSON, Content-Type |

These test cases cover the main scenarios for **user registration** in ConnectED and can be used directly in your testing report. Adjust expectations (e.g. exact HTTP status for duplicates) to match your final implementation.
