# GreenWave Testing Documentation

Complete test suite for both backend (FastAPI + pytest) and frontend (React + Vitest).

## Overview

```
Total Tests: 100+
├── Backend (pytest): 45+ tests
│   ├── GPS Tracking (7)
│   ├── Corridor Management (6)
│   ├── Incidents (7)
│   ├── Analytics (6)
│   ├── Hardware (6)
│   ├── Demo/Simulation (4)
│   ├── Conflict Resolution (3)
│   ├── SMS Service (3)
│   └── Security & System (5)
└── Frontend (Vitest): 55+ tests
    ├── Authentication (6)
    ├── Dashboard (6)
    ├── Incidents (3)
    ├── Analytics (4)
    └── WebSocket Hooks (7)
```

## Backend Testing Setup

### Prerequisites

```bash
# Ensure you're in the backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install test dependencies
pip install pytest pytest-asyncio pytest-cov httpx
```

### Running Backend Tests

#### Run all tests
```bash
pytest
```

#### Run specific test file
```bash
pytest tests/test_gps.py -v
```

#### Run tests by marker
```bash
# Run only unit tests
pytest -m unit

# Run only async tests
pytest -m asyncio
```

#### Run with coverage report
```bash
pytest --cov=backend --cov-report=html
# Open htmlcov/index.html in browser
```

#### Run tests in watch mode (requires pytest-watch)
```bash
pip install pytest-watch
ptw
```

### Backend Test Structure

```
backend/tests/
├── conftest.py                 # Shared fixtures and mocks
├── test_gps.py                # GPS tracking and emergency detection
├── test_corridor.py           # Corridor management
├── test_incidents.py          # Incident logging
├── test_analytics.py          # Analytics endpoints
├── test_hardware.py           # Hardware monitoring
├── test_demo.py               # Demo/simulation scenarios
├── test_conflict.py           # Conflict resolution logic
├── test_sms.py                # SMS notification service
└── test_security.py           # Security and system tests
```

### Test Coverage Goals

- **GPS Router**: 95% coverage
- **Corridor Management**: 90% coverage
- **Incident Tracking**: 88% coverage
- **Analytics**: 85% coverage
- **Hardware Monitoring**: 80% coverage
- **Overall Backend**: 85%+

## Frontend Testing Setup

### Prerequisites

```bash
# Already installed but verify
npm list vitest @testing-library/react

# If missing, install
npm install --save-dev vitest @testing-library/react @testing-library/user-event
```

### Running Frontend Tests

#### Run all tests
```bash
npm run test
```

#### Run tests in watch mode
```bash
npm run test:watch
```

#### Generate coverage report
```bash
npm run test:coverage
```

#### Run tests with UI
```bash
npm run test:ui
```

### Frontend Test Structure

```
src/test/
├── setup.js                    # Test setup, mocks, factories
├── auth.test.jsx               # Authentication tests
├── dashboard.test.jsx          # Dashboard component tests
├── incidents.test.jsx          # Incident log tests
├── analytics.test.jsx          # Analytics page tests
└── hooks.test.js               # WebSocket hook tests
```

### Test Coverage Goals

- **Auth/Login**: 90% coverage
- **Dashboard**: 85% coverage
- **Analytics**: 80% coverage
- **Incident Log**: 80% coverage
- **Overall Frontend**: 75%+

## Backend Test Examples

### Test GPS Emergency Detection

```bash
pytest tests/test_gps.py::TestGPSUpdate::test_gps_update_triggers_emergency -v
```

### Test Corridor Activation

```bash
pytest tests/test_corridor.py::TestCorridorActivation::test_corridor_activation -v
```

### Test Conflict Resolution

```bash
pytest tests/test_conflict.py -v
```

## Frontend Test Examples

### Run Auth Tests
```bash
npm run test -- auth.test.jsx
```

### Run Dashboard Tests
```bash
npm run test -- dashboard.test.jsx
```

### Watch Mode with Pattern
```bash
npm run test:watch -- --grep dashboard
```

## Mocking Strategy

### Backend Mocks (conftest.py)

1. **Database**: In-memory SQLite for isolation
2. **Hardware**: 
   - PySerial mocked for Arduino communication
   - OSMnx mocked for route calculation
   - psutil mocked for system monitoring
3. **Services**: All external services mocked

### Frontend Mocks (setup.js)

1. **WebSocket**: Full WebSocket mock with message queue
2. **Fetch**: Mocked API responses for common endpoints
3. **DOM APIs**: ResizeObserver, matchMedia, Notification
4. **Storage**: sessionStorage automatically cleared per test

## Test Data Factories

### Backend

```python
# In conftest.py
@pytest.fixture
def sample_vehicle(test_db_session):
    # Creates Vehicle(vehicle_id="AMB-001")
    
@pytest.fixture
def sample_corridors(test_db_session):
    # Creates 2 corridors with mock data
    
@pytest.fixture
def sample_incidents(test_db_session):
    # Creates 5+ incidents with various threat types
```

### Frontend

