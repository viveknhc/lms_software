"""
Management command to seed demo data for the LMS.

Creates realistic demo users, courses, lessons, assignments, quizzes,
enrollments, submissions, grades, attempts, certificates, payments, and more.

Usage:
    python manage.py seed_data          # Full seeding
    python manage.py seed_data --flush  # Clear all data first
"""

from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

UserModel = get_user_model()

# ============================================================================
#  DEMO CATEGORIES
# ============================================================================

# Local sample video file for demo lessons
# Upload your video to media/lesson_videos/lesson.mp4
# Used for all video-type lessons in seed data
SAMPLE_VIDEO_URL = "/media/lesson_videos/lesson.mp4"

CATEGORIES = [
    {"name": "Programming", "description": "Learn programming languages and paradigms"},
    {"name": "Web Development", "description": "Build modern web applications"},
    {"name": "Data Science", "description": "Explore data analysis, ML, and AI"},
    {"name": "Mobile Development", "description": "Create mobile apps for iOS and Android"},
    {"name": "DevOps & Cloud", "description": "Master CI/CD, cloud, and infrastructure"},
]

# ============================================================================
#  DEMO USERS
# ============================================================================

INSTRUCTORS = [
    {
        "username": "sarah.johnson",
        "email": "sarah.johnson@example.com",
        "password": "DemoPass123!",
        "first_name": "Sarah",
        "last_name": "Johnson",
        "role": "instructor",
        "bio": (
            "Senior Python developer with 10+ years of experience. "
            "Passionate about teaching programming fundamentals and best practices."
        ),
    },
    {
        "username": "michael.chen",
        "email": "michael.chen@example.com",
        "password": "DemoPass123!",
        "first_name": "Michael",
        "last_name": "Chen",
        "role": "instructor",
        "bio": (
            "Full-stack web developer specializing in React, Django, and modern JS. "
            "Loves building production-grade applications."
        ),
    },
    {
        "username": "emily.rodriguez",
        "email": "emily.rodriguez@example.com",
        "password": "DemoPass123!",
        "first_name": "Emily",
        "last_name": "Rodriguez",
        "role": "instructor",
        "bio": (
            "Data scientist and ML engineer. Formerly at Google and Netflix. "
            "Makes complex data topics accessible to everyone."
        ),
    },
    {
        "username": "david.kim",
        "email": "david.kim@example.com",
        "password": "DemoPass123!",
        "first_name": "David",
        "last_name": "Kim",
        "role": "instructor",
        "bio": (
            "Mobile developer and UI/UX enthusiast. "
            "Expert in React Native, Flutter, and cross-platform development."
        ),
    },
]

ACCOUNTS_USERS = [
    {
        "username": "accounts.team",
        "email": "accounts@institute.com",
        "password": "DemoPass123!",
        "first_name": "Accounts",
        "last_name": "Team",
        "role": "accounts",
        "bio": "Institute accounts and finance management team.",
    },
]

STUDENTS = [
    {
        "username": "alex.thompson",
        "email": "alex.thompson@example.com",
        "password": "DemoPass123!",
        "first_name": "Alex",
        "last_name": "Thompson",
        "role": "student",
        "bio": "Aspiring developer learning full-stack web development.",
    },
    {
        "username": "maria.garcia",
        "email": "maria.garcia@example.com",
        "password": "DemoPass123!",
        "first_name": "Maria",
        "last_name": "Garcia",
        "role": "student",
        "bio": "Data enthusiast transitioning into data science from finance.",
    },
    {
        "username": "james.wilson",
        "email": "james.wilson@example.com",
        "password": "DemoPass123!",
        "first_name": "James",
        "last_name": "Wilson",
        "role": "student",
        "bio": "Computer science student looking to build real-world projects.",
    },
    {
        "username": "priya.patel",
        "email": "priya.patel@example.com",
        "password": "DemoPass123!",
        "first_name": "Priya",
        "last_name": "Patel",
        "role": "student",
        "bio": "Product manager learning to code to better understand her engineering team.",
    },
    {
        "username": "omar.hassan",
        "email": "omar.hassan@example.com",
        "password": "DemoPass123!",
        "first_name": "Omar",
        "last_name": "Hassan",
        "role": "student",
        "bio": "Career-switcher from marketing to software engineering.",
    },
    {
        "username": "lily.chang",
        "email": "lily.chang@example.com",
        "password": "DemoPass123!",
        "first_name": "Lily",
        "last_name": "Chang",
        "role": "student",
        "bio": "Self-taught coder diving deep into mobile development.",
    },
]

# ============================================================================
#  DEMO COURSES
# ============================================================================

