"""
Tests for user management endpoints (admin-only operations).
"""

import pytest
from fastapi import status

from tests.conftest import _make_admin, _register_and_login


class TestAdminListUsers:

    def test_admin_can_list_users(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        resp = client.get(
            "/users/",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert isinstance(resp.json(), list)

    def test_student_cannot_list_users(self, client, db_session):
        _make_admin(client, db_session)
        stu_token, _ = _register_and_login(client, "nolist@t.com", "pass")
        resp = client.get(
            "/users/",
            headers={"Authorization": f"Bearer {stu_token}"},
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN


class TestAdminCreateUser:

    def test_admin_creates_user(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        resp = client.post(
            "/users/",
            json={
                "email": "new_user@test.com",
                "password": "password123",
                "full_name": "New User",
                "role": "student",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.json()["email"] == "new_user@test.com"

    def test_admin_creates_admin_user(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        resp = client.post(
            "/users/",
            json={
                "email": "admin2@test.com",
                "password": "password123",
                "full_name": "Admin 2",
                "role": "admin",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.json()["role"] == "admin"

    def test_duplicate_email_rejected(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        payload = {
            "email": "dup@test.com",
            "password": "pass",
            "full_name": "Dup",
            "role": "student",
        }
        client.post("/users/", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
        resp = client.post("/users/", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_student_cannot_create_user(self, client, db_session):
        _make_admin(client, db_session)
        stu_token, _ = _register_and_login(client, "nocreat@t.com", "pass")
        resp = client.post(
            "/users/",
            json={
                "email": "hacked@t.com",
                "password": "pass",
                "full_name": "Hacked",
                "role": "student",
            },
            headers={"Authorization": f"Bearer {stu_token}"},
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN


class TestAdminDeleteUser:

    def test_admin_deletes_user(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        # Create a user to delete
        resp = client.post(
            "/users/",
            json={
                "email": "delete_me@test.com",
                "password": "pass",
                "full_name": "Delete Me",
                "role": "student",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        user_id = resp.json()["id"]

        del_resp = client.delete(
            f"/users/{user_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert del_resp.status_code == status.HTTP_204_NO_CONTENT

        # Verify the user is gone
        users_resp = client.get("/users/", headers={"Authorization": f"Bearer {admin_token}"})
        user_ids = [u["id"] for u in users_resp.json()]
        assert user_id not in user_ids

    def test_admin_cannot_delete_self(self, client, db_session):
        admin_token, admin_id = _make_admin(client, db_session)
        resp = client.delete(
            f"/users/{admin_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert "cannot delete your own account" in resp.json()["detail"]

    def test_delete_nonexistent_user(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        resp = client.delete(
            "/users/9999",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_404_NOT_FOUND


class TestUserProfile:

    def test_get_own_profile(self, client, db_session):
        _make_admin(client, db_session)
        stu_token, _ = _register_and_login(client, "me@t.com", "pass")
        resp = client.get(
            "/users/me",
            headers={"Authorization": f"Bearer {stu_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["email"] == "me@t.com"

    def test_update_email(self, client, db_session):
        _make_admin(client, db_session)
        stu_token, _ = _register_and_login(client, "old@t.com", "pass")
        resp = client.put(
            "/users/me/email",
            json={"new_email": "new@t.com"},
            headers={"Authorization": f"Bearer {stu_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["email"] == "new@t.com"

    def test_update_password(self, client, db_session):
        _make_admin(client, db_session)
        stu_token, _ = _register_and_login(client, "pwd@t.com", "oldpass")
        resp = client.put(
            "/users/me/password",
            json={"current_password": "oldpass", "new_password": "newpass"},
            headers={"Authorization": f"Bearer {stu_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert "updated" in resp.json()["detail"].lower()

    def test_update_password_wrong_current(self, client, db_session):
        _make_admin(client, db_session)
        stu_token, _ = _register_and_login(client, "wp@t.com", "correct")
        resp = client.put(
            "/users/me/password",
            json={"current_password": "wrong", "new_password": "newpass"},
            headers={"Authorization": f"Bearer {stu_token}"},
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
