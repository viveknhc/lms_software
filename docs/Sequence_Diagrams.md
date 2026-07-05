# LMS Sequence Diagrams

## Course Enrollment

``` text
Student -> Frontend : Select Course
Frontend -> API : Enrollment Request
API -> Database : Create Enrollment
Database -> API : Success
API -> Frontend : Enrollment Confirmed
```

## Quiz Submission

``` text
Student -> Frontend : Submit Quiz
Frontend -> API : Answers
API -> Assessment Engine : Evaluate
Assessment Engine -> Database : Save Result
API -> Frontend : Score
```
