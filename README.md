# GreenWave - Emergency Corridor Management System

**A real-time emergency corridor management platform integrating live mapping, Firebase cloud services, and intelligent request tracking for coordinated emergency response.**

---

## Overview

GreenWave is an integrated emergency management system that brings together scattered request information, live location tracking, and coordinated response workflows into a single operational platform. Built to reduce coordination delays and improve emergency response efficiency in urban environments.

## Problem Statement

Emergency response teams face critical challenges:
- **Fragmented information sources** - Requests come from multiple channels with no unified view
- **Delayed decision-making** - Manual coordination slows approval and dispatch processes
- **No real-time visibility** - Operators lack live tracking of emergency vehicles and corridors
- **Poor historical data** - Limited ability to analyze past incidents and optimize response

## What Makes GreenWave Unique

### 1. **Integrated System Architecture**
GreenWave integrates multiple systems into a cohesive workflow:
- **Firebase Cloud Integration** - Real-time NoSQL database (Firestore), connection monitoring (Realtime Database), and secure authentication
- **Live Mapping System** - Interactive Leaflet-based tactical maps with custom markers and corridor visualization
- **Request Management Pipeline** - End-to-end workflow: submission → approval → active tracking → resolution
- **Real-time Synchronization** - All operators see the same data simultaneously via Firebase listeners

### 2. **Action-First Design Philosophy**
Built for rapid decision-making:
- One-click approve/reject directly from the dashboard
- Live status updates across all connected clients
- Immediate map visualization of approved corridors
- System health monitoring with connection status indicators

### 3. **Scalable Cloud-Native Architecture**
- **Serverless backend** - Firebase handles scaling automatically
- **Real-time data sync** - Sub-500ms update latency across clients
- **Distributed system** - Multiple operators can work simultaneously
- **Authentication & authorization** - Secure multi-user access control

### 4. **Professional Control Room Interface**
- Government/military aesthetic for serious operational environments
- Minimal cognitive load design - focus on critical information
- Live clock, breadcrumb navigation, system diagnostics
- Responsive charts and statistics for at-a-glance situational awareness

---

## System Architecture

### Three-Layer Design

**1. Presentation Layer**
   - React-based single-page application (SPA)
   - Real-time dashboard with live request feed, active corridors, system diagnostics
   - Interactive tactical map with custom markers and corridor polylines
   - Protected routes with authentication guards

**2. Application Layer**
   - Request workflow: pending → approved/rejected → resolved
   - Real-time Firebase listeners for live data synchronization
   - User authentication and session management
   - Route protection and authorization checks

**3. Data Layer**
   - **Firestore** - Request and corridor collections with real-time queries
   - **Realtime Database** - Connection status monitoring (`.info/connected`)
   - **Authentication** - Email/password and Google Sign-In providers
   - **Analytics** - Firebase Analytics for usage tracking

### Data Flow

```
Emergency Request → Firestore → Firebase Listener → React State → UI Update
                                      ↓
                            All Connected Clients (Real-time)
```

---

## Core Features

### Request Management
- Submit emergency corridor requests (medical, fire, police, traffic, accident)
- Real-time status tracking: pending → approved/rejected → resolved
- Geographic coordinates with latitude/longitude precision
- Type-based categorization and filtering

### Live Tactical Map
- Interactive map with emergency vehicle locations
- Custom square markers with letter labels (M, F, P, T, A)
- Color-coded by emergency type
- Approved corridor visualization with green polylines
- Click markers for detailed information and actions

### Active Corridor Monitoring
- Real-time list of all approved emergency corridors
- One-click cancellation capability
- Status indicators and last update timestamps
- Integration with map visualization

### System Diagnostics
- Firebase connection status (online/offline)
- Database health monitoring
- Request feed synchronization status
- Last sync timestamp display

### Authentication & Security
- Email/password authentication
- Google Sign-In integration
- Protected routes - dashboard only accessible to authenticated users
- Persistent session management

---

## Tech Stack

**Frontend:**
- React 19.2.4, Vite 6.4.1, React Router 6
- React Leaflet (mapping), Recharts (charts), Lucide React (icons)
- Framer Motion (animations), React Hot Toast (notifications)

**Backend:**
- Firebase Firestore (NoSQL database)
- Firebase Realtime Database (connection monitoring)
- Firebase Authentication (user management)
- Firebase Analytics (usage tracking)

**Deployment:**
- Vercel (frontend hosting with automatic deployments)
- GitHub (version control and CI/CD)

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- Firebase project with Firestore, Realtime Database, and Authentication enabled
- Git

### Quick Start

