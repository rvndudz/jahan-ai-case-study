import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


@pytest.fixture
def api_client():
    """Fixture to provide API client"""
    return APIClient()


@pytest.fixture
def test_user_data():
    """Fixture to provide test user data"""
    return {
        'email': 'test@example.com',
        'username': 'testuser',
        'password': 'TestPass123!',
        'password2': 'TestPass123!'
    }


@pytest.fixture
def create_user(db):
    """Fixture to create a test user"""
    def make_user(**kwargs):
        user_data = {
            'email': 'user@example.com',
            'username': 'testuser',
            'password': 'TestPass123!',
            'first_name': 'Test',
            'last_name': 'User'
        }
        user_data.update(kwargs)
        password = user_data.pop('password')
        user = User.objects.create_user(**user_data)
        user.set_password(password)
        user.save()
        return user
    return make_user


@pytest.fixture
def authenticated_client(api_client, create_user):
    """Fixture to provide authenticated API client"""
    user = create_user()
    api_client.force_authenticate(user=user)
    return api_client, user
