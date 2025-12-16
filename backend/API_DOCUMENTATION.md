# Django Backend API - Quick Reference

## 🚀 Server Running at: http://127.0.0.1:8000

## 📋 Available Endpoints

### Authentication Endpoints

#### 1. Register New User
```
POST http://127.0.0.1:8000/api/auth/register/
Content-Type: application/json

{
    "email": "user@example.com",
    "username": "username",
    "password": "StrongPassword123!",
    "password2": "StrongPassword123!"
}
```

**Response:**
```json
{
    "user": {
        "id": 1,
        "email": "user@example.com",
        "username": "username",
        "first_name": "",
        "last_name": "",
        "country": "",
        "country_code": "",
        "phone": "",
        "date_of_birth": null,
        "gender": "",
        "date_joined": "2025-12-15T14:06:00Z"
    },
    "access": "eyJ0eXAiOiJKV1QiLCJh...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJh...",
    "message": "User registered successfully"
}
```

---

#### 2. Login
```
POST http://127.0.0.1:8000/api/auth/login/
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "StrongPassword123!"
}
```

**Response:**
```json
{
    "user": { ... },
    "access": "eyJ0eXAiOiJKV1QiLCJh...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJh...",
    "message": "Login successful"
}
```

---

#### 3. Logout
```
POST http://127.0.0.1:8000/api/auth/logout/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "refresh": "<refresh_token>"
}
```

---

#### 4. Refresh Token
```
POST http://127.0.0.1:8000/api/auth/token/refresh/
Content-Type: application/json

{
    "refresh": "<refresh_token>"
}
```

---

### Profile Endpoints

#### 5. Get User Profile
```
GET http://127.0.0.1:8000/api/auth/profile/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
    "user": {
        "id": 1,
        "email": "user@example.com",
        "full_name": "John Doe",
        "country": "USA",
        "country_code": "+1",
        "phone": "1234567890",
        "date_of_birth": "1990-01-01",
        "gender": "male",
        "date_joined": "2025-12-15T14:06:00Z"
    }
}
```

---

#### 6. Update User Profile
```
PUT http://127.0.0.1:8000/api/auth/profile/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "full_name": "John Updated Doe",
    "country": "USA",
    "country_code": "+1",
    "phone": "1234567890",
    "date_of_birth": "1990-01-01",
    "gender": "male"
}
```

---

#### 7. Change Password
```
POST http://127.0.0.1:8000/api/auth/change-password/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "old_password": "OldPassword123!",
    "new_password": "NewPassword123!",
    "new_password2": "NewPassword123!"
}
```

---

#### 8. Delete Account
```
DELETE http://127.0.0.1:8000/api/auth/delete-account/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "password": "YourPassword123!"
}
```

---

## 🔒 Authentication

All endpoints except `register`, `login`, and `token/refresh` require authentication.

Add this header to authenticated requests:
```
Authorization: Bearer <access_token>
```

## ⏰ Token Lifetimes

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

## 🧪 Testing with cURL

### Register:
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"Test123!@#","password2":"Test123!@#","full_name":"Test User"}'
```

### Login:
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@#"}'
```

### Get Profile:
```bash
curl -X GET http://127.0.0.1:8000/api/auth/profile/ \
  -H "Authorization: Bearer <your_access_token>"
```

## 🎯 Testing with Postman

1. **Set Base URL**: `http://127.0.0.1:8000`
2. **Test Register**: POST `/api/auth/register/` with body
3. **Copy tokens** from response
4. **Test Profile**: GET `/api/auth/profile/` with Bearer token
5. **Test Update**: PUT `/api/auth/profile/` with Bearer token and body

## 📊 Admin Panel

Access: http://127.0.0.1:8000/admin
Login: ravi@test.com (superuser you created)

## ✅ What's Been Created

### Files:
- ✅ `users/serializers.py` - Data validation & transformation
- ✅ `users/views.py` - API endpoint logic
- ✅ `users/urls.py` - URL routing
- ✅ `users/admin.py` - Admin panel configuration
- ✅ `config/urls.py` - Main URL configuration

### Features:
- ✅ JWT Authentication
- ✅ User Registration
- ✅ User Login
- ✅ Profile Management
- ✅ Password Change
- ✅ Account Deletion
- ✅ Token Refresh
- ✅ CORS enabled for frontend

## 🔄 Next Steps

1. Test all endpoints with Postman or cURL
2. Connect your frontend to these endpoints
3. Add user settings endpoints (theme, notifications, privacy)
4. Add email verification (optional)
5. Add password reset (optional)

## 🐛 Troubleshooting

**Port already in use?**
```bash
python manage.py runserver 8001
```

**CORS issues?**
Check `CORS_ALLOWED_ORIGINS` in settings.py includes your frontend URL

**Token expired?**
Use the `/api/auth/token/refresh/` endpoint with your refresh token
