def test_auth_routes_validate_and_login(client):
    register = client.post(
        "/auth/register",
        json={"name": "New User", "email": "new@example.com", "password": "password123"},
    )
    assert register.status_code == 404

    invalid_login = client.post(
        "/auth/login",
        json={"email": "unknown@example.com", "password": "wrong"},
    )
    assert invalid_login.status_code == 401

    admin_login = client.post(
        "/auth/login",
        json={"email": "admin@bugtracker.local", "password": "admin12345"},
    )
    assert admin_login.status_code == 200

    created_user = client.post(
        "/users",
        json={"name": "New User", "email": "new@example.com", "password": "password123"},
        headers={"Authorization": f"Bearer {admin_login.get_json()['data']['access_token']}"},
    )
    assert created_user.status_code == 201

    valid_login = client.post(
        "/auth/login",
        json={"email": "new@example.com", "password": "password123"},
    )
    assert valid_login.status_code == 200
    token = valid_login.get_json()["data"]["access_token"]
    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200


def test_users_and_projects_routes_require_admin(client, auth_headers):
    forbidden = client.get("/users", headers={})
    assert forbidden.status_code == 401

    user_response = client.post(
        "/users",
        json={"name": "Alice", "email": "alice@example.com", "password": "password123"},
        headers=auth_headers,
    )
    assert user_response.status_code == 201
    user_id = user_response.get_json()["data"]["id"]
    assert user_response.get_json()["data"]["credential_password"] == "password123"

    assert client.get("/users", headers=auth_headers).status_code == 200
    assert "credential_password" in client.get("/users", headers=auth_headers).get_json()["data"][0]
    assert client.get(f"/users/{user_id}", headers=auth_headers).status_code == 200
    assert client.get("/users/99999", headers=auth_headers).status_code == 404

    project_response = client.post(
        "/projects",
        json={"name": "Core", "description": "Core project"},
        headers=auth_headers,
    )
    assert project_response.status_code == 201
    project_id = project_response.get_json()["data"]["id"]

    assert client.get("/projects", headers=auth_headers).status_code == 200
    assert client.get(f"/projects/{project_id}", headers=auth_headers).status_code == 200
    assert client.get("/projects/99999", headers=auth_headers).status_code == 404


def test_users_route_cannot_self_block_admin(client, auth_headers):
    me = client.get("/auth/me", headers=auth_headers)
    assert me.status_code == 200
    admin_id = me.get_json()["data"]["id"]

    response = client.patch(
        f"/users/{admin_id}/block",
        headers=auth_headers,
    )

    assert response.status_code == 400
    assert response.get_json()["error"] == "Admin cannot block their own account"


def test_users_route_cannot_block_admin_account(client, auth_headers):
    second_admin = client.post(
        "/users",
        json={
            "name": "Second Admin",
            "email": "second-admin@example.com",
            "password": "password123",
            "role": "admin",
        },
        headers=auth_headers,
    )
    assert second_admin.status_code == 201
    second_admin_id = second_admin.get_json()["data"]["id"]

    block_response = client.patch(
        f"/users/{second_admin_id}/block",
        headers=auth_headers,
    )

    assert block_response.status_code == 400
    assert block_response.get_json()["error"] == "Admin accounts cannot be blocked"


