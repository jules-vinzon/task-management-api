<h1>Task Management API</h1>

The Task Management API is a backend service designed to manage tasks and projects. It provides endpoints for creating, updating, retrieving, and deleting tasks, as well as managing task statuses.

<h2>Setup Instructions</h2>

<h3>Prerequisites</h3>

Ensure you have the following installed:

- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/)
- [Git](https://git-scm.com/)

<h3>Installation</h3> 

**1.** Clone the repository:
```
git clone https://github.com/jules-vinzon/task-management-api.git
cd task-management-api
```
**2.** Install dependencies:
```
npm install
# or
yarn install
```
**3.** Create a **.env** file in the root (if needed) and fill in necessary environment variables

**4.** Start the development server:
```
npm run dev
# or
yarn run dev
```

<h2>Task Management API - Authentication Endpoints</h2>

The Task Management API uses **RSA encryption** for secure credential transmission and **JWT** for session management.

<h3>Base URL</h3>

```
http://localhost:<PORT>/api/auth
```

<h3>1. Get Public Key</h3>

Retrieve a public key to encrypt sensitive data (login or registration).
- **Endpoint:** ```POST /getKey```
- **Request Body:**
```
{
  "request_id": "unique-client-id"
}
```
- **Response:**
```
{
  "success": true,
  "request_id": "unique-client-id",
  "public_key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A..."
}
```
**Notes:**
- ```request_id``` should be unique per client session.
- The server stores the matching private key internally.

<h3>2. Register User</h3>

Create a new user account. Credentials must be encrypted using the public key from ```getKey```.
- **Endpoint:** ```POST /register```
- **Request Body:**
```
{
  "request_id": "unique-client-id",
  "encdata": "<RSA_ENCRYPTED_JSON>"
}
```
- **Decrypted JSON Example:**
```
{
  "name": "Sample User",
  "email": "sample_user@example.com",
  "username": "sample.user",
  "password": "password123"
}

```
- **Response:**
```
{
  "success": true,
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "user-id",
    "name": "Sample User",
    "email": "sample_user@example.com"
  }
}
```

- **Error Response:**
```
{
  "success": false,
  "error": "Email already exists"
}
```
```
{
  "success": false,
  "error": "Username already exists"
}
```

<h3>3. Login User</h3>

Authenticate a user using encrypted credentials.
- **Endpoint:** ```POST /login```
- **Request Body:**
```
{
  "request_id": "unique-client-id",
  "encdata": "<RSA_ENCRYPTED_JSON>"
}
```
- **Decrypted JSON Example:**
```
{
  "emailOrUsername": "sample.user",
  "password": "password123"
}
```
- **Response:**
```
{
  "success": true,
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "user-id",
    "name": "Sample User"
  }
}
```

- **Error Response:**
```
{
  "success": false,
  "error": "Invalid credentials"
}
```

<h3>4. Refetch User Info</h3>

Validate the JWT token and return current user information.
- **Endpoint:** ```POST /refetch```
- **Headers:**
```
token: <JWT_TOKEN>
```

- **Response:**
```
{
  "success": true,
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "user-id",
    "name": "Sample User"
  }
}
```

- **Error Response:**
```
{
  "success": false,
  "error": "Invalid credentials"
}
```

<h3>5. Logout User</h3>

Invalidate the active JWT token.
- **Endpoint:** ```POST /logout```
- **Request Body:**
```
token: <JWT_TOKEN>
```

- **Response:**
```
{
  "success": true
}
```

- **Error Response:**
```
{
  "success": false,
  "error": "Server error"
}
```

<h3>Notes on Authentication Flow</h3>

1. Client requests ```getKey``` → receives public key.
2. Client encrypts sensitive payload (login/register) using the public key.
3. Server decrypts data using private key and performs authentication.
4. Server issues JWT token for session management.
5. JWT token can be refetched (```/refetch```) or invalidated (```/logout```).



<h2>Task Management API - Task Endpoints</h2>
All task endpoints require authentication via JWT. Include the token in the ```Token``` header as:
```
Token: Bearer <JWT_TOKEN>
```

<h3>Base URL</h3>

```
http://localhost:<PORT>/api/tasks
```

<h3>1. Create Task</h3>

Create a new task for a user.
- **Endpoint:** ```POST /```
- **Request Body:**
```
{
  "owner_id": "user-id",
  "title": "Finish API documentation",
  "description": "Write README and API docs",
  "status": "Pending",
}
```
- **Response:**
```
{
  "_id": "task-id",
  "owner": "user-id",
  "title": "Finish API documentation",
  "description": "Write README and API docs",
  "status": "Pending",
  "created_at": "2025-11-07T12:00:00.000Z",
}
```

<h3>2. Get All Tasks for Authenticated User</h3>

Retrieve all tasks owned by the current user.
- **Endpoint:** ```GET /```
- **Response:**
```
[
  {
    "_id": "task-id",
    "owner": "user-id",
    "title": "Finish API documentation",
    "description": "Write README and API docs",
    "status": "Pending",
    "created_at": "2025-11-07T12:00:00.000Z",
  }
]
```

<h3>3. Update Task</h3>

Update a task's details. Only the task owner can update their task.
- **Endpoint:** ```PUT /:id```
- **Request Body:**
```
{
  "owner_id": "user-id",
  "status": "Ongoing"
}
```
- **Response:**
```
{
  "_id": "task-id",
  "owner": "user-id",
  "title": "Finish API docs & review",
  "description": "Write README and API docs",
  "status": "Ongoing",
  "created_at": "2025-11-07T12:00:00.000Z",
}
```
- **Error Response:**
```
{
  "error": "Task not found or not authorized"
}
```

<h3>4. Delete Tasks</h3>

Delete multiple tasks by IDs. Only the task owner can delete their tasks.
- **Endpoint:** ```DELETE /```
- **Request Body:**
```
{
  "ids": ["task-id-1", "task-id-2"]
}
```
- **Response:**
```
{
  "msg": "2 task(s) deleted successfully"
}
```
- **Error Response:**
```
{
  "error": "No task IDs provided"
}
```

```
{
  "error": "No tasks found or not authorized"
}
```

<h2>Assumptions Made</h2>

<h3>1. Authentication & Security</h3>

- All task endpoints require a valid **JWT token** for authorization.
- The client obtains a **public key** from ```/auth/getKey``` and encrypts sensitive data before sending it to ```/auth/register``` or ```/auth/login```.
- The server stores the corresponding **private key** and uses it to decrypt data.
- Passwords are stored hashed using **bcrypt** with a salt defined by ```BCRYPT_SALT_ROUNDS```.
- Tokens are stored in ```user_token``` collection to allow session management and logout functionality.

<h3>2. User Management</h3>

- Users are uniquely identified by ```email``` or ```username```.
- Registration fails if either ```email``` or ```username``` already exists.
- Each task is associated with a single user (```owner_id```) and users cannot modify other users’ tasks.

<h3>3. Task Management</h3>

- Tasks have fields: ```title```, ```description```, ```status``` (```Pending```, ```Ongoing```, ```Completed```), ```created_at```.
- Only the task owner can update or delete their tasks.
- The ```deleteTasks``` endpoint requires an array of task IDs and deletes only tasks owned by the requesting user.
- Task retrieval endpoint (```getTasks```) filter tasks by the authenticated user.

<h3>4. Data Validation</h3>

- Express-validator is used to validate input for required fields (e.g., ```title```, ```owner_id```).
- Invalid input returns ```400 Bad Request``` with detailed error messages.

<h3>5. Error Handling</h3>

- All endpoints return a consistent JSON structure for errors:
```
{
  "success": false,
  "error": "<error message>"
}
```
- Server-side errors return a ```500 Internal Server Error```.

<h3>6. General Assumptions</h3>

- MongoDB is used as the primary database.
- Object IDs for users and tasks are valid MongoDB ObjectIDs.
- Dates are in ISO 8601 format (```YYYY-MM-DDTHH:mm:ss.sssZ```).
- Pagination or filtering of tasks is not implemented in the initial version.
