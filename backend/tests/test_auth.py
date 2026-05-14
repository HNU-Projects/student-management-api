"""
Tests for authentication endpoints — registration, login, token validation.
"""

import pytest
from fastapi import status


class TestRegistration:
    """POST /auth/register"""

    def test_register_success(self, client):
        resp = client.post(
            "/auth/register",
            json={
                "email": "new@example.com",
                "password": "securepass",
                "full_name": "New User",
                "role": "student",
            },
        )
        assert resp.status_code == status.HTTP_201_CREATED
        data = resp.json()
        assert data["email"] == "new@example.com"
        assert data["full_name"] == "New User"
        # Public registration always forces role = student
        assert data["role"] == "student"
        assert "id" in data

    def test_register_duplicate_email(self, client):
        payload = {
            "email": "dup@example.com",
            "password": "pass",
            "full_name": "First",
            "role": "student",
        }
        client.post("/auth/register", json=payload)
        resp = client.post("/auth/register", json=payload)
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert "already registered" in resp.json()["detail"].lower()

    def test_register_missing_fields(self, client):
        resp = client.post("/auth/register", json={"email": "x@y.com"})
        assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_invalid_email(self, client):
        resp = client.post(
            "/auth/register",
            json={
                "email": "not-an-email",
                "password": "pass",
                "full_name": "Bad",
                "role": "student",
            },
        )
        assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_forces_student_role(self, client):
        """Even if the caller sends role=admin, the endpoint should force student."""
        resp = client.post(
            "/auth/register",
            json={
                "email": "sneaky@example.com",
                "password": "pass",
                "full_name": "Sneaky",
                "role": "admin",
            },
        )
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.json()["role"] == "student"


class TestLogin:
    """POST /auth/login"""

    def test_login_success(self, client):
        client.post(
            "/auth/register",
            json={
                "email": "login@test.com",
                "password": "mypassword",
                "full_name": "Login User",
                "role": "student",
            },
        )
        resp = client.post(
            "/auth/login",
            json={"email": "login@test.com", "password": "mypassword"},
        )
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client):
        client.post(
            "/auth/register",
            json={
                "email": "wrong@test.com",
                "password": "correct",
                "full_name": "User",
                "role": "student",
            },
        )
        resp = client.post(
            "/auth/login",
            json={"email": "wrong@test.com", "password": "incorrect"},
        )
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user(self, client):
        resp = client.post(
            "/auth/login",
            json={"email": "ghost@test.com", "password": "pass"},
        )
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


class TestTokenValidation:
    """Verify that protected endpoints reject bad / missing tokens."""

    def test_no_token_returns_401(self, client):
        resp = client.get("/users/me")
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_invalid_token_returns_401(self, client):
        resp = client.get(
            "/users/me",
            headers={"Authorization": "Bearer totally.invalid.token"},
        )
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_valid_token_returns_user(self, client):
        from tests.conftest import _register_and_login

        token, _ = _register_and_login(client, "valid@test.com", "pass123")
        resp = client.get(
            "/users/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["email"] == "valid@test.com"
