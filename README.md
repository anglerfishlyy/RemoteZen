# RemoteZen Backend (MVP)

RemoteZen helps remote teams stay focused and aligned with a simple dashboard for tasks and a built-in focus timer.

##  Features (MVP)
- User Authentication (JWT or Supabase)
- Team creation & membership
- Task management (CRUD, assign, update status)
- Focus timer logs (Pomodoro-style)

##  Tech Stack
- Node.js + Express
- PostgreSQL
- Prisma ORM
- JWT Auth
- Deployment: Render 

##  Setup
```bash
# Clone repo
git clone https://github.com/yourusername/remotezen-backend.git
cd remotezen-backend

# Install dependencies
npm install

# Setup env
cp .env.example .env
# Add DATABASE_URL, JWT_SECRET, etc.

# Migrate DB
npx prisma migrate dev --name init

# Run server
npm run dev
