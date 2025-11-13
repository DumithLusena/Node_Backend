Start server:
   npm run server

Health check
- GET /health -> { status: "ok", db: true }

Endpoints
- Users
  - POST /api/users/register { name, email, password }
  - POST /api/users/login { email, password }
  - PUT /api/users/me (auth) { name?, password? }
  - GET /api/users/profile (auth)
  - GET /api/users
- Posts
  - GET /api/posts
  - GET /api/posts/:id
  - POST /api/posts (auth) { title, content }
  - PUT /api/posts/:id (auth) { title?, content? }
  - DELETE /api/posts/:id (auth)
