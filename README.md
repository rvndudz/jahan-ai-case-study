# User Preferences Application

A full-stack web application for managing user preferences, built with Django REST Framework (backend) and Webix Jet (frontend). This system provides user account management including authentication, profile customization, notifications, privacy controls, and theme settings.

## 📋 Overview

This application demonstrates a complete modern web architecture with secure authentication, RESTful API design, and an intuitive user interface. Users can register, authenticate, and manage their personal preferences across multiple settings categories.

## 🚀 Tech Stack

### Backend
- **Django 6.0** - Python web framework
- **Django REST Framework** - RESTful API toolkit
- **djangorestframework-simplejwt** - JWT authentication
- **django-cors-headers** - CORS handling
- **SQLite** - Database (development)
- **Python 3.13+** - Programming language

### Frontend
- **Webix-jet** - JavaScript UI framework
- **Vite** - Build tool and dev server
- **ES6+ JavaScript** - Modern JavaScript
- **CSS3** - Styling

## ✨ Features

### Authentication
- User registration with validation
- Email-based login with JWT tokens
- Automatic token refresh
- Secure logout with token blacklisting
- Password change functionality
- Account deletion

### User Profile Management
- Personal information (full name, date of birth, gender)
- Contact details (email, phone, country)
- Profile editing with validation
- Real-time form updates

### Settings Pages
- **Account Settings** - Manage personal information
- **Notifications** - Configure notification preferences (email, push, SMS, digest frequency, activity alerts, quiet hours)
- **Privacy** - Control visibility and security settings
- **Theme** - Customize appearance (theme mode, accent color, typography)

## 📁 Project Structure

```
jahan-ai-case-study/
├── backend/                    # Django backend
│   ├── config/                # Project configuration
│   │   ├── settings.py        # Django settings
│   │   ├── urls.py           # URL routing
│   │   └── wsgi.py           # WSGI config
│   ├── users/                 # Users app
│   │   ├── migrations/       # Database migrations
│   │   ├── admin.py          # Admin configuration
│   │   ├── models.py         # User model
│   │   ├── serializers.py    # API serializers
│   │   ├── views.py          # API views
│   │   └── urls.py           # App URLs
│   ├── manage.py             # Django management script
│   ├── db.sqlite3            # SQLite database
│   └── venv/                 # Python virtual environment
│
└── frontend/                  # Webix-jet frontend
    ├── sources/              # Source code
    │   ├── views/           # UI views
    │   │   ├── settings/    # Settings pages
    │   │   │   ├── account.js
    │   │   │   ├── notifications.js
    │   │   │   ├── privacy.js
    │   │   │   └── theme.js
    │   │   ├── login.js
    │   │   ├── register.js
    │   │   └── settings.js
    │   ├── services/        # Business logic
    │   │   ├── api.js       # API client
    │   │   ├── authService.js
    │   │   └── themeService.js
    │   └── styles/          # CSS files
    ├── index.html           # Entry point
    ├── package.json         # Dependencies
    └── vite.config.js       # Vite configuration
```

## 🔧 Setup Instructions

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**
   - Windows:
     ```bash
     .\venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver 8000
   ```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

Frontend will be available at `http://localhost:5174`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login with email and password
- `POST /api/auth/logout/` - Logout (blacklist refresh token)
- `POST /api/auth/token/refresh/` - Refresh access token

### Profile Management
- `GET /api/auth/profile/` - Get current user profile
- `PUT /api/auth/profile/` - Update user profile
- `POST /api/auth/change-password/` - Change password
- `DELETE /api/auth/delete-account/` - Delete user account

### Response Format

**Success Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "country": "United States",
    "phone": "+1234567890",
    "date_of_birth": "1990-01-01",
    "gender": "male"
  },
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": {
    "field": ["Validation error"]
  }
}
```

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

- **Access Token**: Valid for 15 minutes
- **Refresh Token**: Valid for 7 days
- **Token Rotation**: Enabled for enhanced security
- **Automatic Refresh**: Frontend automatically refreshes expired tokens

### Token Storage
Tokens are stored in localStorage:
- `access_token` - Short-lived access token
- `refresh_token` - Long-lived refresh token
- `user` - Cached user data

## 🎨 Frontend Features

### Auto-Refresh Tokens
The API client automatically detects expired tokens and refreshes them transparently.

### Form Validation
All forms include client-side validation with real-time feedback.

### Responsive Design
Modern, clean UI that works on all screen sizes.

### Error Handling
Comprehensive error handling with user-friendly messages.

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### API Testing with pytest
```bash
cd backend
pytest
```

All API endpoints are covered with 29+ tests including:
- User registration and validation
- Login/logout flows
- Profile CRUD operations
- Password changes
- Token refresh mechanisms

## 🚀 Development Workflow

1. **Start Backend Server**
   ```bash
   cd backend
   .\venv\Scripts\activate
   python manage.py runserver 8000
   ```

2. **Start Frontend Server** (in a new terminal)
   ```bash
   cd frontend
   npm start
   ```

3. **Access Application**
   - Frontend: http://localhost:5174
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

## 📝 Database Schema

### User Model
- `id` - Primary key
- `email` - Unique email (login field)
- `username` - Username (required by Django)
- `password` - Hashed password
- `full_name` - User's full name
- `country` - Country of residence
- `country_code` - Phone country code (+1, +44, etc.)
- `phone` - Phone number
- `date_of_birth` - Date of birth
- `gender` - Gender (male, female, other, prefer_not_to_say)
- `is_active` - Account status
- `is_staff` - Staff status
- `date_joined` - Registration date
- `last_login` - Last login timestamp

## 🔒 Security Features

- Password hashing with Django's PBKDF2
- JWT token-based authentication
- CORS protection with configurable origins
- CSRF protection for state-changing operations
- SQL injection prevention via ORM
- XSS protection with Django templates
- Token blacklisting on logout
- Automatic token refresh

## 🛠️ Configuration

### Backend Configuration (settings.py)
- `SECRET_KEY` - Django secret key
- `DEBUG` - Debug mode (disable in production)
- `ALLOWED_HOSTS` - Allowed hostnames
- `CORS_ALLOWED_ORIGINS` - Allowed CORS origins
- `SIMPLE_JWT` - JWT token settings

### Frontend Configuration (api.js)
- `BASE_URL` - Backend API URL
- `TIMEOUT` - API request timeout
- `ENDPOINTS` - API endpoint paths

## 📚 API Documentation

Detailed API documentation can be found in:
- `backend/API_DOCUMENTATION.md` - Complete API reference
- `backend/TESTING.md` - Testing guide

## 🐛 Troubleshooting

### CORS Errors
Ensure the frontend URL is in `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py`.

### Token Expired
The frontend automatically refreshes tokens. If you see "Session expired", login again.

### Database Errors
Run migrations: `python manage.py migrate`

### Port Conflicts
- Backend: Change port with `python manage.py runserver 8001`
- Frontend: Vite will automatically use next available port

## 📄 License

This project is part of a case study for Jahan.ai.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ using Django and Webix-jet**