```javascript
// In setup.js
import { createVehicle, createCorridor, createIncident } from './setup.js'

// Usage in tests
const vehicle = createVehicle({ vehicle_id: 'TEST-001' })
const corridor = createCorridor({ status: 'COMPLETED' })
const incident = createIncident({ threat_type: 'CONFLICT' })
```

## Key Test Scenarios

### Backend

#### GPS Tests
- ✅ Normal traffic (no emergency)
- ✅ High speed triggers corridor
- ✅ Invalid input validation
- ✅ Vehicle history retrieval
- ✅ Position tracking with acceleration

#### Corridor Tests
- ✅ Activation with signal timing
- ✅ Deactivation with time savings
- ✅ Route JSON persistence
- ✅ ETA calculation
- ✅ Statistics aggregation

#### Conflict Tests
- ✅ No conflict on different routes
- ✅ Higher priority wins
- ✅ Alternate route assignment
- ✅ Conflict logging

#### Analytics Tests
- ✅ Daily/hourly breakdown
- ✅ Vehicle type statistics
- ✅ Response time trends
- ✅ Empty database handling

#### Hardware Tests
- ✅ Component status monitoring
- ✅ CPU/memory tracking
- ✅ Alert logging
- ✅ Availability statistics

### Frontend

#### Auth Tests
- ✅ Login with valid credentials
- ✅ Reject invalid credentials
- ✅ Store auth in sessionStorage
- ✅ Support 3 roles (admin, dispatch, viewer)

#### Dashboard Tests
- ✅ Display stat cards
- ✅ Show connection status
- ✅ Emergency buttons appear for admin
- ✅ Emergency buttons hidden for viewer
- ✅ Corridor countdown display

#### Analytics Tests
- ✅ Render 4 charts
- ✅ Date range filtering
- ✅ Summary statistics display
- ✅ Chart data updates

#### WebSocket Tests
- ✅ Initial CONNECTING state
- ✅ Transition to CONNECTED
- ✅ Receive VEHICLE_UPDATE
- ✅ Receive CORRIDOR_ACTIVATED
- ✅ Exponential backoff on failure
- ✅ Simulation fallback

## Running Full Test Suite

### Sequential (recommended for CI/CD)

```bash
# Backend
cd backend
pytest --cov=backend --cov-report=term-missing

# Frontend
cd ..
npm run test
```

### Parallel Testing

```bash
# Backend with parallel execution
pytest -n auto

# Frontend watches entire directory
npm run test:watch
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with: {python-version: '3.10'}
      - run: pip install -r backend/requirements.txt pytest pytest-cov
      - run: cd backend && pytest --cov=. --cov-report=xml
      - uses: codecov/codecov-action@v3

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: {node-version: '18'}
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

## Troubleshooting

### Backend Tests Failing

**Database locked error:**
```bash
rm backend/greenwave.db
pytest
```

**Import errors:**
```bash
cd backend
pip install -e .
pytest
```

**Async test timeout:**
```bash
pytest -v --tb=short --timeout=10
```

### Frontend Tests Failing

**WebSocket connection errors:**
- WebSocket is mocked globally in setup.js
- Check that sessionStorage isn't interfering
- Clear browser cache

**ResizeObserver errors:**
- Already mocked in setup.js
- If persisting, ensure setup.js is imported

**Component rendering:**
```bash
npm run test:ui  # Use interactive UI to debug
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Backend test suite | < 30 seconds |
| Frontend test suite | < 20 seconds |
| Single test execution | < 1 second |
| Total coverage | > 80% |

## Best Practices

### Writing Backend Tests

```python
# Use descriptive test names
def test_gps_update_triggers_emergency_with_high_speed_and_acceleration():
    pass

# Use fixtures effectively
def test_something(test_client, sample_vehicles, mock_serial):
    pass

# Assert one thing per test
assert response.status_code == 200
assert data["emergency_detected"] is True

# Don't depend on test order
def test_should_work_in_any_order(clear_tables):
    pass
```

### Writing Frontend Tests

```javascript
// Use async/await properly
it('should handle async operations', async () => {
  render(<Component />)
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
  })
})

// Use userEvent instead of fireEvent
await userEvent.type(input, 'text')
await userEvent.click(button)

// Clear state between tests
beforeEach(() => {
  sessionStorage.clear()
  vi.clearAllMocks()
})
```

## Maintenance

### Regular Updates

- Update test dependencies monthly
- Review coverage reports weekly
- Add tests for bug fixes
- Update mocks when APIs change

### Deprecation Warnings

```bash
# Backend
pytest -W default::DeprecationWarning

# Frontend
npm run test:watch -- --reporter=verbose
```

## Resources

- [pytest Documentation](https://docs.pytest.org)
- [Vitest Guide](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## Support

For test-related issues:
1. Check existing test examples
2. Review conftest.py or setup.js
3. Enable debug output: `-v` (pytest) or `--reporter=verbose` (vitest)
4. Use `--pdb` (pytest) or debugger (vitest) for interactive debugging

---

**Last Updated**: March 5, 2026
**Test Suite Version**: 1.0.0
