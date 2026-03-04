# Contributing to GreenWave

Guidelines for contributing to the GreenWave emergency response system.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Code Standards](#code-standards)
3. [Git Workflow](#git-workflow)
4. [Testing Requirements](#testing-requirements)
5. [Pull Request Process](#pull-request-process)
6. [Reporting Issues](#reporting-issues)
7. [Code Review](#code-review)

---

## Getting Started

### Prerequisites

- Python 3.8+ (backend)
- Node.js 16+ (frontend)
- Git
- Virtual environment tool (venv/conda)

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd GREENWARE

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend setup (new terminal)
npm install --legacy-peer-deps

# Run all tests
pytest  # Backend
npm run test  # Frontend
```

---

## Code Standards

### Python (Backend)

#### Style Guide

Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/):

```python
# Good
def calculate_corridor_time(distance_km, speed_kmh):
    """Calculate travel time in minutes."""
    return (distance_km / speed_kmh) * 60


# Bad
def calc_time(d,s):
    return (d/s)*60
```

#### Naming Conventions

```python
# Classes: PascalCase
class VehicleTracker:
    pass

# Functions/methods: snake_case
def get_active_vehicles():
    pass

# Constants: SCREAMING_SNAKE_CASE
MAX_VEHICLES = 100
GPS_THRESHOLD = 70

# Private: _leading_underscore
def _internal_helper():
    pass
```

#### Type Hints

Always include type hints:

```python
# Good
def get_vehicle(vehicle_id: str) -> Optional[Vehicle]:
    return db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

# Bad
def get_vehicle(vehicle_id):
    return db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
```

#### Docstrings

Use Google-style docstrings:

```python
def trigger_emergency_corridor(vehicle_id: str) -> Corridor:
    """Activate emergency corridor for a vehicle.
    
    Args:
        vehicle_id: Unique vehicle identifier.
        
    Returns:
        Corridor object with active corridor data.
        
    Raises:
        ValueError: If vehicle not found.
    """
    # Implementation
```

#### Imports

Organize imports:

```python
# Standard library
from datetime import datetime
import json

# Third-party
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Local
from backend.models import Vehicle
from backend.schemas import VehicleUpdate
```

### JavaScript/JSX (Frontend)

#### Style Guide

```javascript
// Good
export default function Dashboard() {
  const [corridors, setCorridors] = useState([]);
  
  useEffect(() => {
    fetchCorridors();
  }, []);
  
  return <div className="dashboard">{/* JSX */}</div>;
}

// Bad
export default function Dashboard(){
const corridors=useState([]);
useEffect(()=>{fetchCorridors()},[])}
```

#### Naming Conventions

```javascript
// Components: PascalCase
function VehicleMarker() {}

// Variables: camelCase
const activeVehicles = [];
let connectionStatus = 'CONNECTING';

// Constants: SCREAMING_SNAKE_CASE
const WEBSOCKET_TIMEOUT = 30000;
const API_BASE_URL = 'http://localhost:8000';

// Private: _leading_underscore
const _internalHelper = () => {};
```

#### Props Validation

```javascript
// Good
import PropTypes from 'prop-types';

function StatCard({ title, value }) {
  return <div>{title}: {value}</div>;
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired
};

// Bad
function StatCard({ title, value }) {
  return <div>{title}: {value}</div>;
}
```

#### Comments

```javascript
// Good: Explain WHY
// Use exponential backoff to prevent overwhelming server during reconnection
const reconnect = () => {
  ws = new WebSocket(WS_URL);
};

// Bad: Explain WHAT (code already does this)
// Reconnect to WebSocket
const connect = () => {
  ws = new WebSocket(WS_URL);
};
```

---

## Git Workflow

### Branch Naming

Follow naming convention:

```
feature/feature-name       # New feature
bugfix/bug-description     # Bug fix
refactor/component-name    # Code refactoring
docs/documentation-topic   # Documentation
test/test-area            # Test additions
```

**Examples**:
- `feature/conflict-resolution`
- `bugfix/gps-update-validation`
- `refactor/database-models`

### Commits

Write clear, descriptive commit messages:

```bash
# Good
git commit -m "Add conflict resolution algorithm

- Implement 8-tier priority system
- Add conflict detection within 200m radius
- Update tests with conflict scenarios"

# Bad
git commit -m "fix stuff"
git commit -m "wip"
```

### Commit Message Format

```
[TYPE] Short description (max 50 chars)

Detailed explanation (max 72 chars per line)

- Feature bullet point
- Another point
- Related changes

Fixes #123
```

**Types**:
- `FEATURE` - New feature
- `BUGFIX` - Bug fix
- `REFACTOR` - Code restructuring
- `DOCS` - Documentation only
- `TEST` - Test additions
- `PERF` - Performance improvement

---

## Testing Requirements

### Backend Tests

**Coverage Target**: 85%+

```bash
# Write tests for new features
pytest tests/test_your_feature.py -v

# Check coverage
pytest --cov=backend --cov-report=html

# All tests must pass before PR
pytest
```

**Test Structure**:

```python
# tests/test_your_router.py
import pytest
from fastapi.testclient import TestClient

class TestYourEndpoint:
    """Test suite for your endpoint."""
    
    def test_successful_request(self, test_client):
        """Test happy path."""
        response = test_client.get("/api/your/endpoint")
        assert response.status_code == 200
        
    def test_invalid_input(self, test_client):
        """Test validation."""
        response = test_client.get("/api/your/endpoint?invalid=data")
        assert response.status_code == 422
        
    def test_resource_not_found(self, test_client):
        """Test 404 error."""
        response = test_client.get("/api/your/nonexistent-id")
        assert response.status_code == 404
```

### Frontend Tests

**Coverage Target**: 75%+

```bash
# Write tests for new components
npm run test -- your-component.test.jsx

# Check coverage
npm run test:coverage

# All tests must pass before PR
npm run test
```

**Test Structure**:

```javascript
// src/test/your-component.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import YourComponent from '../components/YourComponent';

describe('YourComponent', () => {
  it('renders successfully', () => {
    render(<YourComponent />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });
  
  it('handles user interaction', async () => {
    render(<YourComponent />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(screen.getByText('result')).toBeInTheDocument();
  });
  
  it('handles errors gracefully', () => {
    render(<YourComponent error="Something went wrong" />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

### Test Checklist

- [ ] New features have tests
- [ ] Tests pass locally
- [ ] Coverage maintained/improved
- [ ] Edge cases covered
- [ ] Error handling tested
- [ ] No console errors/warnings

---

## Pull Request Process

### Before Creating PR

1. **Test All Changes**
   ```bash
   # Backend
   cd backend && pytest --cov
   
   # Frontend
   npm run test:coverage
   ```

2. **No Lint Errors**
   ```bash
   # Python
   python -m flake8 backend/
   
   # JavaScript
   npm run lint  # if available
   ```

3. **Code Review Self**
   - Read your own code first
   - Catch obvious issues
   - Check for consistency

4. **Update Documentation**
   - Update TESTING.md if tests change
   - Update API-REFERENCE.md if endpoints change
   - Update QUICK-REFERENCE.md if workflows change

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Item 1
- Item 2
- Item 3

## Testing Done
- [ ] Backend tests pass
- [ ] Frontend tests pass
- [ ] Coverage maintained
- [ ] Tested manually

## Screenshots (if applicable)
Include before/after or new feature screenshots.

## Related Issues
Closes #123

## Checklist
- [ ] Code follows style guide
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No breaking changes
```

### PR Review Checklist

- [ ] Code quality
- [ ] Test coverage
- [ ] Documentation
- [ ] No duplicate code
- [ ] Performance
- [ ] Security

---

## Reporting Issues

### Bug Report Template

```markdown
## Description
Clear description of the bug.

## Reproduction Steps
1. Start with...
2. Then do...
3. Finally...

## Expected Behavior
What should happen.

## Actual Behavior
What actually happened.

## Environment
- OS: Ubuntu 20.04
- Node: 18.0.0
- Python: 3.10.0
- Browser: Chrome 120 (if frontend)

## Error Messages
```
Paste error/traceback here
```

## Additional Context
Any other information.
```

### Feature Request Template

```markdown
## Description
Brief description of desired feature.

## Problem It Solves
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives
Other approaches considered.

## Additional Context
Screenshots, mockups, or examples.
```

---

## Code Review

### For Authors

- [ ] Respond to feedback professionally
- [ ] Ask questions if unclear
- [ ] Make requested changes promptly
- [ ] Request re-review after changes
- [ ] Keep PRs focused (single feature/fix)
- [ ] Keep PRs small when possible

### For Reviewers

**Be Respectful**:
```
Good: "This could be simplified by using a list comprehension."
Bad: "This is inefficient code."
```

**Be Specific**:
```
Good: "Line 45: Consider using db.query().filter() instead of manual loops."
Bad: "This looks wrong."
```

**Ask Questions**:
```
Good: "What was the reason for using a global variable here?"
Bad: "Don't use global variables."
```

**Approve When Ready**:
- Code passes tests
- Comments addressed
- Follows style guide
- No security issues

---

## Performance Guidelines

### Backend

```python
# Good: Efficient database query
vehicles = db.query(Vehicle).filter(
    Vehicle.is_emergency == True
).limit(100).all()

# Bad: Inefficient, loads all then filters
vehicles = [v for v in db.query(Vehicle).all() if v.is_emergency]
```

### Frontend

```javascript
// Good: Memoized component
const CorridorCard = memo(({ corridor }) => (
  <div>{corridor.id}</div>
));

// Bad: Re-renders on every parent render
function CorridorCard({ corridor }) {
  return <div>{corridor.id}</div>;
}
```

---

## Security Guidelines

### Authentication

```python
# Good: Use sessions
sessionStorage.setItem('auth', JSON.stringify(user))

# Bad: Store in localStorage
localStorage.setItem('token', token)
```

### Input Validation

```python
# Good: Validate all inputs
from pydantic import BaseModel, validator

class VehicleUpdate(BaseModel):
    vehicle_id: str
    latitude: float
    longitude: float
    
    @validator('latitude')
    def validate_latitude(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('Invalid latitude')
        return v

# Bad: No validation
def update_vehicle(vehicle_id, latitude):
    # Could receive any value
    pass
```

### SQL Injection Prevention

```python
# Good: Use ORM
vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

# Bad: String interpolation
vehicle = db.query(f"SELECT * FROM vehicle WHERE id = '{vehicle_id}'")
```

---

## Documentation Standards

### README Updates

Update relevant docs when:
- Adding new endpoints → API-REFERENCE.md
- Adding new tests → TESTING.md
- Adding new features → COMPLETE-README.md
- Changing workflows → QUICK-REFERENCE.md

### Docstring Examples

```python
def activate_corridor(vehicle_id: str) -> Corridor:
    """Activate emergency corridor for vehicle.
    
    This function:
    - Calculates optimal route
    - Generates signal timing
    - Notifies via SMS
    - Returns corridor object
    
    Args:
        vehicle_id: Unique vehicle identifier (e.g., 'AMB-001')
        
    Returns:
        Corridor object with:
            - corridor_id: Unique corridor ID
            - route_json: GeoJSON route geometry
            - intersections: List of signal points
            - eta_minutes: Estimated arrival time
            
    Raises:
        ValueError: If vehicle not found
        DatabaseError: If corridor insertion fails
        
    Example:
        >>> corridor = activate_corridor('AMB-001')
        >>> print(f"ETA: {corridor.eta_minutes} minutes")
    """
```

---

## Community Guidelines

### Be Respectful

- Treat everyone with respect
- Respect different opinions
- No harassment or discrimination
- Support inclusive community

### Be Helpful

- Help junior developers learn
- Answer questions patiently
- Share knowledge freely
- Celebrate contributions

### Be Professional

- Keep discussions technical
- Avoid personal attacks
- Focus on code quality
- Welcome constructive feedback

---

## Questions?

- See [COMPLETE-README.md](./COMPLETE-README.md) for overview
- See [TESTING.md](./TESTING.md) for testing details
- See [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) for common tasks
- Open an issue for questions

---

**Version**: 1.0.0
**Last Updated**: March 5, 2026
**Status**: Active ✅