COURSES_DATA = [
    {
        "title": "Python for Absolute Beginners",
        "short_description": "Learn Python from scratch — no experience needed!",
        "description": (
            "A comprehensive introduction to Python programming. "
            "You'll learn variables, data types, control flow, functions, "
            "object-oriented programming, and build real projects along the way. "
            "Perfect for complete beginners or those looking to solidify their fundamentals."
        ),
        "price": Decimal("0.00"),
        "instructor_username": "sarah.johnson",
        "category_name": "Programming",
        "sections": [
            {
                "title": "Getting Started with Python",
                "order": 1,
                "lessons": [
                    {"title": "What is Python?", "content_type": "video", "content": "Python is a high-level, interpreted programming language created by Guido van Rossum. It emphasizes code readability and simplicity.", "duration_minutes": 10, "is_free": True, "order": 1},
                    {"title": "Installing Python & Setting Up", "content_type": "text", "content": "Step-by-step guide to install Python on Windows, macOS, and Linux. We'll also set up VS Code with Python extensions.", "duration_minutes": 15, "is_free": True, "order": 2},
                    {"title": "Your First Python Program", "content_type": "video", "content": "Write your first 'Hello, World!' program and learn how to run Python scripts.", "duration_minutes": 8, "is_free": True, "order": 3},
                    {"title": "Understanding Variables & Data Types", "content_type": "document", "content": "Learn about integers, floats, strings, booleans, and how to use variables effectively.", "duration_minutes": 20, "is_free": False, "order": 4},
                ],
            },
            {
                "title": "Control Flow & Functions",
                "order": 2,
                "lessons": [
                    {"title": "Conditional Statements (if/elif/else)", "content_type": "video", "content": "Control program flow with conditionals.", "duration_minutes": 15, "is_free": False, "order": 1},
                    {"title": "Loops: for and while", "content_type": "video", "content": "Iterate over data with loops and comprehensions.", "duration_minutes": 18, "is_free": False, "order": 2},
                    {"title": "Writing Reusable Functions", "content_type": "document", "content": "Define and call functions, understand scope and parameters.", "duration_minutes": 25, "is_free": False, "order": 3},
                    {"title": "Lambda Functions & List Comprehensions", "content_type": "text", "content": "Write concise Python with lambdas and comprehensions.", "duration_minutes": 12, "is_free": False, "order": 4},
                ],
            },
            {
                "title": "OOP & Project",
                "order": 3,
                "lessons": [
                    {"title": "Classes and Objects", "content_type": "video", "content": "Introduction to object-oriented programming in Python.", "duration_minutes": 22, "is_free": False, "order": 1},
                    {"title": "Inheritance & Polymorphism", "content_type": "document", "content": "Extend classes and override behavior.", "duration_minutes": 18, "is_free": False, "order": 2},
                    {"title": "Final Project: Build a CLI Todo App", "content_type": "text", "content": "Apply everything you've learned to build a command-line todo application with file persistence.", "duration_minutes": 45, "is_free": False, "order": 3},
                ],
            },
        ],
        "assignments": [
            {"title": "Python Basics Quiz", "description": "Test your understanding of Python basics.", "total_points": 100, "due_date_days": 7},
            {"title": "Build a Calculator", "description": "Create a command-line calculator that supports basic arithmetic operations.", "total_points": 100, "due_date_days": 14},
        ],
        "quiz": {
            "title": "Python Fundamentals Quiz",
            "description": "Test your Python knowledge!",
            "time_limit_minutes": 30,
            "passing_score": 60,
            "questions": [
                {"text": "What is the correct file extension for Python files?", "question_type": "single_choice", "points": 10, "options": [{"text": ".pyt", "is_correct": False}, {"text": ".py", "is_correct": True}, {"text": ".python", "is_correct": False}, {"text": ".pt", "is_correct": False}]},
                {"text": "Which of the following are Python data types? (Select all that apply)", "question_type": "multiple_choice", "points": 15, "options": [{"text": "int", "is_correct": True}, {"text": "float", "is_correct": True}, {"text": "string", "is_correct": True}, {"text": "char", "is_correct": False}]},
                {"text": "Python is a compiled language.", "question_type": "true_false", "points": 5, "options": [{"text": "True", "is_correct": False}, {"text": "False", "is_correct": True}]},
                {"text": "What keyword is used to define a function in Python?", "question_type": "single_choice", "points": 10, "options": [{"text": "function", "is_correct": False}, {"text": "def", "is_correct": True}, {"text": "define", "is_correct": False}, {"text": "func", "is_correct": False}]},
            ],
        },
    },
    {
        "title": "Modern Web Development with React & Django",
        "short_description": "Build full-stack apps with React and Django REST Framework",
        "description": (
            "A hands-on course covering modern full-stack web development. "
            "Learn React for the frontend, Django REST Framework for the backend, "
            "and how to connect them seamlessly. By the end, you'll build a complete "
            "social media application from scratch."
        ),
        "price": Decimal("49.99"),
        "instructor_username": "michael.chen",
        "category_name": "Web Development",
        "sections": [
            {
                "title": "React Foundations",
                "order": 1,
                "lessons": [
                    {"title": "What is React?", "content_type": "video", "content": "Understand the React component model and virtual DOM.", "duration_minutes": 12, "is_free": True, "order": 1},
                    {"title": "JSX & Components", "content_type": "video", "content": "Write JSX syntax and build your first components.", "duration_minutes": 18, "is_free": True, "order": 2},
                    {"title": "State & Props", "content_type": "document", "content": "Manage component state with useState and pass data via props.", "duration_minutes": 25, "is_free": False, "order": 3},
                    {"title": "React Hooks Deep Dive", "content_type": "video", "content": "useEffect, useContext, useReducer, and custom hooks explained.", "duration_minutes": 30, "is_free": False, "order": 4},
                ],
            },
            {
                "title": "Django REST Framework",
                "order": 2,
                "lessons": [
                    {"title": "DRF Overview & Setup", "content_type": "video", "content": "Set up Django REST Framework and create your first API view.", "duration_minutes": 15, "is_free": False, "order": 1},
                    {"title": "Serializers & Viewsets", "content_type": "document", "content": "Model serializers, ViewSets, and routers for rapid API development.", "duration_minutes": 22, "is_free": False, "order": 2},
                    {"title": "Authentication & Permissions", "content_type": "text", "content": "JWT authentication, permission classes, and securing your API.", "duration_minutes": 20, "is_free": False, "order": 3},
                ],
            },
            {
                "title": "Full-Stack Integration",
                "order": 3,
                "lessons": [
                    {"title": "Connecting React to Django", "content_type": "video", "content": "Use axios to connect your React frontend to the Django API.", "duration_minutes": 20, "is_free": False, "order": 1},
                    {"title": "Building a Social Media App", "content_type": "document", "content": "Follow along to build a full-stack social media app: user auth, posts, comments, and likes.", "duration_minutes": 60, "is_free": False, "order": 2},
                ],
            },
        ],
        "assignments": [
            {"title": "Build a React Counter App", "description": "Create a counter application with increment, decrement, and reset functionality using useState.", "total_points": 50, "due_date_days": 5},
            {"title": "REST API for Blog Posts", "description": "Build a Django REST API for a blog with CRUD operations for posts and comments.", "total_points": 100, "due_date_days": 10},
            {"title": "Full-Stack Todo App", "description": "Combine React and Django to build a full-stack todo application with user authentication.", "total_points": 150, "due_date_days": 21},
        ],
        "quiz": {
            "title": "React & Django Basics",
            "description": "Test your understanding of React and Django fundamentals.",
            "time_limit_minutes": 20,
            "passing_score": 70,
            "questions": [
                {"text": "What hook is used for side effects in React?", "question_type": "single_choice", "points": 10, "options": [{"text": "useState", "is_correct": False}, {"text": "useEffect", "is_correct": True}, {"text": "useContext", "is_correct": False}, {"text": "useReducer", "is_correct": False}]},
                {"text": "Django REST Framework uses ________ to convert complex data types to JSON.", "question_type": "single_choice", "points": 10, "options": [{"text": "Serializers", "is_correct": True}, {"text": "Models", "is_correct": False}, {"text": "Middlewares", "is_correct": False}, {"text": "Templates", "is_correct": False}]},
                {"text": "Which are valid React lifecycle methods? (Select all that apply)", "question_type": "multiple_choice", "points": 15, "options": [{"text": "componentDidMount", "is_correct": True}, {"text": "componentWillUnmount", "is_correct": True}, {"text": "componentShouldUpdate", "is_correct": False}, {"text": "componentDidUpdate", "is_correct": True}]},
            ],
        },
    },
    {
        "title": "Data Science & Machine Learning Fundamentals",
        "short_description": "From data wrangling to ML models — the complete data science journey",
        "description": (
            "Dive into the world of data science with Python. Learn data wrangling "
            "with Pandas, visualization with Matplotlib and Seaborn, and build "
            "machine learning models using scikit-learn. Real-world datasets included!"
        ),
        "price": Decimal("79.99"),
        "instructor_username": "emily.rodriguez",
        "category_name": "Data Science",
        "sections": [
            {
                "title": "Data Wrangling with Pandas",
                "order": 1,
                "lessons": [
                    {"title": "Introduction to Pandas & DataFrames", "content_type": "video", "content": "Load, inspect, and manipulate tabular data with Pandas.", "duration_minutes": 20, "is_free": True, "order": 1},
                    {"title": "Data Cleaning Techniques", "content_type": "video", "content": "Handle missing values, duplicates, and outliers effectively.", "duration_minutes": 25, "is_free": True, "order": 2},
                    {"title": "Grouping & Aggregation", "content_type": "document", "content": "Group data, compute aggregates, and pivot tables.", "duration_minutes": 18, "is_free": False, "order": 3},
                ],
            },
            {
                "title": "Data Visualization",
                "order": 2,
                "lessons": [
                    {"title": "Plotting with Matplotlib", "content_type": "video", "content": "Create line plots, bar charts, histograms, and scatter plots.", "duration_minutes": 22, "is_free": False, "order": 1},
                    {"title": "Statistical Visualizations with Seaborn", "content_type": "document", "content": "Heatmaps, box plots, pair plots, and distribution plots.", "duration_minutes": 18, "is_free": False, "order": 2},
                ],
            },
            {
                "title": "Machine Learning",
                "order": 3,
                "lessons": [
                    {"title": "Supervised Learning: Regression", "content_type": "video", "content": "Linear regression, polynomial regression, and evaluation metrics.", "duration_minutes": 30, "is_free": False, "order": 1},
                    {"title": "Supervised Learning: Classification", "content_type": "video", "content": "Logistic regression, decision trees, random forests, and SVMs.", "duration_minutes": 35, "is_free": False, "order": 2},
                    {"title": "Model Evaluation & Cross-Validation", "content_type": "text", "content": "Train/test splits, k-fold cross validation, confusion matrices, and ROC curves.", "duration_minutes": 20, "is_free": False, "order": 3},
                    {"title": "Final Project: Predict House Prices", "content_type": "document", "content": "Apply everything to predict house prices using the Boston Housing dataset.", "duration_minutes": 45, "is_free": False, "order": 4},
                ],
            },
        ],
        "assignments": [
            {"title": "Data Cleaning Challenge", "description": "Clean a messy dataset with missing values, inconsistent formatting, and outliers.", "total_points": 100, "due_date_days": 7},
            {"title": "Exploratory Data Analysis Report", "description": "Perform EDA on a real-world dataset and create a report with visualizations.", "total_points": 100, "due_date_days": 14},
        ],
        "quiz": {
            "title": "Data Science Concepts Quiz",
            "description": "Test your data science knowledge!",
            "time_limit_minutes": 25,
            "passing_score": 60,
            "questions": [
                {"text": "Which Python library is primarily used for data manipulation?", "question_type": "single_choice", "points": 10, "options": [{"text": "NumPy", "is_correct": False}, {"text": "Pandas", "is_correct": True}, {"text": "Matplotlib", "is_correct": False}, {"text": "Scikit-learn", "is_correct": False}]},
                {"text": "What does 'overfitting' mean in machine learning?", "question_type": "single_choice", "points": 10, "options": [{"text": "Model performs well on training data but poorly on new data", "is_correct": True}, {"text": "Model performs poorly on both training and test data", "is_correct": False}, {"text": "Model trains too quickly", "is_correct": False}, {"text": "Model has too few parameters", "is_correct": False}]},
                {"text": "Which of these are classification algorithms? (Select all that apply)", "question_type": "multiple_choice", "points": 15, "options": [{"text": "Logistic Regression", "is_correct": True}, {"text": "Decision Trees", "is_correct": True}, {"text": "Linear Regression", "is_correct": False}, {"text": "Random Forest", "is_correct": True}]},
                {"text": "Cross-validation helps reduce overfitting.", "question_type": "true_false", "points": 5, "options": [{"text": "True", "is_correct": True}, {"text": "False", "is_correct": False}]},
            ],
        },
    },
    {
        "title": "React Native: Build Cross-Platform Mobile Apps",
        "short_description": "Create iOS and Android apps with a single codebase using React Native",
        "description": (
            "Learn React Native from the ground up and build beautiful, performant "
            "mobile applications for both iOS and Android. Covers navigation, state "
            "management, native APIs, and publishing to app stores."
        ),
        "price": Decimal("59.99"),
        "instructor_username": "david.kim",
        "category_name": "Mobile Development",
        "sections": [
            {
                "title": "React Native Basics",
                "order": 1,
                "lessons": [
                    {"title": "Introduction to React Native", "content_type": "video", "content": "Understand React Native architecture and how it differs from React Web.", "duration_minutes": 10, "is_free": True, "order": 1},
                    {"title": "Setting Up Your Development Environment", "content_type": "text", "content": "Install Expo CLI, Android Studio, and Xcode for development.", "duration_minutes": 20, "is_free": True, "order": 2},
                    {"title": "Core Components: View, Text, Image, ScrollView", "content_type": "video", "content": "Build your first React Native screens with core components.", "duration_minutes": 18, "is_free": False, "order": 3},
                    {"title": "Styling & Layout with Flexbox", "content_type": "document", "content": "Master React Native styling using flexbox layout.", "duration_minutes": 15, "is_free": False, "order": 4},
                ],
            },
            {
                "title": "Navigation & State",
                "order": 2,
                "lessons": [
                    {"title": "React Navigation (Stack & Tab)", "content_type": "video", "content": "Add navigation between screens with stack and tab navigators.", "duration_minutes": 22, "is_free": False, "order": 1},
                    {"title": "State Management with Context & Redux", "content_type": "document", "content": "Manage global state effectively in React Native apps.", "duration_minutes": 28, "is_free": False, "order": 2},
                ],
            },
            {
                "title": "Native Features & Publishing",
                "order": 3,
                "lessons": [
                    {"title": "Camera, Location & Permissions", "content_type": "video", "content": "Access device camera, GPS, and handle permissions gracefully.", "duration_minutes": 25, "is_free": False, "order": 1},
                    {"title": "Publishing to App Store & Play Store", "content_type": "text", "content": "Build, sign, and submit your app to the Apple App Store and Google Play Store.", "duration_minutes": 30, "is_free": False, "order": 2},
                ],
            },
        ],
        "assignments": [
            {"title": "Build a Weather App UI", "description": "Create a weather app UI with React Native showing current conditions and a 7-day forecast.", "total_points": 80, "due_date_days": 7},
            {"title": "Navigation-First App", "description": "Build an app with at least 3 screens using stack and tab navigation.", "total_points": 100, "due_date_days": 14},
        ],
        "quiz": {
            "title": "React Native Fundamentals",
            "description": "Test your React Native knowledge.",
            "time_limit_minutes": 15,
            "passing_score": 60,
            "questions": [
                {"text": "What is the primary styling system used in React Native?", "question_type": "single_choice", "points": 10, "options": [{"text": "CSS-in-JS", "is_correct": False}, {"text": "Flexbox", "is_correct": True}, {"text": "Grid Layout", "is_correct": False}, {"text": "Bootstrap", "is_correct": False}]},
                {"text": "Which component is used to display images in React Native?", "question_type": "single_choice", "points": 10, "options": [{"text": "<img>", "is_correct": False}, {"text": "<Image>", "is_correct": True}, {"text": "<Picture>", "is_correct": False}, {"text": "<Photo>", "is_correct": False}]},
                {"text": "React Native allows you to write one codebase that runs on both iOS and Android.", "question_type": "true_false", "points": 5, "options": [{"text": "True", "is_correct": True}, {"text": "False", "is_correct": False}]},
            ],
        },
    },
    {
        "title": "Docker & DevOps: From Zero to Production",
        "short_description": "Containerize, deploy, and monitor applications like a pro",
        "description": (
            "Master Docker, CI/CD pipelines, cloud deployment, and monitoring. "
            "This course takes you from absolute beginner to confidently deploying "
            "containerized applications in production using AWS and GitHub Actions."
        ),
        "price": Decimal("69.99"),
        "instructor_username": "michael.chen",
        "category_name": "DevOps & Cloud",
        "sections": [
            {
                "title": "Docker Fundamentals",
                "order": 1,
                "lessons": [
                    {"title": "What is Docker & Why Use It?", "content_type": "video", "content": "Understand containers, images, and the Docker ecosystem.", "duration_minutes": 12, "is_free": True, "order": 1},
                    {"title": "Dockerfile & Docker Compose", "content_type": "video", "content": "Write Dockerfiles and use Docker Compose for multi-service apps.", "duration_minutes": 25, "is_free": True, "order": 2},
                    {"title": "Docker Volumes & Networking", "content_type": "document", "content": "Persist data and connect containers with Docker networks.", "duration_minutes": 18, "is_free": False, "order": 3},
                ],
            },
            {
                "title": "CI/CD & Cloud",
                "order": 2,
                "lessons": [
                    {"title": "GitHub Actions for CI/CD", "content_type": "video", "content": "Automate testing and deployment with GitHub Actions pipelines.", "duration_minutes": 28, "is_free": False, "order": 1},
                    {"title": "Deploying to AWS ECS", "content_type": "video", "content": "Deploy Docker containers to Amazon ECS with Fargate.", "duration_minutes": 35, "is_free": False, "order": 2},
                    {"title": "Monitoring with Prometheus & Grafana", "content_type": "text", "content": "Set up monitoring dashboards and alerts for your applications.", "duration_minutes": 20, "is_free": False, "order": 3},
                ],
            },
        ],
        "assignments": [
            {"title": "Dockerize a Django App", "description": "Create a Dockerfile and docker-compose.yml for a Django application with PostgreSQL.", "total_points": 100, "due_date_days": 7},
        ],
        "quiz": {
            "title": "Docker & DevOps Quiz",
            "description": "Test your DevOps knowledge.",
            "time_limit_minutes": 20,
            "passing_score": 60,
            "questions": [
                {"text": "What is the purpose of a Dockerfile?", "question_type": "single_choice", "points": 10, "options": [{"text": "To run a container", "is_correct": False}, {"text": "To build a Docker image", "is_correct": True}, {"text": "To push to Docker Hub", "is_correct": False}, {"text": "To stop a container", "is_correct": False}]},
                {"text": "Which of the following are container orchestration tools? (Select all that apply)", "question_type": "multiple_choice", "points": 15, "options": [{"text": "Kubernetes", "is_correct": True}, {"text": "Docker Compose", "is_correct": True}, {"text": "GitHub Actions", "is_correct": False}, {"text": "Apache Mesos", "is_correct": True}]},
            ],
        },
    },
]


