import pytest
from django.contrib.auth import get_user_model
from users.serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer
)

User = get_user_model()


@pytest.mark.django_db
class TestUserSerializer:
    """Tests for UserSerializer"""
    
    def test_user_serializer(self, create_user):
        """Test user serialization"""
        user = create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            country='USA',
            phone='+1234567890'
        )
        
        serializer = UserSerializer(user)
        data = serializer.data
        
        assert data['email'] == 'test@example.com'
        assert data['first_name'] == 'Test'
        assert data['last_name'] == 'User'
        assert data['country'] == 'USA'
        assert data['phone'] == '+1234567890'
        assert 'password' not in data  # Password should not be serialized


@pytest.mark.django_db
class TestUserRegistrationSerializer:
    """Tests for UserRegistrationSerializer"""
    
    def test_registration_serializer_valid(self):
        """Test registration serializer with valid data"""
        data = {
            'email': 'newuser@example.com',
            'password': 'TestPass123!',
            'password2': 'TestPass123!'
        }
        
        serializer = UserRegistrationSerializer(data=data)
        assert serializer.is_valid()
        
        user = serializer.save()
        assert user.email == 'newuser@example.com'
        assert user.check_password('TestPass123!')
    
    def test_registration_serializer_password_mismatch(self):
        """Test registration serializer with password mismatch"""
        data = {
            'email': 'newuser@example.com',
            'password': 'TestPass123!',
            'password2': 'DifferentPass123!'
        }
        
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert 'password' in serializer.errors
    
    def test_registration_serializer_duplicate_email(self, create_user):
        """Test registration serializer with duplicate email"""
        # Create an existing user
        create_user(email='existing@example.com')
        
        # Try to register with the same email
        data = {
            'email': 'existing@example.com',
            'password': 'TestPass123!',
            'password2': 'TestPass123!'
        }
        
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert 'email' in serializer.errors
        error_message = str(serializer.errors['email'][0]).lower()
        assert 'already registered' in error_message or 'already taken' in error_message


@pytest.mark.django_db
class TestUserProfileUpdateSerializer:
    """Tests for UserProfileUpdateSerializer"""
    
    def test_profile_update_serializer(self, create_user):
        """Test profile update serializer"""
        user = create_user()
        
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'country': 'Canada',
            'phone': '+1987654321'
        }
        
        serializer = UserProfileUpdateSerializer(user, data=data, partial=True)
        assert serializer.is_valid()
        
        updated_user = serializer.save()
        assert updated_user.first_name == 'Updated'
        assert updated_user.last_name == 'Name'
        assert updated_user.country == 'Canada'
    
    def test_profile_update_same_email(self, create_user):
        """Test profile update with same email (should be valid)"""
        user = create_user(email='user@example.com')
        
        data = {'email': 'user@example.com'}
        serializer = UserProfileUpdateSerializer(user, data=data, partial=True)
        
        assert serializer.is_valid()
        updated_user = serializer.save()
        assert updated_user.email == 'user@example.com'
    
    def test_profile_update_duplicate_email(self, create_user):
        """Test profile update with email that belongs to another user"""
        user1 = create_user(email='user1@example.com')
        user2 = create_user(email='user2@example.com')
        
        # Try to update user1's email to user2's email
        data = {'email': 'user2@example.com'}
        serializer = UserProfileUpdateSerializer(user1, data=data, partial=True)
        
        assert not serializer.is_valid()
        assert 'email' in serializer.errors
        error_message = str(serializer.errors['email'][0]).lower()
        # Check for any of the possible error messages
        assert any(phrase in error_message for phrase in ['already taken', 'another user', 'already registered'])
    
    def test_profile_update_new_unique_email(self, create_user):
        """Test profile update with new unique email (should be valid)"""
        user = create_user(email='old@example.com')
        
        data = {'email': 'new@example.com'}
        serializer = UserProfileUpdateSerializer(user, data=data, partial=True)
        
        assert serializer.is_valid()
        updated_user = serializer.save()
        assert updated_user.email == 'new@example.com'


@pytest.mark.django_db
class TestChangePasswordSerializer:
    """Tests for ChangePasswordSerializer"""
    
    def test_change_password_serializer_valid(self, create_user, api_client):
        """Test change password serializer with valid data"""
        user = create_user(password='OldPass123!')
        
        # Mock request with user
        class MockRequest:
            def __init__(self, user):
                self.user = user
        
        data = {
            'old_password': 'OldPass123!',
            'new_password': 'NewPass456!',
            'new_password2': 'NewPass456!'
        }
        
        serializer = ChangePasswordSerializer(
            data=data,
            context={'request': MockRequest(user)}
        )
        assert serializer.is_valid()
