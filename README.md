# College Portal

A full-stack college management platform that unifies course scheduling, assignment tracking, attendance, and communication for students, teachers, and administrators.

## Features

### Student Experience
- Personalized dashboard with schedule, assignments, and alerts
- Enroll in courses, browse shared resources, and track grades
- Submit assignments with file uploads and follow submission status

### Teacher Experience
- Create courses aligned with the official timetable
- Build, publish, and grade assignments with feedback tools
- Monitor attendance and upcoming teaching load at a glance

### Administrator Experience
- Manage users, departments, and academic data centrally
- Seed demo data for presentations or testing
- View high-level activity for courses, assignments, and timetable usage

### Platform Capabilities
- Real-time notifications via Socket.io
- Responsive UI crafted with Tailwind CSS and Framer Motion
- Strong validation with React Hook Form and Zod

## Tech Stack

| Layer    | Technologies |
|----------|--------------|
| Frontend | React 19  TypeScript  Vite  Tailwind CSS  Framer Motion  React Query  React Hook Form + Zod |
| Backend  | Node.js  Express  MongoDB (Mongoose)  JWT Auth  Socket.io  Multer |
| Tooling  | ESLint  Prettier  Axios interceptors  Radix UI primitives |

## Getting Started

### Prerequisites
- Node.js **v18+**
- MongoDB (local or cloud)
- npm or yarn (scripts assume npm)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sujeet-Pawar/college_portal_.git
   cd college-portal
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**

   Create `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/college-portal
   JWT_SECRET=change-me-in-production
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   FRONTEND_URL=http://localhost:5173
   ```

   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```

4. **Start MongoDB** so the API can connect.

5. **Run the application**
   ```bash
   npm run dev            # runs backend + frontend together
   ```
   Or run each side individually:
   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```

6. **Visit the app**
   - Frontend: http://localhost:5173
   - API root: http://localhost:5000/api/v1

## Project Structure

```text
college-portal/
 backend/
    config/          # Environment & database setup
    controllers/     # Express route handlers
    middleware/      # Auth guards & utilities
    models/          # Mongoose schemas
    routes/          # API route definitions
    utils/           # Helper functions
    server.js        # API entry point
 frontend/
    src/
       components/  # Reusable UI pieces
       context/     # React context providers
       hooks/       # Custom hooks
       lib/         # Axios wrapper, helpers
       pages/       # Route-level screens
       types/       # Shared TypeScript types
       App.tsx      # Frontend entry
    package.json
 package.json         # Root scripts (install:all, dev, build)
 README.md
```

## Helpful Scripts

| Location | Command               | Description |
|----------|-----------------------|-------------|
| Root     | `npm run install:all` | Install dependencies for root + packages |
| Root     | `npm run dev`         | Concurrent backend & frontend dev servers |
| Backend  | `npm run dev`         | Nodemon API server |
| Backend  | `npm run start`       | Production Express server |
| Frontend | `npm run dev`         | Vite dev server |
| Frontend | `npm run build`       | Production build |
| Frontend | `npm run preview`     | Preview production output |

## API Snapshot

- **Auth**: register  login  logout  `GET /auth/me`
- **Courses**: list  detail  create/update/delete (teacher/admin)  enroll (student)
- **Assignments**: list  detail  create/update (teacher/admin)  submit  grade
- **Dashboard**: aggregated stats for dashboards

## Seed Data

Run the seed script to preload demo accounts, courses, assignments, and timetable slots:
```bash
cd backend
node scripts/seed.js
```
Sample credentials:

- Admin — `admin@college.edu / admin123`
- Teachers — `john.smith@college.edu`, `sarah.johnson@college.edu`, `priya.menon@college.edu`, `miguel.santos@college.edu` (password `teacher123`)
- Students — preloaded per department (password `student123`)

## Contributing

1. Fork the repo & create a branch.
2. Make changes and keep commits focused.
3. Submit a pull request with context and testing notes.

## License

Released under the ISC License.

## Support

Open an issue or contact `support@collegeportal.com` for help.
