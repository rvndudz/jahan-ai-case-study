from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Token refresh
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile endpoints
    path('profile/', views.profile_view, name='profile'),
    path('change-password/', views.change_password_view, name='change_password'),
    path('delete-account/', views.delete_account_view, name='delete_account'),
]
