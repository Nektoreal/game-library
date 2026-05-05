# Game Library

A web application for managing your personal game collection.

## Software stack
- Java 21 + Spring Boot 3
- PostgreSQL + Spring Data JPA
- Spring Security + JWT authorization
- HTML / CSS / JavaScript

## Features
- User registration and login
- JWT authorization
- Adding games to a personal collection
- Statuses: Playing, Completed, Dropped, Planned
- Each user can only see their own games

## Getting Started
## Getting Started
1. Create a database: `CREATE DATABASE gamelibrary;`
2. Configure the `backend/src/main/resources/application.properties` file
3. Run the backend: `./mvnw spring-boot:run`
4. Open the `frontend/index.html` file via Live Server