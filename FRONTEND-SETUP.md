# GreenWave Frontend - React + Vite Application

Complete guide to running, testing, and developing the GreenWave React dashboard.

## 🚀 Quick Start

### Installation (2 minutes)

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Run tests (optional)
npm run test

# 3. Start development server
npm run dev
```

**App running at**: http://localhost:5174

## 📦 Installation

### Prerequisites

- **Node.js** 16+ (check with `node -v`)
- **npm** 7+ (check with `npm -v`)

### Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

**Why `--legacy-peer-deps`?**
- Resolves peer dependency conflicts between React 19, React Router v6, and older packages
- Safe to use in development/production

### Step 2: Verify Installation

```bash
npm list react
# Output should show React 19.2.4 installed
```

## 🏃 Running the App

### Development Mode (with hot reload)

```bash
npm run dev
```

**Output**:
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5174/
  ➜  press h to show help
```

Then open http://localhost:5174 in your browser.

### Production Build

```bash
npm run build
```

Creates optimized bundle in `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

Test production build locally before deployment.

## 🧪 Testing

### Run All Tests

```bash
npm run test
```

**Expected output**:
```
 ✓ src/test/auth.test.jsx (6)
 ✓ src/test/dashboard.test.jsx (5)
 ✓ src/test/incidents.test.jsx (3)
 ✓ src/test/analytics.test.jsx (4)
 ✓ src/test/hooks.test.js (7)

Test Files  5 passed (5)
     Tests  25 passed (25)
```

### Run Tests in Watch Mode

Auto-runs tests on file changes:

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

Opens coverage report showing:
- Statements coverage
- Branch coverage
- Function coverage
- Line coverage

**Coverage targets**:
- Auth: 95%+
- Dashboard: 85%+
- Analytics: 80%+
- Hooks: 90%+

### Run Tests with UI

Interactive test dashboard:

```bash
npm run test:ui
```

Opens browser at http://localhost:51204/__vitest__/ with:
- Test explorer
- File navigation
- Line-by-line coverage
- Component rendering preview

### Run Specific Tests

```bash
# Single file
npm run test -- auth.test.jsx

# Glob pattern
npm run test -- "**/*.test.jsx"

# Watch specific file
npm run test:watch -- Dashboard
```

## 📖 Project Structure

```
src/
├── components/                 # Reusable components
│   ├── LiveMap.jsx            # Vehicle location map
│   ├── Navbar.jsx             # Top navigation bar
│   ├── LiveMap.css
│   └── Navbar.css
├── pages/                     # Page components
│   ├── Dashboard.jsx          # Main dashboard
│   ├── IncidentLog.jsx        # Incidents page
│   ├── Analytics.jsx          # Charts & analytics
│   ├── Dashboard.css
│   ├── IncidentLog.css
│   └── Analytics.css
├── contexts/                  # Context providers
│   ├── AuthContext.js         # Authentication state
│   ├── ConnectionContext.js   # WebSocket connection
│   └── ToastContext.js        # Toast notifications
├── hooks/                     # Custom hooks
│   ├── useGreenWave.js        # WebSocket & GPS hook
│   └── (more hooks)
├── test/                      # Test suite
│   ├── setup.js               # Mock setup & factories
│   ├── auth.test.jsx          # Auth tests
│   ├── dashboard.test.jsx     # Dashboard tests
│   ├── incidents.test.jsx     # Incident tests
│   ├── analytics.test.jsx     # Analytics tests
│   └── hooks.test.js          # Hook tests
├── assets/                    # Images, icons, etc.
├── App.jsx                    # Root component
├── App.css
├── main.jsx                   # Entry point
├── index.css                  # Global styles
└── vite.config.js            # Vite configuration
```

## 🔐 Authentication

Three roles with different permissions:

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| **Admin** | admin | admin123 | View, Trigger, Admin |
| **Dispatch** | dispatch | dispatch123 | View, Trigger |
| **Viewer** | viewer | viewer123 | View Only |

### Login Flow

1. Open http://localhost:5174
2. See login page with demo credentials
3. Enter `admin` / `admin123`
4. Click "Sign In"
5. Dashboard appears with full permissions

### Session Storage

Auth stored in `sessionStorage` (not `localStorage`):
- More secure (cleared on browser close)
- Session-scoped by design
- Survives page refresh within session

**Check in browser console**:
```javascript
sessionStorage.getItem('auth')
// Returns: {"role": "admin", "username": "admin"}
```

## 🎨 UI Features

### Dashboard Page

**Components**:
- 4 stat cards (Corridors, Time Saved, Vehicles, Response Time)
- Connection status badge (Live/Simulation)
- Live vehicle map
- Emergency trigger buttons (admin/dispatch only)
- Real-time WebSocket updates

**Data Flow**:
```
WebSocket Event → useGreenWave Hook → React State → Components Re-render
```

### Analytics Page

**Charts** (recharts):
- Hourly activation trend
- Daily performance line chart
- Vehicle type distribution (pie)
- Top corridors (bar chart)

**Filters**:
- Time range (Today, 7 Days, 30 Days)
- Vehicle type dropdown
- Refresh data button

**Performance**:
- < 2s page load
- < 500ms chart render
- Responsive on mobile

### Incident Log Page

**Table Features**:
- Paginated incident list
- Search by vehicle ID
- Filter by status (Active, Resolved)
- Time-based sorting
- Expandable incident details

### Live Map Component

**Features**:
- Real-time vehicle markers
- Color-coded by vehicle type
- Click for vehicle details
- Zoom/pan controls
- Auto-fit bounds on new vehicle

## 🔌 API Integration

### REST API Calls

```javascript
// Fetch analytics
const response = await fetch('http://localhost:8000/api/analytics/summary');
const data = await response.json();

