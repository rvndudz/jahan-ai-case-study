"""
Quick demo script to show the improved error messages
Run this to see the user-friendly validation messages
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.serializers import UserRegistrationSerializer, UserProfileUpdateSerializer, ChangePasswordSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 80)
print("IMPROVED ERROR MESSAGES DEMO")
print("=" * 80)

# Clear any existing test users
User.objects.filter(email__in=['test@example.com', 'existing@example.com']).delete()

# Create a test user
user = User.objects.create_user(
    username='testuser',
    email='existing@example.com',
    password='TestPass123!'
)
print("\n✓ Created test user with email: existing@example.com")

print("\n" + "=" * 80)
print("1. DUPLICATE EMAIL DURING REGISTRATION")
print("=" * 80)
data = {
    'email': 'existing@example.com',
    'password': 'NewPass123!',
    'password2': 'NewPass123!'
}
serializer = UserRegistrationSerializer(data=data)
if not serializer.is_valid():
    print(f"\n❌ Error: {serializer.errors['email'][0]}")

print("\n" + "=" * 80)
print("2. PASSWORD MISMATCH DURING REGISTRATION")
print("=" * 80)
data = {
    'email': 'newuser@example.com',
    'password': 'TestPass123!',
    'password2': 'DifferentPass123!'
}
serializer = UserRegistrationSerializer(data=data)
if not serializer.is_valid():
    print(f"\n❌ Error: {serializer.errors['password'][0]}")

print("\n" + "=" * 80)
print("3. INVALID PHONE NUMBER FORMAT")
print("=" * 80)
data = {'phone': 'abc-123-xyz'}
serializer = UserProfileUpdateSerializer(user, data=data, partial=True)
if not serializer.is_valid():
    print(f"\n❌ Error: {serializer.errors['phone'][0]}")

print("\n" + "=" * 80)
print("4. WRONG CURRENT PASSWORD")
print("=" * 80)

class MockRequest:
    def __init__(self, user):
        self.user = user

data = {
    'old_password': 'WrongPassword123!',
    'new_password': 'NewPass456!',
    'new_password2': 'NewPass456!'
}
serializer = ChangePasswordSerializer(data=data, context={'request': MockRequest(user)})
if not serializer.is_valid():
    print(f"\n❌ Error: {serializer.errors['old_password'][0]}")

print("\n" + "=" * 80)
print("5. NEW PASSWORDS DON'T MATCH")
print("=" * 80)
data = {
    'old_password': 'TestPass123!',
    'new_password': 'NewPass456!',
    'new_password2': 'DifferentPass789!'
}
serializer = ChangePasswordSerializer(data=data, context={'request': MockRequest(user)})
if not serializer.is_valid():
    print(f"\n❌ Error: {serializer.errors['new_password'][0]}")

print("\n" + "=" * 80)
print("Demo complete! All error messages are now clear and educational.")
print("=" * 80)

# Cleanup
user.delete()
