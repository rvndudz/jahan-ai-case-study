from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model - converts between User objects and JSON"""
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'country', 'country_code', 
            'phone', 'date_of_birth', 'gender', 'date_joined',
            # Settings
            'theme_mode', 'accent_color', 'font_family', 'font_size', 'compact_mode', 'show_tooltips', 'animations',
            'email_alerts', 'push_notifications', 'sms_alerts', 'digest_frequency',
            'security_alerts', 'mentions', 'weekly_summary', 'product_updates',
            'dnd_enabled', 'dnd_start_time', 'dnd_end_time',
            'profile_searchable', 'messages_from_anyone', 'show_online_status',
            'two_factor_enabled', 'login_alerts',
            'analytics_enabled', 'personalized_ads'
        ]
        read_only_fields = ['id', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm Password")
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password2', 'first_name', 'last_name']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }
    
    def validate_email(self, value):
        """Validate that email is unique in the database"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "This email address is already registered. Please use a different email address."
            )
        return value
    
    def validate(self, attrs):
        """Validate that passwords match"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "The passwords you entered do not match. Please make sure both password fields are identical."
            })
        return attrs
    
    def create(self, validated_data):
        """Create and return a new user"""
        validated_data.pop('password2')  # Remove password2 as it's not needed
        
        # Auto-generate unique username from email (required by Django internally)
        email = validated_data['email']
        base_username = email.split('@')[0]
        username = base_username
        
        # Handle duplicate usernames by appending a number
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'country', 'country_code', 'phone', 'date_of_birth', 'gender',
            # Settings
            'theme_mode', 'accent_color', 'font_family', 'font_size', 'compact_mode', 'show_tooltips', 'animations',
            'email_alerts', 'push_notifications', 'sms_alerts', 'digest_frequency',
            'security_alerts', 'mentions', 'weekly_summary', 'product_updates',
            'dnd_enabled', 'dnd_start_time', 'dnd_end_time',
            'profile_searchable', 'messages_from_anyone', 'show_online_status',
            'two_factor_enabled', 'login_alerts',
            'analytics_enabled', 'personalized_ads'
        ]
    
    def validate_email(self, value):
        """Validate that email is unique (excluding current user)"""
        user = self.instance
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError(
                "This email address is already taken by another profile. Please choose a different email address."
            )
        return value
    
    def validate_phone(self, value):
        """Validate phone number format"""
        if value and not value.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            raise serializers.ValidationError(
                "Invalid phone number format. Please enter a valid phone number using only digits, spaces, hyphens, and plus sign. Example: +1-555-123-4567"
            )
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True, write_only=True, label="Confirm New Password")
    
    def validate(self, attrs):
        """Validate that new passwords match"""
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({
                "new_password": "Your new passwords do not match. Please ensure both new password fields contain the exact same password."
            })
        return attrs
    
    def validate_old_password(self, value):
        """Validate that old password is correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(
                "The current password you entered is incorrect. Please enter your correct current password to continue."
            )
        return value
    
    def save(self, **kwargs):
        """Update user password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
