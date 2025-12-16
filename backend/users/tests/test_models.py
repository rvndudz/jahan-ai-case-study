import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    """Tests for User model"""
    
    def test_create_user(self):
        """Test creating a regular user"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!',
            first_name='Test',
            last_name='User'
        )
        
        assert user.email == 'test@example.com'
        assert user.first_name == 'Test'
        assert user.last_name == 'User'
        assert user.is_active
        assert not user.is_staff
        assert not user.is_superuser
        assert user.check_password('TestPass123!')
    
    def test_create_superuser(self):
        """Test creating a superuser"""
        user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='AdminPass123!'
        )
        
        assert user.email == 'admin@example.com'
        assert user.is_active
        assert user.is_staff
        assert user.is_superuser
    
    def test_user_str_method(self, create_user):
        """Test user string representation"""
        user = create_user(email='test@example.com')
        assert str(user) == 'test@example.com'
    
    def test_email_unique(self, create_user):
        """Test that email must be unique"""
        create_user(email='unique@example.com')
        
        with pytest.raises(Exception):  # IntegrityError
            create_user(email='unique@example.com')
    
    def test_user_optional_fields(self, create_user):
        """Test user with optional fields"""
        user = create_user(
            country='USA',
            country_code='+1',
            phone='1234567890',
            date_of_birth='1990-01-01',
            gender='male'
        )
        
        assert user.country == 'USA'
        assert user.country_code == '+1'
        assert user.phone == '1234567890'
        assert user.gender == 'male'
