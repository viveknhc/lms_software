# LMS — Learning Management System

A full-featured Learning Management System built with **Django REST Framework** (backend) and **React + Vite + TypeScript** (frontend).

## Features

- **Multi-role system** — Students, Instructors, Admins, and Accounts staff
- **Course management** — Sections, lessons (video/text/documents), quizzes, assignments
- **Enrollment & progress tracking** — Lesson completion, course progress, certificates
- **Payment integration** — Stripe-based payments with orders and invoices
- **Analytics dashboards** — Per-role dashboards with activity logs and reports
- **CMS module** — Blog posts, pages, site settings
- **Finance module** — Student fees and instructor salary management
- **JWT authentication** — Token-based auth with refresh/blacklist

---

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL 15+ (or SQLite for quick testing — see below)
- Redis (optional, for caching — falls back gracefully)

---

### 1. Backend Setup

```bash
# Clone the repo
cd lms_software

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Create a superuser (admin)
python manage.py createsuperuser
# Username: admin
# Email: admin@example.com
# Password: DemoPass123!

# Seed demo data (categories, courses, users, enrollments, etc.)
python manage.py seed_data


Demo Credentials:
  All users:     password = DemoPass123!

  Accounts:
    - accounts.team / DemoPass123!

  Instructors:
    - sarah.johnson / DemoPass123!
    - michael.chen / DemoPass123!
    - emily.rodriguez / DemoPass123!
    - david.kim / DemoPass123!

  Students:
    - alex.thompson / DemoPass123!
    - maria.garcia / DemoPass123!
    - james.wilson / DemoPass123!
    - priya.patel / DemoPass123!
    - omar.hassan / DemoPass123!
    - lily.chang / DemoPass123!

# Start the dev server
python manage.py runserver
```

> The backend API runs at **http://localhost:8000**.
> Admin panel at **http://localhost:8000/admin/**.

#### Using SQLite instead of PostgreSQL (for quick testing)

Create a `.env` file in the project root:

```env
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
```

Then run `python manage.py migrate` as above.

---

### 2. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

> The frontend runs at **http://localhost:5173**.

---

## Demo Credentials

All demo users use the same password:

> **Password for all users:** `DemoPass123!`

### 👑 Admin
| Username | Role |
|----------|------|
| `admin` | Admin (create via `createsuperuser`) |

### 👨‍🏫 Instructors
| Username | Name |
|----------|------|
| `sarah.johnson` | Sarah Johnson |
| `michael.chen` | Michael Chen |
| `emily.rodriguez` | Emily Rodriguez |
| `david.kim` | David Kim |

### 🎓 Students
| Username | Name |
|----------|------|
| `alex.thompson` | Alex Thompson |
| `maria.garcia` | Maria Garcia |
| `james.wilson` | James Wilson |
| `priya.patel` | Priya Patel |
| `omar.hassan` | Omar Hassan |
| `lily.chang` | Lily Chang |

### 💰 Accounts
| Username | Name |
|----------|------|
| `accounts.team` | Accounts Team |

---

## Seed Data Overview

Running `python manage.py seed_data` creates:

| Entity | Count |
|--------|-------|
| Categories | 5 |
| Instructors | 4 |
| Students | 6 |
| Courses | 5 |
| Sections | 13 |
| Lessons | 28+ |
| Assignments | 10 |
| Quizzes | 5 |
| Enrollments | 14+ |
| Certificates | 3 |
| Payments | 6 |
| Student Fees | 12 |
| Instructor Salaries | 8 |

Students are pre-enrolled in courses with progress, graded submissions, and quiz attempts.

To flush and re-seed:
```bash
python manage.py seed_data --flush
```

---

## Project Structure

```
lms_software/
├── accounts/          # Custom user model (roles: student, instructor, admin, accounts)
├── analytics/         # Activity logs and per-role dashboards
├── assessments/       # Quizzes, questions, options, attempts, results
├── assignments/       # Assignments, submissions, grading
├── certificates/      # Certificate templates and issued certificates
├── cms/               # Blog posts, pages, site settings
├── common/            # Shared utilities, seed data command
├── config/            # Django settings, URL routing, ASGI/WSGI
├── courses/           # Courses, categories
├── enrollments/       # Enrollments, progress tracking
├── finance/           # Student fees, instructor salaries
├── learning/          # Sections, lessons
├── notifications/     # In-app notifications
├── payments/          # Orders, invoices, Stripe integration
├── users/             # User listing endpoints
├── frontend/          # React + Vite + TypeScript SPA
│   ├── src/
│   │   ├── api/       # API client modules
│   │   ├── components/# Shared UI components
│   │   ├── context/   # Auth context
│   │   ├── hooks/     # Custom hooks
│   │   ├── pages/     # Route pages
│   │   └── types/     # TypeScript type definitions
│   └── ...
├── requirements.txt
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Django 6.0, Django REST Framework 3.17 |
| Frontend | React 19, Vite 6, TypeScript 5.7, Tailwind CSS 4 |
| Database | PostgreSQL 15+ (SQLite for dev) |
| Auth | JWT (SimpleJWT with refresh/blacklist) |
| Payments | Stripe |
| Cache | Redis |
| CI | GitHub Actions |
