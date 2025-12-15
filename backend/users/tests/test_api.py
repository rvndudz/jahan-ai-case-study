import pytest
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestUserRegistration:
    """Tests for user registration endpoint"""
    
    def test_register_user_success(self, api_client, test_user_data):
        """Test successful user registration"""
        url = reverse('register')
        response = api_client.post(url, test_user_data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'user' in response.data
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['user']['email'] == test_user_data['email']
        assert response.data['user']['full_name'] == test_user_data['full_name']
        
        # Verify user was created in database
        assert User.objects.filter(email=test_user_data['email']).exists()
    
    def test_register_user_missing_email(self, api_client, test_user_data):
        """Test registration fails without email"""
        test_user_data.pop('email')
        url = reverse('register')
        response = api_client.post(url, test_user_data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_register_user_invalid_email(self, api_client, test_user_data):
        """Test registration fails with invalid email"""
        test_user_data['email'] = 'invalid-email'
        url = reverse('register')
        response = api_client.post(url, test_user_data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_register_user_password_mismatch(self, api_client, test_user_data):
        """Test registration fails when passwords don't match"""
        test_user_data['password2'] = 'DifferentPassword123!'
        url = reverse('register')
        response = api_client.post(url, test_user_data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_register_duplicate_email(self, api_client, test_user_data, create_user):
        """Test registration fails with duplicate email"""
        # Create user with same email first
        create_user(email=test_user_data['email'])
        
        url = reverse('register')
        response = api_client.post(url, test_user_data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserLogin:
    """Tests for user login endpoint"""
    
    def test_login_success(self, api_client, create_user):
        """Test successful login"""
        user = create_user(email='login@example.com', password='TestPass123!')
        
        url = reverse('login')
        response = api_client.post(url, {
            'email': 'login@example.com',
            'password': 'TestPass123!'
        }, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'user' in response.data
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['user']['email'] == 'login@example.com'
    
    def test_login_wrong_password(self, api_client, create_user):
        """Test login fails with wrong password"""
        user = create_user(email='login@example.com', password='TestPass123!')
        
        url = reverse('login')
        response = api_client.post(url, {
            'email': 'login@example.com',
            'password': 'WrongPassword123!'
        }, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_login_nonexistent_user(self, api_client):
        """Test login fails with non-existent user"""
        url = reverse('login')
        response = api_client.post(url, {
            'email': 'nonexistent@example.com',
            'password': 'TestPass123!'
        }, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_login_missing_credentials(self, api_client):
        """Test login fails without credentials"""
        url = reverse('login')
        response = api_client.post(url, {}, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserProfile:
    """Tests for user profile endpoints"""
    
    def test_get_profile_authenticated(self, authenticated_client):
        """Test getting user profile when authenticated"""
        client, user = authenticated_client
        
        url = reverse('profile')
        response = client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'user' in response.data
        assert response.data['user']['email'] == user.email
        assert response.data['user']['full_name'] == user.full_name
    
    def test_get_profile_unauthenticated(self, api_client):
        """Test getting profile fails when not authenticated"""
        url = reverse('profile')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_update_profile_success(self, authenticated_client):
        """Test updating user profile"""
        client, user = authenticated_client
        
        url = reverse('profile')
        updated_data = {
            'full_name': 'Updated Name',
            'country': 'USA',
            'phone': '+1234567890'
        }
        response = client.put(url, updated_data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['user']['full_name'] == 'Updated Name'
        assert response.data['user']['country'] == 'USA'
        
        # Verify database was updated
        user.refresh_from_db()
        assert user.full_name == 'Updated Name'
        assert user.country == 'USA'
    
    def test_update_profile_partial(self, authenticated_client):
        """Test partial profile update"""
        client, user = authenticated_client
        
        url = reverse('profile')
        response = client.put(url, {'full_name': 'New Name'}, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['user']['full_name'] == 'New Name'


@pytest.mark.django_db
class TestPasswordChange:
    """Tests for password change endpoint"""
    
    def test_change_password_success(self, authenticated_client):
        """Test successful password change"""
        client, user = authenticated_client
        
        url = reverse('change_password')
        response = client.post(url, {
            'old_password': 'TestPass123!',
            'new_password': 'NewPassword456!',
            'new_password2': 'NewPassword456!'
        }, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        
        # Verify password was changed
        user.refresh_from_db()
        assert user.check_password('NewPassword456!')
    
    def test_change_password_wrong_old_password(self, authenticated_client):
        """Test password change fails with wrong old password"""
        client, user = authenticated_client
        
        url = reverse('change_password')
        response = client.post(url, {
            'old_password': 'WrongPassword123!',
            'new_password': 'NewPassword456!',
            'new_password2': 'NewPassword456!'
        }, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_change_password_mismatch(self, authenticated_client):
        """Test password change fails when new passwords don't match"""
        client, user = authenticated_client
        
        url = reverse('change_password')
        response = client.post(url, {
            'old_password': 'TestPass123!',
            'new_password': 'NewPassword456!',
            'new_password2': 'DifferentPassword789!'
        }, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestAccountDeletion:
    """Tests for account deletion endpoint"""
    
    def test_delete_account_success(self, authenticated_client):
        """Test successful account deletion"""
        client, user = authenticated_client
        user_id = user.id
        
        url = reverse('delete_account')
        response = client.delete(url, {'password': 'TestPass123!'}, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        
        # Verify user was deleted
        assert not User.objects.filter(id=user_id).exists()
    
    def test_delete_account_wrong_password(self, authenticated_client):
        """Test account deletion fails with wrong password"""
        client, user = authenticated_client
        
        url = reverse('delete_account')
        response = client.delete(url, {'password': 'WrongPassword123!'}, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
        # Verify user still exists
        assert User.objects.filter(id=user.id).exists()
    
    def test_delete_account_missing_password(self, authenticated_client):
        """Test account deletion fails without password"""
        client, user = authenticated_client
        
        url = reverse('delete_account')
        response = client.delete(url, {}, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
