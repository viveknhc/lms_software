# LMS ER Diagram

``` text
User
 ├── StudentProfile
 ├── InstructorProfile
 └── AdminProfile

Course
 ├── Section
 │    └── Lesson
 ├── Enrollment
 ├── Quiz
 ├── Assignment
 └── Certificate

Quiz
 ├── Question
 ├── Option
 └── Result

Assignment
 └── Submission

Payment
 └── Invoice
```
