"""
Tests for Student CRUD operations, filtering, permissions, and edge cases.
"""

from datetime import date

import pytest
from fastapi import status

from tests.conftest import _make_admin, _register_and_login


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _create_student(client, admin_token, user_id, university_id="STU-001", name="Test Student", department="CS", gpa=3.5):
    """Create a student record via the API and return the response JSON."""
    resp = client.post(
        "/students/",
        json={
            "university_id": university_id,
            "name": name,
            "department": department,
            "gpa": gpa,
            "enrollment_date": date.today().isoformat(),
            "user_id": user_id,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    return resp


# ---------------------------------------------------------------------------
# CRUD — Create
# ---------------------------------------------------------------------------

class TestCreateStudent:

    def test_admin_creates_student(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        stu_token, stu_user_id = _register_and_login(client, "s@t.com", "pass")

        resp = _create_student(client, admin_token, stu_user_id)
        assert resp.status_code == status.HTTP_201_CREATED
        data = resp.json()
        assert data["university_id"] == "STU-001"
        assert data["user_id"] == stu_user_id

    def test_student_creates_own_record(self, client, db_session):
        _make_admin(client, db_session)
        stu_token, stu_user_id = _register_and_login(client, "self@t.com", "pass")

        resp = client.post(
            "/students/",
            json={
                "university_id": "SELF-001",
                "name": "Self Student",
                "department": "Math",
                "gpa": 3.0,
                "enrollment_date": date.today().isoformat(),
                "user_id": stu_user_id,
            },
            headers={"Authorization": f"Bearer {stu_token}"},
        )
        assert resp.status_code == status.HTTP_201_CREATED

    def test_student_cannot_create_for_other_user(self, client, db_session):
        _make_admin(client, db_session)
        stu_token, stu_user_id = _register_and_login(client, "a@t.com", "pass")
        _, other_id = _register_and_login(client, "b@t.com", "pass")

        resp = client.post(
            "/students/",
            json={
                "university_id": "OTHER-001",
                "name": "Other",
                "department": "CS",
                "gpa": 2.0,
                "enrollment_date": date.today().isoformat(),
                "user_id": other_id,
            },
            headers={"Authorization": f"Bearer {stu_token}"},
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_duplicate_university_id(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        _, u1 = _register_and_login(client, "u1@t.com", "pass")
        _, u2 = _register_and_login(client, "u2@t.com", "pass")

        _create_student(client, admin_token, u1, university_id="DUP-001")
        resp = _create_student(client, admin_token, u2, university_id="DUP-001")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert "University ID already exists" in resp.json()["detail"]

    def test_duplicate_student_for_user(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        _, uid = _register_and_login(client, "dup@t.com", "pass")

        _create_student(client, admin_token, uid, university_id="A")
        resp = _create_student(client, admin_token, uid, university_id="B")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_invalid_gpa(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        _, uid = _register_and_login(client, "gpa@t.com", "pass")

        resp = client.post(
            "/students/",
            json={
                "university_id": "GPA-001",
                "name": "Bad GPA",
                "department": "CS",
                "gpa": 5.0,  # > 4.0
                "enrollment_date": date.today().isoformat(),
                "user_id": uid,
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_create_without_auth(self, client):
        resp = client.post("/students/", json={"name": "No Auth"})
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# CRUD — Read
# ---------------------------------------------------------------------------

class TestReadStudents:

    def test_list_students_admin(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        _, uid = _register_and_login(client, "l@t.com", "pass")
        _create_student(client, admin_token, uid)

        resp = client.get(
            "/students/",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.json()) >= 1

    def test_list_students_forbidden_for_student(self, client, db_session):
        _make_admin(client, db_session)
        stu_token, _ = _register_and_login(client, "nolist@t.com", "pass")

        resp = client.get(
            "/students/",
            headers={"Authorization": f"Bearer {stu_token}"},
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_get_own_profile(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        stu_token, uid = _register_and_login(client, "own@t.com", "pass")
        create_resp = _create_student(client, admin_token, uid, university_id="OWN-001", name="Own Profile")

        resp = client.get(
            "/students/me",
            headers={"Authorization": f"Bearer {stu_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["name"] == "Own Profile"

    def test_get_student_by_id(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        _, uid = _register_and_login(client, "byid@t.com", "pass")
        create_resp = _create_student(client, admin_token, uid, university_id="ID-001")
        sid = create_resp.json()["id"]

        resp = client.get(
            f"/students/{sid}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["id"] == sid

    def test_student_cannot_view_other_profile(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        _, u1 = _register_and_login(client, "s1@t.com", "pass")
        s2_token, u2 = _register_and_login(client, "s2@t.com", "pass")

        create_resp = _create_student(client, admin_token, u1, university_id="PRIV-001")
        sid = create_resp.json()["id"]

        resp = client.get(
            f"/students/{sid}",
            headers={"Authorization": f"Bearer {s2_token}"},
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_get_nonexistent_student(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        resp = client.get(
            "/students/9999",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_404_NOT_FOUND


# ---------------------------------------------------------------------------
# CRUD — Update (PATCH + PUT)
# ---------------------------------------------------------------------------

class TestUpdateStudent:

    def test_patch_student_admin(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        _, uid = _register_and_login(client, "patch@t.com", "pass")
        create_resp = _create_student(client, admin_token, uid, university_id="PATCH-001")
        sid = create_resp.json()["id"]

        resp = client.patch(
            f"/students/{sid}",
            json={"name": "Updated Name"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["name"] == "Updated Name"

    def test_put_student_full_update(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        _, uid = _register_and_login(client, "put@t.com", "pass")
        create_resp = _create_student(client, admin_token, uid, university_id="PUT-001")
        sid = create_resp.json()["id"]

        resp = client.put(
            f"/students/{sid}",
            json={
                "university_id": "PUT-UPDATED",
                "name": "Fully Updated",
                "department": "Physics",
                "gpa": 3.9,
                "enrollment_date": date.today().isoformat(),
                "user_id": uid,
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        assert data["name"] == "Fully Updated"
        assert data["department"] == "Physics"

    def test_student_updates_own_profile(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        stu_token, uid = _register_and_login(client, "selfup@t.com", "pass")
        create_resp = _create_student(client, admin_token, uid, university_id="SELF-UP")
        sid = create_resp.json()["id"]

        resp = client.patch(
            f"/students/{sid}",
            json={"phone_number": "123-456-7890"},
            headers={"Authorization": f"Bearer {stu_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["phone_number"] == "123-456-7890"

    def test_student_cannot_update_other(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        _, u1 = _register_and_login(client, "up1@t.com", "pass")
        s2_token, u2 = _register_and_login(client, "up2@t.com", "pass")

        create_resp = _create_student(client, admin_token, u1, university_id="UPO-001")
        sid = create_resp.json()["id"]

        resp = client.patch(
            f"/students/{sid}",
            json={"name": "Hacked"},
            headers={"Authorization": f"Bearer {s2_token}"},
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_update_nonexistent(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        resp = client.patch(
            "/students/9999",
            json={"name": "Ghost"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_404_NOT_FOUND


# ---------------------------------------------------------------------------
# CRUD — Delete
# ---------------------------------------------------------------------------

class TestDeleteStudent:

    def test_admin_deletes_student(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        _, uid = _register_and_login(client, "del@t.com", "pass")
        create_resp = _create_student(client, admin_token, uid, university_id="DEL-001")
        sid = create_resp.json()["id"]

        resp = client.delete(
            f"/students/{sid}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_204_NO_CONTENT

        # Verify gone
        get_resp = client.get(
            f"/students/{sid}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert get_resp.status_code == status.HTTP_404_NOT_FOUND

    def test_student_cannot_delete(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        stu_token, uid = _register_and_login(client, "nodelete@t.com", "pass")
        create_resp = _create_student(client, admin_token, uid, university_id="NDEL-001")
        sid = create_resp.json()["id"]

        resp = client.delete(
            f"/students/{sid}",
            headers={"Authorization": f"Bearer {stu_token}"},
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_nonexistent(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        resp = client.delete(
            "/students/9999",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_404_NOT_FOUND


# ---------------------------------------------------------------------------
# Filtering & Pagination
# ---------------------------------------------------------------------------

class TestFiltering:

    def _seed_multiple(self, client, db_session):
        admin_token, _ = _make_admin(client, db_session)
        users = []
        for i, (dept, gpa) in enumerate(
            [("CS", 3.8), ("CS", 2.5), ("Math", 3.0), ("Physics", 3.9)]
        ):
            _, uid = _register_and_login(client, f"f{i}@t.com", "pass")
            _create_student(client, admin_token, uid, university_id=f"FLT-{i}", department=dept, gpa=gpa, name=f"Student {i}")
            users.append(uid)
        return admin_token

    def test_filter_by_department(self, client, db_session):
        admin_token = self._seed_multiple(client, db_session)
        resp = client.get(
            "/students/?department=CS",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert all(s["department"] == "CS" for s in resp.json())

    def test_filter_by_gpa_range(self, client, db_session):
        admin_token = self._seed_multiple(client, db_session)
        resp = client.get(
            "/students/?gpa_min=3.0&gpa_max=3.9",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        for s in resp.json():
            assert 3.0 <= s["gpa"] <= 3.9

    def test_pagination(self, client, db_session):
        admin_token = self._seed_multiple(client, db_session)
        resp = client.get(
            "/students/?skip=0&limit=2",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.json()) <= 2

    def test_search_by_name(self, client, db_session):
        admin_token = self._seed_multiple(client, db_session)
        resp = client.get(
            "/students/?search=Student 0",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.json()) >= 1