// POST trigger emergency
await fetch('http://localhost:8000/api/demo/trigger', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ vehicle_type: 'AMBULANCE' })
});
```

### WebSocket Connection

```javascript
// In useGreenWave hook
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
  console.log('Connected to real-time updates');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Update received:', message);
};
```

## 🎯 Component Testing

### Example: Test Login Component

```javascript
// src/test/auth.test.jsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../pages/LoginPage';

describe('LoginPage', () => {
  it('accepts admin credentials', async () => {
    render(<LoginPage />);
    
    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    
    await userEvent.type(usernameInput, 'admin');
    await userEvent.type(passwordInput, 'admin123');
    
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(loginButton);
    
    expect(sessionStorage.getItem('auth')).toContain('admin');
  });
});
```

### Testing Hooks

```javascript
// src/test/hooks.test.js
import { renderHook, act } from '@testing-library/react';
import { useGreenWave } from '../hooks/useGreenWave';

describe('useGreenWave', () => {
  it('connects via WebSocket', async () => {
    const { result } = renderHook(() => useGreenWave());
    
    // Initially CONNECTING
    expect(result.current.connectionStatus).toBe('CONNECTING');
    
    // After mock WebSocket onopen
    await vi.advanceTimersByTimeAsync(100);
    
    expect(result.current.connectionStatus).toBe('CONNECTED');
  });
});
```

## 🛠️ Development Workflow

### 1. Create New Component

File: `src/components/MyComponent.jsx`

```javascript
export default function MyComponent() {
  return <div>My Component</div>;
}
```

### 2. Add Styles

File: `src/components/MyComponent.css`

```css
.my-component {
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}
```

### 3. Import in Page

```javascript
import MyComponent from '../components/MyComponent';

export default function Dashboard() {
  return (
    <div>
      <MyComponent />
    </div>
  );
}
```

### 4. Write Test

File: `src/test/my-component.test.jsx`

```javascript
import { render, screen } from '@testing-library/react';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('renders', () => {
    render(<MyComponent />);
    expect(screen.getByText('My Component')).toBeInTheDocument();
  });
});
```

### 5. Run Tests

```bash
npm run test:watch
```

## 📊 Context Providers

### AuthContext

Manages authentication state:

```javascript
const { user, login, logout, hasPermission } = useContext(AuthContext);

// Check if admin
if (hasPermission('admin')) {
  // Show admin-only features
}
```

### ConnectionContext

WebSocket connection status:

```javascript
const { isConnected, isSimulation, connectionStatus } = useContext(ConnectionContext);

// Show visual indicator
<div className={isConnected ? 'online' : 'offline'}>
  {connectionStatus}
</div>
```

### ToastContext

Show notifications:

```javascript
const { showToast } = useContext(ToastContext);

// Success, error, info notifications
showToast('Vehicle triggered!', 'success');
showToast('Failed to activate corridor', 'error');
```

## ⚙️ Configuration

### Dev Server (.env or vite.config.js)

```javascript
// vite.config.js
export default {
  server: {
    port: 5174,
    host: 'localhost',
    proxy: {
      '/api': 'http://localhost:8000',
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true
      }
    }
  }
}
```

### Build Configuration

```javascript
export default {
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2020',
    cssCodeSplit: true
  }
}
```

## 🎨 Styling

### Tailwind CSS (if added)

```bash
npm install -D tailwindcss
npx tailwindcss init
```

### CSS Modules

```javascript
import styles from './Component.module.css';

