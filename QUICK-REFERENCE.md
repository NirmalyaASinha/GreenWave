# GreenWave Quick Reference - Developer Cheat Sheet

Fast lookup guide for common development tasks.

## 🚀 Start Development

### First Time Setup

```bash
# 1. Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pytest  # Verify tests pass

# 2. Frontend (new terminal)
npm install --legacy-peer-deps
npm run test  # Verify tests pass

# 3. Start both servers in separate terminals
# Terminal 1 (Backend)
cd backend && python -m uvicorn main:app --reload

# Terminal 2 (Frontend)
npm run dev
```

Visit http://localhost:5174 in your browser.

---

## 📋 Common Commands

### Backend

```bash
# Run tests
cd backend && pytest

# Run specific test
pytest tests/test_gps.py -v

# With coverage
pytest --cov=. --cov-report=html

# Watch mode
ptw

# Start server
python -m uvicorn main:app --reload

# Check health
curl http://localhost:8000/health
```

### Frontend

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Interactive UI
npm run test:ui

# Start dev server
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

---

## 🧪 Testing Quick Reference

### Frontend

```javascript
// Test component render
render(<MyComponent />);
expect(screen.getByText('text')).toBeInTheDocument();

// Test user interaction
await userEvent.click(button);
await userEvent.type(input, 'text');

// Test async
await waitFor(() => {
  expect(screen.getByText('loaded')).toBeInTheDocument();
});

// Test hook
const { result } = renderHook(() => useMyHook());
act(() => {
  result.current.someFunction();
});
```

### Backend

```python
# Test endpoint
response = test_client.get("/api/gps/vehicles")
assert response.status_code == 200
assert response.json()["total"] > 0

# Test with database
vehicle = sample_vehicle(db)
assert vehicle.vehicle_id == "AMB-001"

# Test async
@pytest.mark.asyncio
async def test_async_function():
    result = await some_async_op()
    assert result is not None
```

---

## 🔌 API Testing

### Quick API Calls

```bash
# Get active vehicles
curl http://localhost:8000/api/gps/vehicles

# Submit GPS update
curl -X POST http://localhost:8000/api/gps/update \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id":"AMB-001",
    "vehicle_type":"AMBULANCE",
    "latitude":13.0827,
    "longitude":80.2707,
    "speed_kmh":85,
    "acceleration_kmh_s":18,
    "is_emergency":true
  }'

# Get analytics
curl http://localhost:8000/api/analytics/summary

# Trigger demo
curl -X POST http://localhost:8000/api/demo/trigger \
  -H "Content-Type: application/json" \
  -d '{"vehicle_type":"AMBULANCE"}'

# Reset demo
curl -X POST http://localhost:8000/api/demo/reset

# View API docs
# Open: http://localhost:8000/docs
```

---

## 📝 Code Navigation

### Frontend Folder Structure Quick Reference

```
src/
├── pages/              # Full page components
│   ├── Dashboard.jsx   # Main dashboard
│   ├── Analytics.jsx   # Charts page
│   └── IncidentLog.jsx # Incident table
├── components/         # Reusable components
│   ├── Navbar.jsx
│   └── LiveMap.jsx
├── hooks/              # Custom hooks
│   └── useGreenWave.js # WebSocket hook
├── contexts/           # Context providers
│   ├── AuthContext.js
│   ├── ConnectionContext.js
│   └── ToastContext.js
├── test/               # Tests
│   ├── setup.js        # Mocks & factories
│   └── *.test.jsx
└── App.jsx             # Root component
```

### Backend Folder Structure Quick Reference

```
backend/
├── routers/            # API endpoints
│   ├── gps.py         # /api/gps/*
│   ├── corridor.py    # /api/corridor/*
│   ├── incidents.py   # /api/incidents/*
│   ├── analytics.py   # /api/analytics/*
│   ├── hardware.py    # /api/hardware/*
│   └── demo.py        # /api/demo/*
├── services/           # Business logic
│   ├── route_engine.py
│   ├── signal_cascade.py
│   ├── conflict_resolution.py
│   ├── sms_service.py
│   └── simulation.py
├── tests/              # Test files
│   ├── conftest.py    # Fixtures
│   ├── test_*.py      # Test modules
│   └── pytest.ini     # Config
├── models.py           # Database models
├── schemas.py          # Data validation
├── database.py         # DB setup
├── main.py             # FastAPI app
└── config.py           # Settings
```

---

## 🐛 Debugging

### Frontend

```javascript
// Console logs
console.log('var:', value);
console.table(array);
console.time('operation');

// Break on error
debugger;

// React DevTools
// Install browser extension, use Components tab

// Network tab (F12)
// View API calls, WebSocket frames
```

### Backend

```python
# Debug logs
import logging
logger = logging.getLogger(__name__)
logger.debug(f"vehicle: {vehicle}")

# Break execution
breakpoint()  # or import pdb; pdb.set_trace()

# Database query
result = db.query(Vehicle).filter(Vehicle.id == 1).first()
print(result)

# Test with pdb
pytest --pdb tests/test_gps.py
```

