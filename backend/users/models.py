from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    This model stores user authentication and profile information.
    Uses email as the primary authentication field instead of username.
    """
    
    # Use first_name and last_name from AbstractUser but make them non-blank
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    
    # Email as the primary login field
    email = models.EmailField(
        unique=True,
        error_messages={
            'unique': 'This email address is already registered. Please use a different email address.'
        }
    )
    
    # Make username non-unique and optional, auto-generate from email
    username = models.CharField(max_length=150, blank=True, null=True)
    
    # Use email as the username field for authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Remove username from required fields
    
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
        ('prefer-not-to-say', 'Prefer not to say'),
    ]
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)

    # --- Settings Fields ---

    # Theme Settings
    THEME_MODE_CHOICES = [
        ('system', 'System'),
        ('light', 'Light'),
        ('dark', 'Dark'),
    ]
    theme_mode = models.CharField(max_length=10, choices=THEME_MODE_CHOICES, default='system')
    
    ACCENT_COLOR_CHOICES = [
        ('blue', 'Blue'),
        ('emerald', 'Emerald'),
        ('amber', 'Amber'),
        ('indigo', 'Indigo'),
    ]
    accent_color = models.CharField(max_length=20, choices=ACCENT_COLOR_CHOICES, default='blue')
    
    FONT_FAMILY_CHOICES = [
        ('inter', 'Inter'),
        ('manrope', 'Manrope'),
        ('roboto', 'Roboto'),
        ('workSans', 'Work Sans'),
    ]
    font_family = models.CharField(max_length=20, choices=FONT_FAMILY_CHOICES, default='inter')
    
    FONT_SIZE_CHOICES = [
        ('small', 'Small'),
        ('medium', 'Medium'),
        ('large', 'Large'),
    ]
    font_size = models.CharField(max_length=10, choices=FONT_SIZE_CHOICES, default='medium')
    
    # Layout preferences
    compact_mode = models.BooleanField(default=False)
    show_tooltips = models.BooleanField(default=True)
    animations = models.BooleanField(default=True)
    
    # Notification Settings
    email_alerts = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    sms_alerts = models.BooleanField(default=False)
    
    DIGEST_FREQUENCY_CHOICES = [
        ('instant', 'Instant'),
        ('hourly', 'Hourly'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
    ]
    digest_frequency = models.CharField(max_length=20, choices=DIGEST_FREQUENCY_CHOICES, default='daily')
    
    security_alerts = models.BooleanField(default=True)
    mentions = models.BooleanField(default=True)
    weekly_summary = models.BooleanField(default=True)
    product_updates = models.BooleanField(default=False)
    
    dnd_enabled = models.BooleanField(default=False)
    dnd_start_time = models.CharField(max_length=5, default='21:00') # HH:MM
    dnd_end_time = models.CharField(max_length=5, default='07:00')   # HH:MM

    # Privacy Settings
    profile_searchable = models.BooleanField(default=False)
    messages_from_anyone = models.BooleanField(default=False)
    show_online_status = models.BooleanField(default=True)
    
    two_factor_enabled = models.BooleanField(default=True)
    login_alerts = models.BooleanField(default=True)
    
    analytics_enabled = models.BooleanField(default=True)
    personalized_ads = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.email