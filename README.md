# GreenWave Emergency Corridor Dashboard

GreenWave is a command-center style dashboard designed to help city teams manage emergency movement faster and more clearly.

## What This Project Is About

When emergency requests come from multiple sources, teams often lose time coordinating actions. GreenWave brings those updates into one place so operators can quickly understand what is happening, where it is happening, and what to do next.

It is built to support faster decisions during urgent situations.

## Problem It Solves

In real operations, common issues are:

- delayed approval and response decisions,
- scattered request information,
- no single live view of locations,
- limited visibility of what has already happened.

GreenWave solves this by giving one unified dashboard with live requests, status actions, map visibility, and history tracking.

## Novelty / Why GreenWave Is Different

- **Single operational view:** requests, map, and history are connected in one workflow.
- **Action-first design:** teams can approve, reject, or resolve directly from the dashboard.
- **Live response awareness:** map markers and status changes reflect what is happening now.
- **Built for coordination:** supports both structured admin handling and quick situation awareness.

## Architecture (Simple View)

GreenWave uses a clean 3-layer architecture:

1. **Presentation Layer (Dashboard UI)**  
   The screens used by operators: login, request table, live map, history, and analytics.

2. **Application Layer (Workflow Logic)**  
   Handles business flow such as authentication checks, request status actions, and route protection.

3. **Data Layer (Firebase Backend)**  
   Stores and streams request and history data, and manages user authentication.

This architecture keeps the system easy to scale and easy to maintain.

## Core System Modules

- **Login & Access Control** - Email/Password + Google authentication via Firebase
- **Request Management** - View and action on requests from Firestore collection
- **Live Map Monitoring** - Real-time markers showing request locations
- **History Tracking** - Read-only view of past records
- **Dashboard Navigation & Admin Flow** - Protected routes and operator workflow

## Impact

GreenWave is designed to reduce coordination delay, improve operator confidence, and make emergency response management more transparent and data-driven.

---

## Setup & Run

### Environment Setup

Create `.env` in project root with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

### Run Locally

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

## Firebase Collections

- **Request** - Live emergency/incident requests with status workflow
- **History** - Historical record of completed incidents

## Authentication

Supports Email/Password and Google Sign-In via Firebase Authentication.

## Repository

[https://github.com/NirmalyaASinha/GreenWave](https://github.com/NirmalyaASinha/GreenWave)