---

## 🔧 Common Fixes

### Module Not Found

```bash
# Frontend
npm install --legacy-peer-deps

# Backend
pip install -r requirements.txt
pip install -e .  # Editable mode
```

### Port Already in Use

```bash
# Frontend
npm run dev -- --port 5175

# Backend
python -m uvicorn main:app --reload --port 8001

# Kill process (Linux/Mac)
lsof -i :5174
kill -9 <PID>
```

### Database Issues

```bash
# Reset database
cd backend
rm greenwave.db
pytest  # Recreates with tests
```

### Test Failures

```bash
# Clear cache
npm run test -- --clearCache
pytest --cache-clear

# Verbose output
npm run test -- --reporter=verbose
pytest -vv
```

### WebSocket Connection Failed

```bash
# Check backend is running
curl http://localhost:8000/health

# Check URL in code
# Frontend: ws://localhost:8000/ws
# Check CORS config in main.py
```

---

## 📊 Testing Checklist

### Before Committing

```bash
# Frontend
npm run test          # All tests pass
npm run test:coverage # Coverage >= 75%
npm run build         # No build errors

# Backend
pytest                # All tests pass  
pytest --cov          # Coverage >= 85%
python -m py_compile backend/*.py  # No syntax errors
```

### For Pull Requests

- [ ] New tests written for new features
- [ ] Tests pass locally
- [ ] No console errors in browser
- [ ] No lint warnings
- [ ] Documentation updated

---

## 🚀 Deployment Checklist

### Before Production Deploy

```bash
# Backend
cd backend
pytest --cov
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app

# Frontend
npm run build
npm run preview  # Test production build
```

### Environment Variables Setup

```env
# Backend
DEBUG=false
DATABASE_URL=postgresql://user:pass@prod-db:5432/greenwave
GPS_SPEED_THRESHOLD_KMH=70
CORRIDOR_SIGNAL_GREEN_TIME=30
ENABLE_SMS=true
SMS_SERIAL_PORT=/dev/ttyUSB0

# Frontend  
VITE_API_URL=https://api.greenwave.com
VITE_WS_URL=wss://api.greenwave.com/ws
```

---

## 📚 Key Concepts

### Emergency Detection (2+ flags needed)

```
Speed > 70 km/h           ✓ Flag
Acceleration > 15 km/h/s  ✓ Flag
Off-peak hours (before 6 AM or after 10 PM)  ✓ Flag
Explicit is_emergency flag  ✓ Flag

Any 2+ = Corridor activated
```

### Conflict Resolution (Priority order)

```
1. Ambulance Cardiac      ← Higher priority (gets corridor)
2. Ambulance General
3. Fire Truck Structural
4. Fire Truck Medical
5. Police Traffic
6. Police General         ← Lower priority (gets alternate route)
```

### Authentication Roles

```
Admin       → View, Trigger, Admin panel
Dispatch    → View, Trigger emergencies
Viewer      → View only (no triggers)
```

---

## 🔗 Useful Links

**Documentation**:
- [Complete README](./COMPLETE-README.md)
- [Backend Setup](./BACKEND-SETUP.md)
- [Frontend Setup](./FRONTEND-SETUP.md)
- [API Reference](./API-REFERENCE.md)
- [Testing Guide](./TESTING.md)

**External**:
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [Vitest](https://vitest.dev/)
- [pytest](https://docs.pytest.org/)

**Local Servers**:
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Frontend: http://localhost:5174

---

## 💡 Pro Tips

### Test Faster

```bash
# Run only failed tests
pytest --lf

# Run only recently changed tests
pytest --ff

# Exit on first failure
pytest -x
```

### Debug WebSocket

```javascript
// In browser console
ws = new WebSocket('ws://localhost:8000/ws');
ws.onmessage = (e) => console.log('Received:', JSON.parse(e.data));
ws.send(JSON.stringify({type: 'PING'}));
```

### Mock API Requests

```javascript
// In browser console
fetch('http://localhost:8000/api/gps/vehicles')
  .then(r => r.json())
  .then(d => console.table(d.vehicles));
```

### Database Inspection

```bash
cd backend
sqlite3 greenwave.db
.tables
SELECT COUNT(*) FROM vehicle;
SELECT * FROM vehicle LIMIT 5;
.quit
```

---

## ✅ Before Asking for Help

1. Check logs: `tail -f logs/greenwave.log`
2. Check console: Browser F12 → Console tab
3. Test API: http://localhost:8000/docs
4. Search docs: COMPLETE-README.md, TESTING.md
5. Run tests: `pytest`, `npm run test`
6. Clear cache: `npm cache clean --force`, `pytest --cache-clear`

---

**Version**: 1.0.0
**Last Updated**: March 5, 2026
**Quick Help**: See COMPLETE-README.md or TESTING.md for detailed guides