def test_bugs_routes_cover_validation_and_lifecycle(client, auth_headers):
    project = client.post(
        "/projects",
        json={"name": "Core", "description": "Core project"},
        headers=auth_headers,
    )
    assert project.status_code == 201
    project_id = project.get_json()["data"]["id"]

    user = client.post(
        "/users",
        json={"name": "Assignee", "email": "assignee@example.com", "password": "password123"},
        headers=auth_headers,
    )
    assert user.status_code == 201
    user_id = user.get_json()["data"]["id"]

    bug = client.post(
        "/bugs",
        json={
            "project_id": project_id,
            "title": "Bug A",
            "description": "Desc",
            "priority": "high",
        },
        headers=auth_headers,
    )
    assert bug.status_code == 201
    bug_id = bug.get_json()["data"]["id"]

    assert client.get("/bugs", headers=auth_headers).status_code == 200
    assert client.get(f"/bugs/{bug_id}", headers=auth_headers).status_code == 200
    assert client.get("/bugs/99999", headers=auth_headers).status_code == 404
    assert client.get("/bugs?status=bad-status", headers=auth_headers).status_code == 400
    assert client.get("/bugs?unexpected=1", headers=auth_headers).status_code == 400

    update_missing_assignee = client.post(
        f"/bugs/{bug_id}/transition",
        json={"status": "in_progress"},
        headers=auth_headers,
    )
    assert update_missing_assignee.status_code == 400

    assert client.put(
        f"/bugs/{bug_id}",
        json={"assignee_id": user_id},
        headers=auth_headers,
    ).status_code == 200

    assert client.post(
        f"/bugs/{bug_id}/transition",
        json={"status": "in_progress"},
        headers=auth_headers,
    ).status_code == 200

    assert client.post(
        f"/bugs/{bug_id}/transition",
        json={"status": "resolved"},
        headers=auth_headers,
    ).status_code == 400

    assert client.put(
        f"/bugs/{bug_id}",
        json={"resolution_note": "Fixed"},
        headers=auth_headers,
    ).status_code == 200

    assert client.post(
        f"/bugs/{bug_id}/transition",
        json={"status": "resolved"},
        headers=auth_headers,
    ).status_code == 200
    assert client.post(
        f"/bugs/{bug_id}/transition",
        json={"status": "closed"},
        headers=auth_headers,
    ).status_code == 200
    assert client.post(
        f"/bugs/{bug_id}/transition",
        json={"status": "open"},
        headers=auth_headers,
    ).status_code == 400

    comment = client.post(
        f"/bugs/{bug_id}/comments",
        json={"text": "Looks good"},
        headers=auth_headers,
    )
    assert comment.status_code == 201
    assert client.get(f"/bugs/{bug_id}/comments", headers=auth_headers).status_code == 200
    assert client.post(
        f"/bugs/{bug_id}/comments",
        json={},
        headers=auth_headers,
    ).status_code == 400

    member_create = client.post(
        "/users",
        json={"name": "Member", "email": "member@example.com", "password": "password123"},
        headers=auth_headers,
    )
    assert member_create.status_code == 201
    member_user_id = member_create.get_json()["data"]["id"]

    member_login = client.post(
        "/auth/login",
        json={"email": "member@example.com", "password": "password123"},
    )
    assert member_login.status_code == 200
    member_token = member_login.get_json()["data"]["access_token"]
    member_headers = {"Authorization": f"Bearer {member_token}"}

    # Members can read reference data and work bugs.
    assert client.get("/users", headers=member_headers).status_code == 200
    member_user_list = client.get("/users", headers=member_headers).get_json()["data"]
    assert "credential_password" not in member_user_list[0]
    assert client.get("/projects", headers=member_headers).status_code == 200
    assert client.get("/bugs", headers=member_headers).status_code == 200
    assert client.post(
        f"/bugs/{bug_id}/comments",
        json={"text": "Member update"},
        headers=member_headers,
    ).status_code == 201

    # Creation of users/projects/bugs remains admin-only.
    assert client.post(
        "/users",
        json={"name": "Blocked", "email": "blocked@example.com", "password": "password123"},
        headers=member_headers,
    ).status_code == 403
    assert client.post(
        "/projects",
        json={"name": "Blocked", "description": "No access"},
        headers=member_headers,
    ).status_code == 403
    assert client.post(
        "/bugs",
        json={
            "project_id": project_id,
            "title": "Blocked",
            "description": "No access",
            "priority": "low",
        },
        headers=member_headers,
    ).status_code == 403

    member_bug = client.post(
        "/bugs",
        json={
            "project_id": project_id,
            "title": "Member flow",
            "description": "Needs resolution",
            "priority": "medium",
        },
        headers=auth_headers,
    )
    assert member_bug.status_code == 201
    member_bug_id = member_bug.get_json()["data"]["id"]

    assert client.put(
        f"/bugs/{member_bug_id}",
        json={"assignee_id": user_id},
        headers=auth_headers,
    ).status_code == 200
    assert client.post(
        f"/bugs/{member_bug_id}/transition",
        json={"status": "in_progress"},
        headers=auth_headers,
    ).status_code == 200

    assert client.post(
        f"/bugs/{member_bug_id}/transition",
        json={"status": "resolved"},
        headers=member_headers,
    ).status_code == 400
    assert client.put(
        f"/bugs/{member_bug_id}",
        json={"resolution_note": "Member fixed it"},
        headers=member_headers,
    ).status_code == 200
    assert client.post(
        f"/bugs/{member_bug_id}/transition",
        json={"status": "resolved"},
        headers=member_headers,
    ).status_code == 200
    assert client.post(
        f"/bugs/{member_bug_id}/transition",
        json={"status": "closed"},
        headers=member_headers,
    ).status_code == 400

    # Admin can block and unblock users; blocked users cannot access protected APIs.
    block_response = client.patch(
        f"/users/{member_user_id}/block",
        headers=auth_headers,
    )
    assert block_response.status_code == 200
    assert block_response.get_json()["data"]["is_blocked"] is True

    blocked_me = client.get("/auth/me", headers=member_headers)
    assert blocked_me.status_code == 401

    blocked_list_bugs = client.get("/bugs", headers=member_headers)
    assert blocked_list_bugs.status_code == 403

    blocked_login = client.post(
        "/auth/login",
        json={"email": "member@example.com", "password": "password123"},
    )
    assert blocked_login.status_code == 401

    unblock_response = client.patch(
        f"/users/{member_user_id}/unblock",
        headers=auth_headers,
    )
    assert unblock_response.status_code == 200
    assert unblock_response.get_json()["data"]["is_blocked"] is False

    relogin = client.post(
        "/auth/login",
        json={"email": "member@example.com", "password": "password123"},
    )
    assert relogin.status_code == 200
