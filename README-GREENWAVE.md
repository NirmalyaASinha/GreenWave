# GreenWave - Emergency Vehicle Corridor Dashboard

A real-time emergency vehicle corridor management system built with React, Vite, and Leaflet.

## 🚀 Features

- **Real-time Live Map**: Interactive map showing emergency vehicle corridors with CartoDB dark tiles
- **Dashboard**: Overview of system status, active incidents, and response times
- **Incident Log**: Comprehensive log of all incidents with filtering and search
- **Interactive Mapping**: 
  - Circle markers representing intersections with status indicators
  - Color-coded status (green: normal, yellow: warning, red: active/pulsing)
  - Dynamic polylines connecting intersections when corridor is active
  - Sidebar showing active vehicle information
- **Dark Theme**: Professional dark interface with green accent color

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 5.4.21
- **Routing**: React Router DOM 6.20.0
- **Mapping**: Leaflet 1.9.4 & React-Leaflet 4.2.1
- **Charts**: Recharts 2.10.3
- **Real-time Communication**: Socket.IO Client 4.6.1
- **Styling**: CSS3 with CSS Variables for theming

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Navigation component with 3 routes
│   ├── Navbar.css
│   ├── LiveMap.jsx         # Interactive map with intersection markers
│   └── LiveMap.css
├── pages/
│   ├── Dashboard.jsx       # System overview and statistics
│   ├── Dashboard.css
│   ├── LiveMap.jsx         # Map page wrapper
│   ├── IncidentLog.jsx     # Incident tracking table
│   └── IncidentLog.css
├── hooks/                  # Custom React hooks (for future use)
├── utils/                  # Utility functions (for future use)
├── App.jsx                 # Main app with routing
├── App.css
├── main.jsx               # Entry point
├── index.css              # Global styles with CSS variables
└── assets/                # Static assets
```

## 🎨 Color Theme (CSS Variables)

```css
--bg-primary: #0A1628      /* Primary background */
--bg-secondary: #0f1f31    /* Secondary background */
--text-primary: #ffffff    /* Primary text */
--text-secondary: #b0bec5  /* Secondary text */
--accent: #00C853          /* Green accent (GreenWave) */
--warning: #FFC107         /* Warning yellow */
--danger: #FF5252          /* Danger red */
--success: #4CAF50         /* Success green */
```

## 🚦 Intersection Statuses

- **Normal** 🟢: Green circle marker - intersection operating normally
- **Warning** 🟡: Yellow circle marker - caution, potential issues
- **Active** 🔴: Red pulsing circle marker - emergency corridor active

## 📍 Map Features

- **Location**: Ahmedabad city center (23.1815°N, 72.5371°E)
- **Default Zoom**: Level 14
- **Tile Layer**: CartoDB Dark Matter (dark theme)
- **Hardcoded Intersections**: 4 major intersections with sample data:
  1. CG Road & Ashram Road
  2. S.G. Road & Mahal Road
  3. C.G. Road & Drive-in Road
  4. Sardar Patel Ring Road & S.G. Road

## 📱 Routes

- `/` - Dashboard page with system status and statistics
- `/map` - Live map showing intersection corridors and active vehicles
- `/incidents` - Incident log with filtering and search capabilities

## 🚀 Getting Started

### Prerequisites
- Node.js 18.20.8 or higher
- npm 10.8.2 or higher

### Installation

```bash
# Navigate to project directory
cd /home/nirmalya/Desktop/GREENWARE

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build

# Preview production build
npm run preview
```

## 📊 LiveMap Component

The LiveMap component can accept intersection data via props:

```jsx
<LiveMap 
  intersections={[
    {
      id: 'INT-001',
      name: 'Intersection Name',
      lat: 23.1815,
      lng: 72.5371,
      status: 'normal', // 'normal', 'warning', or 'active'
      vehicles: [
        { id: 'VEH-101', type: 'Ambulance', eta: '2 mins', status: 'approaching' }
      ]
    }
    // ... more intersections
  ]}
/>
```

## 🔄 Real-time Integration

The project includes Socket.IO client for real-time updates. To integrate with a backend:

```javascript
import io from 'socket.io-client';

const socket = io('http://your-backend-url');
socket.on('corridor-update', (data) => {
  // Handle real-time corridor updates
});
```

## 📊 Dashboard Statistics

The dashboard displays:
- Active ambulances count
- Fire trucks status
- Active incidents
- Average response time across all corridors

Recent activity feed with timestamps and corridor information.

## 📋 Incident Log Features

- Searchable incident table
- Severity filtering (Critical, High, Medium, Low)
- Color-coded severity badges
- Status indicators (Active, En-Route, Resolved)
- Responsive table design

## 🎯 Future Enhancements

1. WebSocket integration for real-time vehicle tracking
2. Custom incident creation form
3. Vehicle tracking with live GPS coordinates
4. Traffic light control integration
5. Push notifications for critical incidents
6. User authentication and authorization
7. Performance metrics and analytics
8. Multi-city support

## 📝 Notes

- Uses `--legacy-peer-deps` due to React 19 compatibility with react-leaflet
- All mock data is hardcoded for demonstration
- Intersection data can be easily swapped with API calls
- Responsive design optimized for desktop and tablet views

## 🐛 Development

- Hot Module Replacement (HMR) enabled for fast development
- ESLint configured for code quality
- CSS Grid and Flexbox for responsive layouts

## 📄 License

This project is created as part of the GreenWave emergency corridor management system.
