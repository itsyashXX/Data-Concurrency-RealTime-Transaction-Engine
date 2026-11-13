from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from authentication.models import User
from engine.models import Account

class AuthAndSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.profile_url = reverse('auth_profile')
        self.admin_overview_url = reverse('admin_overview')

        self.user_data = {
            'email': 'customer@test.com',
            'full_name': 'Test Customer',
            'password': 'SecurePassword123!',
            'confirm_password': 'SecurePassword123!'
        }

    def test_customer_registration_and_account_creation(self):
        """Test public registration creates user and initializes an account with default balance."""
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

        user = User.objects.get(email=self.user_data['email'])
        self.assertEqual(user.role, User.Role.USER)
        self.assertFalse(user.is_staff)

        # Verify an account was automatically provisioned
        account = Account.objects.filter(user=user).first()
        self.assertIsNotNone(account)
        self.assertEqual(account.balance, 10000.00)

    def test_login_successful_and_jwt_returned(self):
        """Test login with email and password returns JWT tokens."""
        # Create user
        self.client.post(self.register_url, self.user_data, format='json')

        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_normal_user_cannot_access_admin_api(self):
        """RBAC test: Customer role must be forbidden from accessing admin endpoints."""
        reg_resp = self.client.post(self.register_url, self.user_data, format='json')
        token = reg_resp.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.admin_overview_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_user_can_access_admin_api(self):
        """Admin user should successfully access admin endpoints."""
        admin = User.objects.create_superuser(
            email='admin@test.com',
            password='AdminPassword123!',
            full_name='Admin User'
        )
        login_resp = self.client.post(self.login_url, {
            'email': 'admin@test.com',
            'password': 'AdminPassword123!'
        }, format='json')
        token = login_resp.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.admin_overview_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('metrics', response.data)
        self.assertIn('financial_consistency', response.data)
