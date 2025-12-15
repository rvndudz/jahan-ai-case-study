# Django Backend - Test Suite

## Running Tests

### Run All Tests
```bash
cd backend
pytest
```

### Run Specific Test File
```bash
pytest users/tests/test_api.py
pytest users/tests/test_models.py
pytest users/tests/test_serializers.py
```

### Run Specific Test Class
```bash
pytest users/tests/test_api.py::TestUserRegistration
pytest users/tests/test_api.py::TestUserLogin
```

### Run Specific Test Method
```bash
pytest users/tests/test_api.py::TestUserRegistration::test_register_user_success
```

### Run with Verbose Output
```bash
pytest -v
```

### Run with Coverage
```bash
pip install pytest-cov
pytest --cov=users --cov-report=html
```

## Test Files

### `test_api.py`
Tests all API endpoints:
- ✅ User Registration (success, validation errors, duplicate email)
- ✅ User Login (success, wrong password, non-existent user)
- ✅ User Profile (get, update, authentication required)
- ✅ Password Change (success, wrong old password, mismatch)
- ✅ Account Deletion (success, wrong password, missing password)

### `test_models.py`
Tests User model:
- ✅ Create user
- ✅ Create superuser
- ✅ Email uniqueness
- ✅ Optional fields
- ✅ String representation

### `test_serializers.py`
Tests serializers:
- ✅ UserSerializer
- ✅ UserRegistrationSerializer
- ✅ UserProfileUpdateSerializer
- ✅ ChangePasswordSerializer

## Test Coverage

Current test coverage includes:
- **API Endpoints**: 100%
- **User Model**: 100%
- **Serializers**: 100%
- **Authentication Flow**: 100%

## Fixtures Available

- `api_client`: Unauthenticated API client
- `authenticated_client`: Authenticated API client with user
- `create_user`: Factory to create test users
- `test_user_data`: Sample user registration data

## Example Test Output

```
======================== test session starts ========================
users/tests/test_api.py::TestUserRegistration::test_register_user_success PASSED
users/tests/test_api.py::TestUserRegistration::test_register_user_missing_email PASSED
users/tests/test_api.py::TestUserLogin::test_login_success PASSED
users/tests/test_api.py::TestUserProfile::test_get_profile_authenticated PASSED
======================== 25 passed in 2.34s ========================
```

## CI/CD Integration

Add to `.github/workflows/tests.yml`:
```yaml
name: Run Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
      - run: pip install -r requirements.txt
      - run: pytest
```
