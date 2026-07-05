from datetime import timedelta

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import User

BASE_URL = "/api/auth/"


class RegisterTests(TestCase):
    """Tests for the registration endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.url = BASE_URL + "register/"
        self.valid_payload = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "TestPass123!",
            "password_confirm": "TestPass123!",
            "first_name": "New",
            "last_name": "User",
            "role": "student",
        }

    def test_register_success(self):
        """Register a new user successfully returns 201 with tokens."""
        response = self.client.post(self.url, self.valid_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["username"], "newuser")
        self.assertEqual(response.data["user"]["email"], "newuser@example.com")
        self.assertEqual(response.data["user"]["role"], "student")
        # Verify user exists in DB
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_register_password_mismatch(self):
        """Register with mismatched passwords returns 400."""
        payload = {**self.valid_payload, "password_confirm": "DifferentPass123!"}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password_confirm", response.data)

    def test_register_short_password(self):
        """Register with a password shorter than 8 chars returns 400."""
        payload = {**self.valid_payload, "password": "Ab1!", "password_confirm": "Ab1!"}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_username(self):
        """Register with an existing username returns 400."""
        User.objects.create_user(username="newuser", password="SomePass123!")
        response = self.client.post(self.url, self.valid_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_without_required_fields(self):
        """Register without required fields returns 400."""
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)
        self.assertIn("password", response.data)

    def test_register_role_ignored_defaults_to_student(self):
        """Role field is ignored during registration; defaults to student."""
        payload = {
            "username": "instructor1",
            "email": "instructor1@example.com",
            "password": "TestPass123!",
            "password_confirm": "TestPass123!",
            "first_name": "Inst",
            "last_name": "Ructor",
            "role": "instructor",
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Role should default to student since self-assignment is not allowed
        self.assertEqual(response.data["user"]["role"], "student")

    def test_register_default_role_is_student(self):
        """Register without specifying role defaults to student."""
        payload = {**self.valid_payload, "username": "defaultrole"}
        payload.pop("role")
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["user"]["role"], "student")


class LoginTests(TestCase):
    """Tests for the login endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.url = BASE_URL + "login/"
        self.password = "TestPass123!"
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password=self.password,
            first_name="Test",
            last_name="User",
        )

    def test_login_success(self):
        """Login with valid credentials returns 200 with tokens."""
        response = self.client.post(
            self.url,
            {"username": "testuser", "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_by_email(self):
        """Login with email (as username field) works for simple JWT."""
        response = self.client.post(
            self.url,
            {"username": "test@example.com", "password": self.password},
            format="json",
        )
        # Simple JWT uses username field by default, so email login won't work
        # unless custom backend is set up. This documents current behavior.
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_wrong_password(self):
        """Login with wrong password returns 401."""
        response = self.client.post(
            self.url,
            {"username": "testuser", "password": "WrongPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_user(self):
        """Login with nonexistent user returns 401."""
        response = self.client.post(
            self.url,
            {"username": "nobody", "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_inactive_user(self):
        """Login with an inactive user returns 401."""
        self.user.is_active = False
        self.user.save()
        response = self.client.post(
            self.url,
            {"username": "testuser", "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_missing_fields(self):
        """Login without fields returns 400."""
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TokenRefreshTests(TestCase):
    """Tests for token refresh."""

    def setUp(self):
        self.client = APIClient()
        self.url = BASE_URL + "token/refresh/"
        self.user = User.objects.create_user(
            username="testuser", password="TestPass123!"
        )

    def test_refresh_success(self):
        """Refresh with a valid refresh token returns a new access token."""
        refresh = RefreshToken.for_user(self.user)
        response = self.client.post(
            self.url, {"refresh": str(refresh)}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_refresh_invalid_token(self):
        """Refresh with an invalid token returns 401."""
        response = self.client.post(
            self.url, {"refresh": "invalidtoken123"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_expired_token(self):
        """Refresh with an expired token returns 401."""
        refresh = RefreshToken.for_user(self.user)
        # Set the token as expired by setting a negative lifetime
        refresh.set_exp(lifetime=timedelta(seconds=-1))
        response = self.client.post(
            self.url, {"refresh": str(refresh)}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class MeViewTests(TestCase):
    """Tests for the profile (me) endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.url = BASE_URL + "me/"
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="TestPass123!",
            first_name="Test",
            last_name="User",
            bio="Original bio",
        )
        # Authenticate
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_get_profile_success(self):
        """GET me/ returns the authenticated user's profile."""
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "testuser")
        self.assertEqual(response.data["email"], "test@example.com")
        self.assertEqual(response.data["first_name"], "Test")
        self.assertEqual(response.data["last_name"], "User")

    def test_get_profile_unauthenticated(self):
        """GET me/ without auth returns 401."""
        self.client.credentials()  # Remove auth
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile(self):
        """PATCH me/ updates the user's profile fields."""
        response = self.client.patch(
            self.url,
            {"first_name": "Updated", "bio": "New bio content"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "Updated")
        self.assertEqual(response.data["bio"], "New bio content")

    def test_partial_update_profile(self):
        """PATCH me/ with partial data works."""
        response = self.client.patch(self.url, {"last_name": "Changed"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["last_name"], "Changed")
        # Other fields remain unchanged
        self.assertEqual(response.data["first_name"], "Test")

    def test_update_profile_unauthenticated(self):
        """PATCH me/ without auth returns 401."""
        self.client.credentials()
        response = self.client.patch(
            self.url, {"first_name": "Hacker"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cannot_update_readonly_fields(self):
        """PATCH me/ cannot change read-only fields like email_verified, date_joined."""
        response = self.client.patch(
            self.url,
            {"email_verified": True},
            format="json",
        )
        # email_verified is read_only, so the value should remain False
        self.user.refresh_from_db()
        self.assertFalse(self.user.email_verified)

    def test_profile_has_correct_fields(self):
        """GET me/ returns all expected profile fields."""
        response = self.client.get(self.url, format="json")
        expected_fields = {
            "id", "username", "email", "first_name", "last_name",
            "role", "bio", "profile_picture", "phone", "date_of_birth",
            "email_verified", "date_joined",
        }
        self.assertEqual(set(response.data.keys()), expected_fields)


class ChangePasswordTests(TestCase):
    """Tests for the change password endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.url = BASE_URL + "change-password/"
        self.password = "OriginalPass123!"
        self.user = User.objects.create_user(
            username="testuser", password=self.password
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        self.valid_payload = {
            "old_password": self.password,
            "new_password": "NewPass123!",
            "new_password_confirm": "NewPass123!",
        }

    def test_change_password_success(self):
        """POST change-password/ with valid data updates the password."""
        response = self.client.post(self.url, self.valid_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("detail", response.data)
        # Verify new password works
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewPass123!"))

    def test_change_password_wrong_old_password(self):
        """POST change-password/ with wrong old password returns 400."""
        payload = {**self.valid_payload, "old_password": "WrongPass123!"}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("old_password", response.data)

    def test_change_password_mismatch(self):
        """POST change-password/ with mismatched new passwords returns 400."""
        payload = {**self.valid_payload, "new_password_confirm": "DifferentPass123!"}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password_confirm", response.data)

    def test_change_password_short_new_password(self):
        """POST change-password/ with short new password returns 400."""
        payload = {**self.valid_payload, "new_password": "Ab1!", "new_password_confirm": "Ab1!"}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_unauthenticated(self):
        """POST change-password/ without auth returns 401."""
        self.client.credentials()
        response = self.client.post(self.url, self.valid_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class LogoutTests(TestCase):
    """Tests for the logout endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.url = BASE_URL + "logout/"
        self.user = User.objects.create_user(
            username="testuser", password="TestPass123!"
        )
        self.refresh = RefreshToken.for_user(self.user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.refresh.access_token}"
        )

    def test_logout_success(self):
        """POST logout/ with a valid refresh token blacklists it."""
        response = self.client.post(
            self.url, {"refresh": str(self.refresh)}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("detail", response.data)

    def test_logout_without_token(self):
        """POST logout/ without a refresh token still succeeds."""
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_invalid_token(self):
        """POST logout/ with an invalid refresh token returns 400."""
        response = self.client.post(
            self.url, {"refresh": "invalidtoken"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_unauthenticated(self):
        """POST logout/ without auth returns 401."""
        self.client.credentials()
        response = self.client.post(self.url, {"refresh": str(self.refresh)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_token_cannot_be_reused(self):
        """After logout, the refresh token cannot be used to get new access tokens."""
        # Logout
        self.client.post(self.url, {"refresh": str(self.refresh)}, format="json")
        # Try to refresh
        response = self.client.post(
            BASE_URL + "token/refresh/", {"refresh": str(self.refresh)}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AuthenticationIntegrationTests(TestCase):
    """Integration tests covering full auth flows end-to-end."""

    def setUp(self):
        self.client = APIClient()

    def test_full_auth_flow(self):
        """Complete flow: register -> login -> access profile -> change password -> logout."""
        # 1. Register
        register_payload = {
            "username": "johndoe",
            "email": "john@example.com",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
            "first_name": "John",
            "last_name": "Doe",
            "role": "student",
        }
        reg_resp = self.client.post(
            BASE_URL + "register/", register_payload, format="json"
        )
        self.assertEqual(reg_resp.status_code, status.HTTP_201_CREATED)
        access_token = reg_resp.data["access"]
        refresh_token = reg_resp.data["refresh"]

        # 2. Access profile with token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        me_resp = self.client.get(BASE_URL + "me/", format="json")
        self.assertEqual(me_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(me_resp.data["username"], "johndoe")
        self.assertEqual(me_resp.data["email"], "john@example.com")

        # 3. Refresh the token
        refresh_resp = self.client.post(
            BASE_URL + "token/refresh/",
            {"refresh": refresh_token},
            format="json",
        )
        self.assertEqual(refresh_resp.status_code, status.HTTP_200_OK)
        new_access_token = refresh_resp.data["access"]
        self.assertIsNotNone(new_access_token)

        # 4. Use new token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {new_access_token}")
        me_resp2 = self.client.get(BASE_URL + "me/", format="json")
        self.assertEqual(me_resp2.status_code, status.HTTP_200_OK)

        # 5. Change password
        change_pw_resp = self.client.post(
            BASE_URL + "change-password/",
            {
                "old_password": "StrongPass123!",
                "new_password": "NewStrong456!",
                "new_password_confirm": "NewStrong456!",
            },
            format="json",
        )
        self.assertEqual(change_pw_resp.status_code, status.HTTP_200_OK)

        # 6. Verify old password no longer works for login
        login_resp = self.client.post(
            BASE_URL + "login/",
            {"username": "johndoe", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(login_resp.status_code, status.HTTP_401_UNAUTHORIZED)

        # 7. Login with new password
        login_resp2 = self.client.post(
            BASE_URL + "login/",
            {"username": "johndoe", "password": "NewStrong456!"},
            format="json",
        )
        self.assertEqual(login_resp2.status_code, status.HTTP_200_OK)

        # 8. Logout
        new_refresh = login_resp2.data["refresh"]
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_resp2.data['access']}"
        )
        logout_resp = self.client.post(
            BASE_URL + "logout/",
            {"refresh": new_refresh},
            format="json",
        )
        self.assertEqual(logout_resp.status_code, status.HTTP_200_OK)


class PermissionTests(TestCase):
    """Tests for endpoint access control."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser", password="TestPass123!"
        )
        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)

    def test_unauthenticated_cannot_access_me(self):
        """Unauthenticated users cannot access the me endpoint."""
        response = self.client.get(BASE_URL + "me/", format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_cannot_change_password(self):
        """Unauthenticated users cannot change password."""
        response = self.client.post(BASE_URL + "change-password/", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_cannot_logout(self):
        """Unauthenticated users cannot logout."""
        response = self.client.post(BASE_URL + "logout/", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_can_register(self):
        """Unauthenticated users can register (AllowAny)."""
        payload = {
            "username": "newuser",
            "email": "new@example.com",
            "password": "TestPass123!",
            "password_confirm": "TestPass123!",
        }
        response = self.client.post(BASE_URL + "register/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_unauthenticated_can_login(self):
        """Unauthenticated users can login (AllowAny)."""
        User.objects.create_user(username="someone", password="SomePass123!")
        response = self.client.post(
            BASE_URL + "login/",
            {"username": "someone", "password": "SomePass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_authenticated_user_cannot_access_other_users_profile(self):
        """The me endpoint only returns the authenticated user's data."""
        User.objects.create_user(
            username="otheruser", password="OtherPass123!"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get(BASE_URL + "me/", format="json")
        self.assertEqual(response.data["username"], "testuser")
        self.assertNotEqual(response.data["username"], "otheruser")
