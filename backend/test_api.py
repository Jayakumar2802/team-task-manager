import requests

baseURL = "http://127.0.0.1:8000/api"

# Attempt to log in or create user
data = {"email": "tester99@test.com", "name": "Tester", "password": "password123"}
requests.post(f"{baseURL}/auth/signup", json=data)

print("Attempting login...")
r = requests.post(f"{baseURL}/auth/login", data={"username": "tester99@test.com", "password": "password123"})
if not r.ok:
    print("Login failed", r.text)
    exit(1)
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

print("Creating Project...")
p = requests.post(f"{baseURL}/projects/", json={"name": "Test P", "description": "Desc"}, headers=headers)
p_id = p.json()["id"]

print("Creating Task...")
t = {"title": "Test Task", "project_id": p_id, "priority": "medium", "status": "todo"}
res = requests.post(f"{baseURL}/tasks/", json=t, headers=headers)
task_id = res.json().get("id")
if not task_id:
    print("Task creation failed:", res.text)
    exit(1)

print("Creating Comment...")
c = {"task_id": task_id, "content": "Test comment"}
res = requests.post(f"{baseURL}/comments/", json=c, headers=headers)
print("Comment response:", res.status_code, res.text)

print("Uploading Attachment...")
files = {'file': ('test.txt', b'Hello world', 'text/plain')}
res = requests.post(f"{baseURL}/attachments/task/{task_id}", files=files, headers=headers)
print("Attachment response:", res.status_code, res.text)