class Command(BaseCommand):
    help = "Seeds the database with comprehensive demo data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Clear all existing data before seeding",
        )

    def handle(self, *args, **options):
        # UserModel is imported at module level via get_user_model()
        from courses.models import Category, Course
        from learning.models import Lesson, Section
        from assignments.models import Assignment, Submission, Grade
        from assessments.models import Attempt, Option, Question, Quiz, Result
        from enrollments.models import CourseProgress, Enrollment, LessonProgress
        from certificates.models import Certificate, CertificateTemplate
        from payments.models import Invoice, Order, Payment
        from notifications.models import Notification
        from analytics.models import ActivityLog
        from finance.models import StudentFee, InstructorSalary
        from django.db.models import Sum

        flush = options.get("flush", False)

        if flush:
            self.stdout.write(self.style.WARNING("Flushing existing data..."))
            # Delete in dependency order
            Result.objects.all().delete()
            Attempt.objects.all().delete()
            Option.objects.all().delete()
            Question.objects.all().delete()
            Quiz.objects.all().delete()
            Grade.objects.all().delete()
            Submission.objects.all().delete()
            Assignment.objects.all().delete()
            LessonProgress.objects.all().delete()
            CourseProgress.objects.all().delete()
            Certificate.objects.all().delete()
            CertificateTemplate.objects.all().delete()
            Invoice.objects.all().delete()
            Payment.objects.all().delete()
            Order.objects.all().delete()
            Enrollment.objects.all().delete()
            StudentFee.objects.all().delete()
            InstructorSalary.objects.all().delete()
            Lesson.objects.all().delete()
            Section.objects.all().delete()
            Course.objects.all().delete()
            Category.objects.all().delete()
            ActivityLog.objects.all().delete()
            Notification.objects.all().delete()
            # Don't flush users — they may include the admin
            self.stdout.write(self.style.SUCCESS("  ✓ Existing data flushed"))

        now = timezone.now()

        # ------------------------------------------------------------------
        # 1. Create Categories
        # ------------------------------------------------------------------
        self.stdout.write("\n📂 Creating categories...")
        category_map = {}
        for cat_data in CATEGORIES:
            category, created = Category.objects.get_or_create(
                name=cat_data["name"],
                defaults={"description": cat_data["description"]},
            )
            category_map[cat_data["name"]] = category
            if created:
                self.stdout.write(f"  ✓ Created category: {cat_data['name']}")
            else:
                self.stdout.write(f"  ○ Already exists: {cat_data['name']}")

        # ------------------------------------------------------------------
        # 2. Create Instructors
        # ------------------------------------------------------------------
        self.stdout.write("\n👨‍🏫 Creating instructors...")
        instructors_map = {}
        for inst_data in INSTRUCTORS:
            user, created = UserModel.objects.get_or_create(
                username=inst_data["username"],
                defaults={
                    "email": inst_data["email"],
                    "first_name": inst_data["first_name"],
                    "last_name": inst_data["last_name"],
                    "role": inst_data["role"],
                    "bio": inst_data["bio"],
                },
            )
            if created:
                user.set_password(inst_data["password"])
                user.save()
                self.stdout.write(f"  ✓ Created instructor: {inst_data['first_name']} {inst_data['last_name']}")
            else:
                self.stdout.write(f"  ○ Already exists: {inst_data['first_name']} {inst_data['last_name']}")
            instructors_map[inst_data["username"]] = user

        # ------------------------------------------------------------------
        # 3. Create Students
        # ------------------------------------------------------------------
        self.stdout.write("\n🎓 Creating students...")
        students = []
        for stu_data in STUDENTS:
            user, created = UserModel.objects.get_or_create(
                username=stu_data["username"],
                defaults={
                    "email": stu_data["email"],
                    "first_name": stu_data["first_name"],
                    "last_name": stu_data["last_name"],
                    "role": stu_data["role"],
                    "bio": stu_data["bio"],
                },
            )
            if created:
                user.set_password(stu_data["password"])
                user.save()
                self.stdout.write(f"  ✓ Created student: {stu_data['first_name']} {stu_data['last_name']}")
            else:
                self.stdout.write(f"  ○ Already exists: {stu_data['first_name']} {stu_data['last_name']}")
            students.append(user)

        # ------------------------------------------------------------------
        # 4. Create Courses with Sections, Lessons, Assignments, Quizzes
        # ------------------------------------------------------------------
        self.stdout.write("\n📚 Creating courses...")
        courses_info = []  # Track for enrollment seeding

        for course_data in COURSES_DATA:
            instructor = instructors_map[course_data["instructor_username"]]
            category = category_map[course_data["category_name"]]

            course, created = Course.objects.get_or_create(
                title=course_data["title"],
                defaults={
                    "slug": course_data["title"].lower().replace(" ", "-").replace("&", "and"),
                    "short_description": course_data["short_description"],
                    "description": course_data["description"],
                    "price": course_data["price"],
                    "instructor": instructor,
                    "category": category,
                    "status": "published",
                },
            )

            if created:
                self.stdout.write(f"  ✓ Created course: {course_data['title']}")
            else:
                self.stdout.write(f"  ○ Already exists: {course_data['title']}")
                # Update fields in case they changed
                course.price = course_data["price"]
                course.short_description = course_data["short_description"]
                course.description = course_data["description"]
                course.instructor = instructor
                course.category = category
                course.status = "published"
                course.save()

            # --- Sections & Lessons ---
            lesson_map = {}  # Track lessons by order for progress seeding
            for section_data in course_data["sections"]:
                section, _ = Section.objects.get_or_create(
                    course=course,
                    title=section_data["title"],
                    defaults={"order": section_data["order"]},
                )

                for lesson_data in section_data["lessons"]:
                    lesson_defaults = {
                        "content_type": lesson_data["content_type"],
                        "content": lesson_data["content"],
                        "duration_minutes": lesson_data["duration_minutes"],
                        "order": lesson_data["order"],
                        "is_free": lesson_data["is_free"],
                    }
                    # Set video_url for video-type lessons
                    if lesson_data["content_type"] == "video":
                        lesson_defaults["video_url"] = SAMPLE_VIDEO_URL

                    lesson, _ = Lesson.objects.get_or_create(
                        section=section,
                        course=course,
                        title=lesson_data["title"],
                        defaults=lesson_defaults,
                    )

                    # Update video_url for all existing video-type lessons
                    if lesson.content_type == "video" and lesson.video_url != SAMPLE_VIDEO_URL:
                        lesson.video_url = SAMPLE_VIDEO_URL
                        lesson.save()
                    lesson_map[lesson.order] = lesson

            # --- Assignments ---
            assignment_objects = []
            for assign_data in course_data.get("assignments", []):
                assignment, created = Assignment.objects.get_or_create(
                    course=course,
                    title=assign_data["title"],
                    defaults={
                        "description": assign_data["description"],
                        "total_points": assign_data["total_points"],
                        "due_date": now + timedelta(days=assign_data["due_date_days"]),
                        "is_published": True,
                    },
                )
                assignment_objects.append(assignment)
                if created:
                    self.stdout.write(f"    ✓ Assignment: {assign_data['title']}")

            # --- Quiz ---
            quiz_obj = None
            quiz_data = course_data.get("quiz")
            if quiz_data:
                quiz_obj, created = Quiz.objects.get_or_create(
                    course=course,
                    title=quiz_data["title"],
                    defaults={
                        "description": quiz_data["description"],
                        "time_limit_minutes": quiz_data["time_limit_minutes"],
                        "passing_score": quiz_data["passing_score"],
                        "is_published": True,
                    },
                )

                if created:
                    self.stdout.write(f"    ✓ Quiz: {quiz_data['title']}")
                    # Create questions & options
                    for q_data in quiz_data["questions"]:
                        question = Question.objects.create(
                            quiz=quiz_obj,
                            text=q_data["text"],
                            question_type=q_data["question_type"],
                            points=q_data["points"],
                        )
                        for opt_data in q_data["options"]:
                            Option.objects.create(
                                question=question,
                                text=opt_data["text"],
                                is_correct=opt_data["is_correct"],
                            )
                    self.stdout.write(f"      - {len(quiz_data['questions'])} questions created")

            courses_info.append({
                "course": course,
                "sections_data": course_data["sections"],
                "assignments": assignment_objects,
                "quiz": quiz_obj,
                "quiz_data": quiz_data,
                "lesson_map": lesson_map,
            })

        # ------------------------------------------------------------------
        # 5. Create Enrollments, Progress, Submissions, Attempts
        # ------------------------------------------------------------------
        self.stdout.write("\n📝 Creating enrollments & student activity...")

        # Each student enrolls in 2-3 courses
        enrollment_plan = {
            students[0]: [0, 1, 3],      # Alex → Python, Web Dev, React Native
            students[1]: [0, 2],          # Maria → Python, Data Science
            students[2]: [1, 2, 4],       # James → Web Dev, Data Science, DevOps
            students[3]: [0, 1],          # Priya → Python, Web Dev
            students[4]: [2, 4],          # Omar → Data Science, DevOps
            students[5]: [1, 3],          # Lily → Web Dev, React Native
        }

        for student, course_indices in enrollment_plan.items():
            for ci in course_indices:
                info = courses_info[ci]
                course = info["course"]

                enrollment, created = Enrollment.objects.get_or_create(
                    student=student,
                    course=course,
                    defaults={"status": "active"},
                )

                if not created:
                    continue

                # --- Enrollments made at staggered times ---
                days_ago = (len(course_indices) - course_indices.index(ci)) * 5 + 3
                enrollment.enrolled_at = now - timedelta(days=days_ago)
                enrollment.save()

                self.stdout.write(f"  ✓ {student.first_name} → {course.title}")

                # --- Create Course Progress ---
                progress, _ = CourseProgress.objects.get_or_create(
                    student=student,
                    course=course,
                    enrollment=enrollment,
                )

                # --- Simulate lesson progress (first few lessons completed) ---
                lessons = Lesson.objects.filter(course=course).order_by("order")
                total_lessons = lessons.count()
                completed_count = min(
                    max(1, total_lessons // 2),
                    total_lessons,
                )

                for idx, lesson in enumerate(lessons):
                    is_completed = idx < completed_count
                    LessonProgress.objects.get_or_create(
                        student=student,
                        lesson=lesson,
                        enrollment=enrollment,
                        course=course,
                        defaults={
                            "is_completed": is_completed,
                            "time_spent_minutes": lesson.duration_minutes
                            if is_completed
                            else max(1, lesson.duration_minutes // 3),
                            "completed_at": now - timedelta(days=days_ago - idx)
                            if is_completed
                            else None,
                        },
                    )

                # Update progress percentage
                progress.completion_percentage = Decimal(
                    str(round((completed_count / total_lessons) * 100, 2))
                )
                progress.is_completed = completed_count >= total_lessons
                progress.save()

                # --- Submit assignments (not all, some in progress) ---
                for idx, assignment in enumerate(info["assignments"]):
                    if idx >= 2:
                        continue  # Students submit at most 2 assignments

                    submission, sub_created = Submission.objects.get_or_create(
                        assignment=assignment,
                        student=student,
                        defaults={
                            "content": (
                                f"This is my submission for {assignment.title}.\n\n"
                                f"I have completed all the requirements outlined in the instructions. "
                                f"Please find my work attached. I've implemented the core features "
                                f"and added some extra functionality for bonus points."
                            ),
                            "status": "submitted" if idx == 0 else "graded",
                            "submitted_at": now
                            - timedelta(days=days_ago - idx * 2),
                        },
                    )

                    if sub_created:
                        self.stdout.write(f"    ✏️ {student.first_name} submitted: {assignment.title}")

                    # --- Grade some submissions ---
                    if submission.status == "graded":
                        earned = Decimal(str(assignment.total_points * 0.85))
                        Grade.objects.get_or_create(
                            submission=submission,
                            defaults={
                                "graded_by": course.instructor,
                                "points_earned": earned,
                                "feedback": (
                                    "Great work! You've demonstrated a solid understanding "
                                    "of the concepts. A few minor improvements: consider "
                                    "adding error handling and more comments. "
                                    "Overall, well done!"
                                ),
                                "is_passed": True,
                                "graded_at": now
                                - timedelta(days=days_ago - idx * 2 - 1),
                            },
                        )

                # --- Attempt quizzes ---
                if info["quiz"] and info["quiz_data"]:
                    quiz_obj = info["quiz"]
                    questions = Question.objects.filter(quiz=quiz_obj)
                    if questions.exists():
                        attempt, att_created = Attempt.objects.get_or_create(
                            quiz=quiz_obj,
                            student=student,
                            defaults={"status": "submitted"},
                        )

                        if att_created:
                            correct_count = 0
                            total_q = questions.count()

                            for question in questions:
                                correct_options = Option.objects.filter(
                                    question=question, is_correct=True
                                )

                                if question.question_type == "true_false":
                                    selected = correct_options
                                elif question.question_type == "single_choice":
                                    selected = [correct_options.order_by("?").first()]
                                else:
                                    # multiple_choice: pick all correct + maybe one wrong
                                    selected = list(correct_options)
                                    if correct_options.count() < 4:
                                        wrong = Option.objects.filter(
                                            question=question, is_correct=False
                                        ).order_by("?").first()
                                        if wrong:
                                            selected.append(wrong)

                                is_correct = set(selected) == set(correct_options)

                                result = Result.objects.create(
                                    attempt=attempt,
                                    question=question,
                                    is_correct=is_correct,
                                    points_earned=question.points if is_correct else 0,
                                )
                                result.selected_options.add(*selected)

                                if is_correct:
                                    correct_count += 1

                            score = Decimal(
                                str(round((correct_count / total_q) * 100, 2))
                            )
                            attempt.score = score
                            attempt.is_passed = score >= quiz_obj.passing_score
                            attempt.total_questions = total_q
                            attempt.correct_answers = correct_count
                            attempt.time_taken_seconds = (
                                quiz_obj.time_limit_minutes * 60 - 120
                            )
                            attempt.submitted_at = now - timedelta(days=days_ago - 1)
                            attempt.save()

                            self.stdout.write(
                                f"    📝 {student.first_name} attempted quiz: {score}% ({correct_count}/{total_q})"
                            )

        # ------------------------------------------------------------------
        # 6. Certificates for completed courses
        # ------------------------------------------------------------------
        self.stdout.write("\n🏆 Creating certificates...")
        template, _ = CertificateTemplate.objects.get_or_create(
            name="Default Certificate Template",
            defaults={
                "description": "Standard course completion certificate",
                "is_active": True,
                "layout_config": {
                    "title_font_size": 36,
                    "subtitle_font_size": 24,
                    "body_font_size": 16,
                },
            },
        )

        # James completed Data Science and DevOps, Omar completed DevOps
        cert_plan = [
            (students[2], courses_info[2]["course"]),  # James → Data Science
            (students[2], courses_info[4]["course"]),  # James → DevOps
            (students[4], courses_info[4]["course"]),  # Omar → DevOps
        ]

        for student, course in cert_plan:
            enrollment = Enrollment.objects.filter(
                student=student, course=course
            ).first()
            if enrollment:
                # Mark as completed
                enrollment.status = "completed"
                enrollment.save()

                progress = CourseProgress.objects.filter(
                    student=student, course=course
                ).first()
                if progress:
                    progress.is_completed = True
                    progress.completion_percentage = Decimal("100.00")
                    progress.save()

                cert, created = Certificate.objects.get_or_create(
                    enrollment=enrollment,
                    defaults={
                        "student": student,
                        "course": course,
                        "template": template,
                    },
                )
                if created:
                    self.stdout.write(
                        f"  ✓ {student.first_name} earned certificate: {course.title}"
                    )

        # ------------------------------------------------------------------
        # 7. Orders & Payments (for paid courses)
        # ------------------------------------------------------------------
        self.stdout.write("\n💳 Creating demo payments...")

        payment_enrollments = [
            (students[0], courses_info[1]["course"]),  # Alex → Web Dev ($49.99)
            (students[3], courses_info[1]["course"]),  # Priya → Web Dev
            (students[5], courses_info[3]["course"]),  # Lily → React Native ($59.99)
            (students[0], courses_info[3]["course"]),  # Alex → React Native
            (students[1], courses_info[2]["course"]),  # Maria → Data Science ($79.99)
            (students[4], courses_info[2]["course"]),  # Omar → Data Science
        ]

        for student, course in payment_enrollments:
            if course.price > 0:
                order, created = Order.objects.get_or_create(
                    student=student,
                    course=course,
                    defaults={
                        "amount": course.price,
                        "status": "completed" if course.price <= 50 else "completed",
                    },
                )

                if created:
                    self.stdout.write(
                        f"  ✓ {student.first_name} paid ${course.price} for {course.title}"
                    )

                    # Create payment record (no real Stripe ID for demo)
                    Payment.objects.create(
                        order=order,
                        stripe_payment_intent_id=f"pi_demo_{student.id}_{course.id}_{now.timestamp():.0f}",
                        amount=course.price,
                        status="succeeded",
                        paid_at=now - timedelta(days=5),
                    )

                    # Create invoice
                    Invoice.objects.create(
                        order=order,
                        student=student,
                        amount=course.price,
                        is_paid=True,
                    )

        # ------------------------------------------------------------------
        # 8. Activity Logs
        # ------------------------------------------------------------------
        self.stdout.write("\n📊 Creating activity logs...")
        for student in students:
            ActivityLog.objects.get_or_create(
                user=student,
                action_type="login",
                defaults={
                    "description": f"{student.first_name} logged in",
                    "created_at": now - timedelta(hours=2),
                },
            )
            ActivityLog.objects.get_or_create(
                user=student,
                action_type="enrollment",
                defaults={
                    "description": f"{student.first_name} enrolled in a course",
                    "metadata": {"student_id": student.id},
                    "created_at": now - timedelta(days=3),
                },
            )

        # ------------------------------------------------------------------
        # 9. Notifications
        # ------------------------------------------------------------------
        self.stdout.write("\n🔔 Creating sample notifications...")
        for student in students[:3]:  # Notifications for first 3 students
            Notification.objects.get_or_create(
                recipient=student,
                title="Welcome to LMS!",
                defaults={
                    "message": f"Welcome {student.first_name}! Start exploring courses and begin your learning journey.",
                    "notification_type": "in_app",
                    "created_at": now - timedelta(days=10),
                },
            )
            Notification.objects.get_or_create(
                recipient=student,
                title="New Assignment Available",
                defaults={
                    "message": "A new assignment has been posted in one of your courses.",
                    "notification_type": "in_app",
                    "link": "/my-courses",
                    "created_at": now - timedelta(days=2),
                },
            )

        # ------------------------------------------------------------------
        # 10. Create Accounts User
        # ------------------------------------------------------------------
        self.stdout.write("\n👤 Creating accounts user...")
        for acc_data in ACCOUNTS_USERS:
            user, created = UserModel.objects.get_or_create(
                username=acc_data["username"],
                defaults={
                    "email": acc_data["email"],
                    "first_name": acc_data["first_name"],
                    "last_name": acc_data["last_name"],
                    "role": acc_data["role"],
                    "bio": acc_data["bio"],
                },
            )
            if created:
                user.set_password(acc_data["password"])
                user.save()
                self.stdout.write(f"  ✓ Created accounts user: {acc_data['username']}")
            else:
                self.stdout.write(f"  ○ Already exists: {acc_data['username']}")

        # ------------------------------------------------------------------
        # 11. Create Demo Student Fees
        # ------------------------------------------------------------------
        self.stdout.write("\n💰 Creating student fee records...")
        fee_data = [
            (students[0], courses_info[0]["course"], Decimal("0"), Decimal("0")),        # Alex → Python (free)
            (students[0], courses_info[1]["course"], Decimal("49.99"), Decimal("49.99")),  # Alex → Web Dev (paid)
            (students[0], courses_info[3]["course"], Decimal("59.99"), Decimal("59.99")),  # Alex → React Native (paid)
            (students[1], courses_info[0]["course"], Decimal("0"), Decimal("0")),        # Maria → Python (free)
            (students[1], courses_info[2]["course"], Decimal("79.99"), Decimal("40.00")),  # Maria → Data Sci (partial)
            (students[2], courses_info[1]["course"], Decimal("49.99"), Decimal("49.99")),  # James → Web Dev (paid)
            (students[2], courses_info[2]["course"], Decimal("79.99"), Decimal("79.99")),  # James → Data Sci (paid)
            (students[3], courses_info[0]["course"], Decimal("0"), Decimal("0")),        # Priya → Python (free)
            (students[3], courses_info[1]["course"], Decimal("49.99"), Decimal("25.00")),  # Priya → Web Dev (partial)
            (students[4], courses_info[2]["course"], Decimal("79.99"), Decimal("0")),     # Omar → Data Sci (unpaid)
            (students[4], courses_info[4]["course"], Decimal("69.99"), Decimal("0")),     # Omar → DevOps (unpaid)
            (students[5], courses_info[3]["course"], Decimal("59.99"), Decimal("59.99")),  # Lily → React Native (paid)
        ]

        for student, course, total, paid in fee_data:
            status = "paid" if paid >= total and total > 0 else ("partial" if paid > 0 else ("paid" if total == 0 else "unpaid"))
            due_date = now + timedelta(days=30)
            paid_date = now - timedelta(days=5) if paid >= total and total > 0 else (now - timedelta(days=2) if paid > 0 else None)

            StudentFee.objects.get_or_create(
                student=student,
                course=course,
                defaults={
                    "total_fee": total,
                    "paid_amount": paid,
                    "status": status,
                    "due_date": due_date,
                    "paid_date": paid_date,
                    "notes": f"Course fee for {course.title}",
                },
            )

        self.stdout.write(f"  ✓ Created {len(fee_data)} course fee records")

        # ------------------------------------------------------------------
        # 12. Create Demo Instructor Salaries
        # ------------------------------------------------------------------
        self.stdout.write("\n💵 Creating instructor salary records...")
        instructors_list = list(instructors_map.values())
        # Compute revenue from course fees for each instructor
        fee_aggregates = {}
        for fee in StudentFee.objects.select_related("course__instructor").all():
            inst = fee.course.instructor
            key = (inst.id, now.year, now.month)
            if key not in fee_aggregates:
                fee_aggregates[key] = Decimal("0")
            fee_aggregates[key] += fee.paid_amount

        salary_data = [
            (instructors_list[0], Decimal("70"), 1, now.year),
            (instructors_list[0], Decimal("70"), 2, now.year),
            (instructors_list[1], Decimal("75"), 1, now.year),
            (instructors_list[1], Decimal("75"), 2, now.year),
            (instructors_list[2], Decimal("80"), 1, now.year),
            (instructors_list[2], Decimal("80"), 2, now.year),
            (instructors_list[3], Decimal("65"), 1, now.year),
            (instructors_list[3], Decimal("65"), 2, now.year),
        ]

        for inst, commission_pct, month, year in salary_data:
            payment_status = "paid" if month == 1 else "pending"
            payment_date = now - timedelta(days=15) if month == 1 else None

            # Compute revenue from course fees for this instructor
            inst_courses = Course.objects.filter(instructor=inst)
            total_rev = StudentFee.objects.filter(
                course__in=inst_courses
            ).aggregate(total=Sum("paid_amount"))["total"] or Decimal("0")

            InstructorSalary.objects.get_or_create(
                instructor=inst,
                month=month,
                year=year,
                defaults={
                    "commission_percentage": commission_pct,
                    "total_revenue": total_rev,
                    "bonus": Decimal("200") if month == 1 else Decimal("0"),
                    "deductions": Decimal("100") if month == 1 else Decimal("0"),
                    "payment_status": payment_status,
                    "payment_date": payment_date,
                    "notes": f"Commission-based salary for {month}/{year}",
                },
            )

        self.stdout.write(f"  ✓ Created {len(salary_data)} salary records")

        # ------------------------------------------------------------------
        # Summary
        # ------------------------------------------------------------------
        self.stdout.write(self.style.SUCCESS("\n" + "=" * 60))
        self.stdout.write(self.style.SUCCESS("✅  SEEDING COMPLETE!"))
        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(f"\n📊 Summary:")
        self.stdout.write(f"  Categories:     {Category.objects.count()}")
        self.stdout.write(f"  Instructors:    {UserModel.objects.filter(role='instructor').count()}")
        self.stdout.write(f"  Students:       {UserModel.objects.filter(role='student').count()}")
        self.stdout.write(f"  Courses:        {Course.objects.count()}")
        self.stdout.write(f"  Sections:       {Section.objects.count()}")
        self.stdout.write(f"  Lessons:        {Lesson.objects.count()}")
        self.stdout.write(f"  Assignments:    {Assignment.objects.count()}")
        self.stdout.write(f"  Quizzes:        {Quiz.objects.count()}")
        self.stdout.write(f"  Questions:      {Question.objects.count()}")
        self.stdout.write(f"  Options:        {Option.objects.count()}")
        self.stdout.write(f"  Enrollments:    {Enrollment.objects.count()}")
        self.stdout.write(f"  Submissions:    {Submission.objects.count()}")
        self.stdout.write(f"  Grades:         {Grade.objects.count()}")
        self.stdout.write(f"  Quiz Attempts:  {Attempt.objects.count()}")
        self.stdout.write(f"  Certificates:   {Certificate.objects.count()}")
        self.stdout.write(f"  Orders:         {Order.objects.count()}")
        self.stdout.write(f"  Payments:       {Payment.objects.count()}")
        self.stdout.write(f"  Notifications:  {Notification.objects.count()}")
        self.stdout.write(f"  Activity Logs:  {ActivityLog.objects.count()}")
        self.stdout.write(f"  Student Fees:   {StudentFee.objects.count()}")
        self.stdout.write(f"  Instructor Sal: {InstructorSalary.objects.count()}")

        self.stdout.write(f"\n🔑 Demo Credentials:")
        self.stdout.write(f"  All users:     password = DemoPass123!")
        self.stdout.write(f"\n  Accounts:")
        for acc in ACCOUNTS_USERS:
            self.stdout.write(f"    - {acc['username']} / {acc['password']}")
        self.stdout.write(f"\n  Instructors:")
        for inst in INSTRUCTORS:
            self.stdout.write(f"    - {inst['username']} / {inst['password']}")
        self.stdout.write(f"\n  Students:")
        for stu in STUDENTS:
            self.stdout.write(f"    - {stu['username']} / {stu['password']}")
        self.stdout.write("")
