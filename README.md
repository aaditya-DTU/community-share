# Community Resource Sharing Platform

A full-stack MERN application that allows users to share rarely used items
(such as books, tools, and appliances) within their local community.

The platform focuses on **trust**, **accountability**, and **proximity-based discovery**,
enabling users to lend and borrow items safely using a request–approval workflow.

## Problem Statement

Many people own items that are used infrequently, while others nearby may
need the same items temporarily. Existing solutions either rely on informal
trust or lack accountability mechanisms.

Key challenges:
- Finding nearby items quickly
- Ensuring trust between strangers
- Tracking borrowing and returns
- Avoiding misuse or loss of items

## Solution Overview

This platform enables users to:
- List items available for borrowing
- Discover nearby items using geo-based search
- Request items through a controlled approval system
- Track borrowing and returns
- Build trust using reviews and trust scores

The system ensures accountability by maintaining a complete request lifecycle
and restricting actions based on user roles (borrower / owner).

## Core Features

- User authentication (JWT-based)
- Item listing with geo-location
- Nearby item discovery using MongoDB geospatial queries
- Borrow request lifecycle:
  - Request → Approve / Reject → Return
- Real-time notifications
- User profile with activity summary
- Review and trust score system

## High-Level Architecture

The application follows a standard MERN architecture with a clear separation
of concerns between the frontend, backend, and database.

Frontend:
- Built using React (Vite) with Tailwind CSS
- Handles UI rendering, user interactions, and state management
- Communicates with the backend via REST APIs

Backend:
- Built using Node.js and Express
- Implements authentication, business logic, and access control
- Exposes RESTful APIs consumed by the frontend

Database:
- MongoDB is used for data persistence
- Uses geospatial indexing for proximity-based item discovery
- Stores users, items, borrow requests, notifications, and reviews

## Backend Architecture

The backend is organized using a domain-driven structure.
Each domain has its own controller, routes, and model to ensure scalability
and maintainability.

### Backend Folder Structure

backend/src
├── controllers
│ ├── authController.js # Authentication logic
│ ├── userController.js # Profile & dashboard data
│ ├── itemController.js # Item management & geo queries
│ ├── requestController.js # Borrowing workflow
│ ├── notificationController.js
│ ├── reviewController.js # Reviews & trust updates
│
├── routes
│ ├── authRoutes.js
│ ├── userRoutes.js
│ ├── itemRoutes.js
│ ├── requestRoutes.js
│ ├── notificationRoutes.js
│ ├── reviewRoutes.js
│
├── models
│ ├── User.js
│ ├── Item.js
│ ├── BorrowRequest.js
│ ├── Notification.js
│ ├── Review.js
│
├── middlewares
│ ├── authMiddleware.js
│ ├── errorMiddleware.js
│
├── utils
│ ├── calculateTrustScore.js
│ ├── createNotification.js
│ ├── generateToken.js
│
├── app.js
└── server.js


---

# ✍️ SECTION 7 — Borrowing Workflow (Very Important)

This shows **system thinking**.

```md
## Borrowing Workflow

The borrowing process follows a controlled lifecycle to ensure accountability:

1. User lists an item with a location
2. Nearby users discover the item via geo-based search
3. A borrow request is created
4. Item owner can approve or reject the request
5. Once approved, the item becomes unavailable
6. Borrower returns the item
7. Item is marked available again
8. Both parties can leave a review

Each action is validated on the backend to prevent unauthorized access
or invalid state transitions.

## Geo-Based Item Discovery

Items are stored with GeoJSON coordinates and indexed using a MongoDB
2dsphere index.

Nearby items are fetched using geospatial queries based on the user's
location and a configurable distance radius.

This allows efficient and scalable proximity-based item discovery
without relying on external map services.

## Trust & Review System

Trust is a core design principle of the platform.

After an item is successfully returned:
- Both the borrower and the owner are allowed to leave a review
- Only one review is allowed per borrow request
- Reviews include a rating (1–5) and an optional comment

Each review contributes to the user’s overall trust score, which is
calculated based on their borrowing and lending history.

This system encourages responsible usage, discourages misuse,
and provides transparency when interacting with other users.

## Authentication & Security

- Authentication is implemented using JSON Web Tokens (JWT)
- Protected routes require a valid token via the Authorization header
- Passwords are securely hashed before storage
- Role-based checks are enforced at the controller level
  (e.g., only owners can approve requests)

Sensitive operations such as approving, rejecting, and returning items
are validated on the backend to prevent unauthorized access or
invalid state transitions.

## Frontend Architecture

The frontend is built using React with a component-based structure.

Key principles:
- Pages handle data fetching and layout
- Components focus on presentation
- API interactions are abstracted into service files
- Protected routes ensure authenticated access

This structure keeps the UI maintainable and scalable as features grow.

## How to Run Locally

### Prerequisites
- Node.js
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
npm run dev

cd frontend
npm install
npm run dev
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key


The frontend will run on http://localhost:5173
and the backend on http://localhost:5000