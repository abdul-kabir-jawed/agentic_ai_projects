# Evolution of Todo – Phase II: Web Todo with Persistence

A full-stack, animated todo application with cosmic design, built with Next.js, FastAPI, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- PostgreSQL 14+ or Neon serverless database

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -e ".[dev]"  # Using pyproject.toml with Poetry alternative

# Configure environment
cp .env.example .env
# Edit .env with your database URL

# Run database migrations
alembic upgrade head

# Start development server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional, defaults to localhost:8000)
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

## 🎨 Design Features

### Cosmic Aesthetic
- Dark-by-default gradient canvas (midnight blue → purple → pink)
- Glassmorphism cards with frosted glass effect
- Neon cyan and electric purple accents
- Subtle holographic glows and shadows

### Interactions
- **Task Cards**: Lift on hover with soft shadows and glows
- **Completion**: Elastic checkbox morph + confetti burst
- **Deletion**: Crumble/fade animation with gentle slide
- **Search Bar**: Expanding animation on focus
- **Filters**: Smooth pill-based transitions

### Responsive Design
- **Desktop (3-column)**: Main content + side panels
- **Mobile (single-column)**: Bottom nav + floating action button
- Honors `prefers-reduced-motion` for accessibility

## 📋 API Endpoints

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tasks` | List all tasks (with filters) |
| POST | `/api/v1/tasks` | Create a new task |
| GET | `/api/v1/tasks/{id}` | Get a specific task |
| PUT | `/api/v1/tasks/{id}` | Update a task |
| DELETE | `/api/v1/tasks/{id}` | Delete a task |
| PATCH | `/api/v1/tasks/{id}/complete` | Mark task as complete |

### Query Parameters (for GET `/api/v1/tasks`)

- `skip` (int, default 0): Pagination offset
- `limit` (int, default 100): Items per page
- `search` (string): Search in descriptions
- `priority` (string): Filter by priority (high, medium, low)
- `tag` (string): Filter by tag
- `is_completed` (boolean): Filter by completion status
- `sort_by` (string): Sort field (created_at, due_date, priority)
- `sort_order` (string): Sort order (asc, desc)

## 🏗 Project Structure

```
evolution-of-todo/
├── backend/
│   ├── src/
│   │   ├── models/          # SQLModel task model
│   │   ├── repositories/    # Database repository layer
│   │   ├── services/        # Business logic
│   │   ├── api/
│   │   │   ├── routers/     # FastAPI endpoints
│   │   │   └── schemas/     # Pydantic request/response models
│   │   ├── db/              # Database configuration
│   │   └── main.py          # FastAPI app
│   ├── tests/               # Unit & integration tests
│   ├── alembic/             # Database migrations
│   ├── pyproject.toml       # Python dependencies
│   └── .env.example         # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx   # Root layout
│   │   │   └── page.tsx     # Main todo page
│   │   ├── components/
│   │   │   ├── TaskList.tsx         # Task list with grouping
│   │   │   ├── TaskItem.tsx         # Individual task with animations
│   │   │   ├── TaskForm.tsx         # Create/edit form
│   │   │   ├── SearchBar.tsx        # Expanding search
│   │   │   └── FilterControls.tsx   # Filter popup
│   │   ├── services/
│   │   │   └── api.ts       # API client
│   │   ├── types/
│   │   │   └── task.ts      # TypeScript types
│   │   └── styles/
│   │       └── globals.css  # Cosmic design & animations
│   ├── tests/               # Unit & E2E tests
│   ├── package.json         # Node dependencies
│   ├── next.config.js       # Next.js configuration
│   ├── tailwind.config.ts   # Tailwind CSS config
│   ├── tsconfig.json        # TypeScript config
│   └── postcss.config.js    # PostCSS configuration
│
└── phase-i-console/         # Phase I: Console app (reference)
```

## 🔌 Technology Stack

### Backend
- **FastAPI** 0.104+ - Modern Python web framework
- **SQLModel** 0.0.14 - SQLAlchemy + Pydantic
- **PostgreSQL/Neon** - Persistent database
- **Alembic** - Database migrations
- **pytest** - Unit & integration testing

### Frontend
- **Next.js** 14+ - React framework with App Router
- **TypeScript** 5.3+ - Type safety
- **Tailwind CSS** 3.3+ - Utility-first styling
- **Framer Motion** 10+ - Animation library
- **Axios** - HTTP client
- **React Confetti** - Celebration effects

## 🧪 Testing

### Backend
```bash
cd backend
pytest tests/
pytest tests/ --cov=src  # With coverage
```

### Frontend
```bash
cd frontend
npm test                    # Unit tests
npm run test:e2e           # E2E tests with Playwright
```

## 📊 Performance Targets

- **Backend**: <200ms API response (p95)
- **Frontend**: <500ms page load
- **Search/Filter**: <10s with 50+ tasks
- **Animations**: 60 FPS smooth interactions
- **Responsive**: Mobile-first, tablet, desktop layouts

## 🎯 Features Implemented (Phase II)

✅ Task CRUD operations with validation
✅ Persistent PostgreSQL storage
✅ Search by description
✅ Filter by priority, tags, completion status, due date
✅ Sort by created_at, due_date, priority
✅ Cosmic design with glassmorphism
✅ Smooth animations and micro-interactions
✅ Responsive design (3-column → mobile)
✅ Task completion with confetti effect
✅ Priority-based grouping
✅ Quick stats sidebar
✅ Accessibility features (reduced motion)

## 🚧 Future Phases

- **Phase III**: AI Chatbot with natural language commands
- **Phase IV**: Local Kubernetes deployment
- **Phase V**: Cloud event-driven architecture

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/evolution_todo
NEON_DATABASE_URL=postgresql://...@us-east-1.neon.tech:5432/...?sslmode=require
ENVIRONMENT=development
API_PREFIX=/api/v1
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify `.env` DATABASE_URL is correct
- Run `alembic upgrade head` to apply migrations

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Look for CORS errors in browser console

### CORS errors
- Backend CORS is set to `*` in development
- For production, update `CORSMiddleware` in `backend/src/main.py`

## 📄 License

MIT License

---

**Build Status**: Phase II Complete ✅
**Last Updated**: 2025-12-11
**Version**: 0.2.0
