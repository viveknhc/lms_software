# LMS System Architecture

``` text
Users (Student/Instructor/Admin)
            |
            v
      Frontend (React/Django Templates)
            |
            v
        API Gateway
            |
    Django REST Framework
            |
+-----------+------------+-------------+
|            |            |             |
Accounts   Courses   Assessments   Analytics
|            |            |             |
+------------+------------+-------------+
             |
        PostgreSQL
             |
      Redis / File Storage
```

## Components

-   Presentation Layer
-   API Layer
-   Business Logic Layer
-   Data Access Layer
-   Storage Layer
