from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    This model stores user authentication and profile information.
    """
    
    # Remove first_name and last_name from AbstractUser
    first_name = None
    last_name = None
    
    # Custom fields matching your frontend expectations
    full_name = models.CharField(max_length=255, blank=True)
    
    # Email as the primary login field
    email = models.EmailField(unique=True)
    
    # Contact information
    country = models.CharField(max_length=100, blank=True)
    country_code = models.CharField(max_length=10, blank=True)  # e.g., +1, +44, +94
    phone = models.CharField(max_length=20, blank=True)
    
    # Personal information
    date_of_birth = models.DateField(null=True, blank=True)
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not_to_say', 'Prefer not to say'),
    ]
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)
    
    # Use email instead of username for authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # username is still required by Django but not used for login
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.email