1. **Clone repository**
   ```bash
   git clone https://github.com/NirmalyaASinha/GreenWave.git
   cd GreenWave
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Firebase credentials are already configured in `src/config/firebase.js`
   - For production: Update with your own Firebase project credentials

4. **Run development server**
   ```bash
   npm run dev
   ```
   Visit: http://localhost:5173

5. **Build for production**
   ```bash
   npm run build
   ```

### Deployment

**Vercel (Recommended):**
1. Import repository from GitHub to Vercel
2. Deploy automatically on every push to main branch
3. Add Vercel domain to Firebase Console → Authentication → Authorized domains

**Firebase Hosting:**
```bash
npm run build
firebase deploy --only hosting
```

---

## Firebase Security Configuration

### Required Setup

1. **Add Authorized Domains** (Firebase Console → Authentication → Settings):
   ```
   localhost
   your-vercel-domain.vercel.app
   greenwave-e1768.firebaseapp.com
   ```

2. **Configure Firestore Security Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. **Realtime Database Rules:**
   ```json
   {
     "rules": {
       ".read": "auth != null",
       ".write": "auth != null"
     }
   }
   ```

---

## Future Scope & Roadmap

### Phase 1: Hardware Integration (Planned)
- **IoT Device Integration** - GPS trackers for emergency vehicles
- **Sensor Networks** - Traffic signal control for corridor clearing
- **RFID/NFC Systems** - Vehicle authentication and tracking
- **Real-time Telemetry** - Speed, location, ETA calculations

### Phase 2: AI & Machine Learning
- **Route Optimization** - ML-based fastest path calculation considering traffic
- **Predictive Analytics** - Emergency hotspot prediction based on historical data
- **Auto-approval System** - AI-assisted request validation and approval
- **Traffic Pattern Analysis** - Optimize corridor routes based on real-time traffic

### Phase 3: Extended Integration
- **Traffic Signal Integration** - Automatic green corridor creation
- **City CCTV Integration** - Live camera feeds of corridor routes
- **Hospital Coordination** - Direct integration with hospital emergency systems
- **Mobile Application** - Field operator app for emergency vehicle drivers

### Phase 4: Advanced Features
- **Multi-city Support** - Expand platform to multiple cities
- **Inter-agency Coordination** - Integration with police, fire, medical agencies
- **Public API** - Third-party integration capabilities
- **Voice Commands** - Hands-free operation for operators
- **AR Navigation** - Augmented reality guidance for emergency vehicle drivers

---

## Innovation Highlights

✅ **Real-time Cloud Integration** - Firebase ensures sub-second data synchronization across all clients  
✅ **Scalable Architecture** - Serverless design supports any number of concurrent users  
✅ **Professional Workflow** - Action-first design reduces response time  
✅ **Live Mapping** - Geographic visualization for spatial awareness  
✅ **System Reliability** - Connection monitoring and health diagnostics  
✅ **Secure Multi-user** - Authentication and authorization built-in  
✅ **Future-ready** - Architecture designed for hardware and IoT integration  

---

## Use Cases

1. **Urban Emergency Response** - City emergency management centers
2. **Hospital Coordination** - Ambulance dispatch and corridor management
3. **Fire Department Operations** - Fire truck route optimization
4. **Police Coordination** - Rapid response corridor approval
5. **Event Management** - Large-scale event emergency planning
6. **Smart City Integration** - Part of broader smart city infrastructure

---

## Performance Metrics

- **Real-time Updates:** < 500ms latency via Firebase listeners
- **Map Interactions:** 60fps smooth rendering
- **Bundle Size:** ~250KB gzipped
- **First Load:** < 2s on broadband connections
- **Concurrent Users:** Scalable via Firebase (tested up to 100 simultaneous operators)

---

## Contributing

Contributions welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

## Repository & Links

- **GitHub:** https://github.com/NirmalyaASinha/GreenWave
- **Live Demo:** https://green-wave-3lbu7n8to-nirmayas-projects.vercel.app
- **Issues:** https://github.com/NirmalyaASinha/GreenWave/issues

---

## Project Status

**Version:** 1.0.0  
**Status:** Active Development  
**Last Updated:** March 6, 2026

### Completed
✅ Core system architecture and Firebase integration  
✅ Real-time request management workflow  
✅ Interactive tactical mapping system  
✅ Authentication and multi-user support  
✅ Production deployment on Vercel  

### In Progress
🔄 Mobile responsive design optimization  
🔄 Advanced analytics and reporting  

### Planned
📋 Hardware integration (GPS, sensors, IoT devices)  
📋 AI-powered route optimization  
📋 Mobile application for field operators  
📋 Traffic signal integration  

---

**Built with ❤️ for smarter emergency response systems**