export default function Component() {
  return <div className={styles.container}>
}
```

```css
/* Component.module.css */
.container {
  padding: 20px;
}
```

### Inline Styles

```javascript
const containerStyle = {
  padding: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '12px'
};

export default function Component() {
  return <div style={containerStyle}></div>;
}
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Creates `dist/` folder with optimized files.

### Serve Production Build

**Using Node.js**:
```bash
npm install -g serve
serve -s dist -l 3000
```

**Using Nginx**:
```nginx
server {
  listen 80;
  server_name yourdomain.com;
  
  root /var/www/greenwave/dist;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  location /api {
    proxy_pass http://localhost:8000;
  }
}
```

**Using Docker**:
```dockerfile
FROM node:18 as build
WORKDIR /app
COPY package*.json .
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:18-slim
RUN npm install -g serve
COPY --from=build /app/dist /app/dist
CMD ["serve", "-s", "dist", "-l", "3000"]
```

## 🐛 Debugging

### React DevTools

Install browser extension:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [Firefox](https://addons.mozilla.org/firefox/addon/react-devtools/)

Then:
1. Open DevTools (F12)
2. Go to "Components" tab
3. Inspect component tree, props, state

### Console Logs

```javascript
console.log('Vehicle:', vehicle);
console.table(vehicles);  // Pretty table format
console.time('operation');
// ... operation ...
console.timeEnd('operation');  // Logs duration
```

### Vite Debug

```javascript
// In browser console
__VITE__.import // Access module imports
```

### Network Tab

1. Open DevTools (F12)
2. Go to "Network" tab
3. Trigger action
4. See API calls, responses, WebSocket frames

## ⚠️ Troubleshooting

### Module Not Found

```
Error: Cannot find module 'react'
```

**Solution**:
```bash
npm install --legacy-peer-deps
```

### Port Already in Use

```
Port 5174 is already in use
```

**Solution**:
```bash
# Use different port
npm run dev -- --port 5175

# Or kill process using 5174
lsof -i :5174
kill -9 <PID>
```

### WebSocket Connection Failed

```
WebSocket is closed before the connection is established
```

**Solution**:
1. Check backend is running: http://localhost:8000/health
2. Verify ws:// URL in useGreenWave.js
3. Check CORS configuration
4. Check browser console for details

### Test Failures

```bash
# Clear cache and rebuild
npm run test -- --clearCache
npm run test
```

### Hot Module Reload Not Working

```bash
# Restart dev server
npm run dev
```

## 📚 Learning Resources

### React
- [React Documentation](https://react.dev/)
- [React Router Docs](https://reactrouter.com/)
- [hooks deep dive](https://react.dev/reference/react)

### Testing
- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/react)
- [User Event](https://testing-library.com/user-event)

### Vite
- [Vite Guide](https://vitejs.dev/)
- [HMR Documentation](https://vitejs.dev/guide/hmr.html)

### Related
- [Recharts](https://recharts.org/) - Charts library
- [Socket.io Client](https://socket.io/docs/v4/socket-io-client-api/) - WebSocket client
- [Complete Testing Guide](../TESTING.md)

## 📝 npm Scripts Reference

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests once |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | Coverage report |
| `npm run test:ui` | Interactive UI |

## 🚀 Performance Optimization

### Code Splitting

React Router automatically code-splits pages:

```javascript
// Lazy load page
const Analytics = lazy(() => import('./pages/Analytics'));

<Suspense fallback={<LoadingSpinner />}>
  <Analytics />
</Suspense>
```

### Memoization

```javascript
import { memo } from 'react';

const StatCard = memo(({ title, value }) => (
  <div>{title}: {value}</div>
));
```

### useCallback for Performance

```javascript
const handleClick = useCallback(() => {
  // Expensive operation
}, [dependencies]);
```

## 📞 Support

For issues:

1. Check console: F12 → Console tab
2. Test backend: http://localhost:8000/health
3. Check GitHub issues
4. See [TESTING.md](../TESTING.md) for test help

---

**Version**: 1.0.0
**Last Updated**: March 5, 2026
**Status**: Production Ready ✅
