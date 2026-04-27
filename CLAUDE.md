# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install frontend dependencies (first time or after package.json changes)
cd src/main/webui && npm install && cd ../../..

# Start dev mode (Quarkus + Vite dev server via Quinoa)
./mvnw quarkus:dev

# Run all tests
./mvnw test

# Build production JAR
./mvnw package -DskipTests

# Run single test class
./mvnw test -Dtest=MomentResourceTest

# Build and run with Docker
docker compose up --build
```

The dev server runs at **http://localhost:8080** (Quarkus) and **http://localhost:5173** (Vite). Quinoa bridges both automatically.

## Architecture

### Backend (Quarkus + Hibernate Panache)

The backend follows a **Resource → Service → Entity** layering:

- `MomentResource` – thin REST layer, delegates all logic to `MomentService`
- `MomentService` – business logic: CRUD and `toResponse()` which computes `status`, `displayText`, and `sortKey` server-side
- `Moment` (Panache Active Record) – single entity, uses `@PrePersist`/`@PreUpdate` for `createdAt`/`updatedAt`

**Key domain types:**
- `MomentType.TARGET_DATE` – has `targetDate` (LocalDate), displayed as countdown/countup in days
- `MomentType.SINCE_DATE` – has `startTime` (Instant), displayed as elapsed time in days/hours/minutes
- `MomentStatus` – `UPCOMING`, `TODAY`, `PAST`, `RUNNING` – computed in `MomentService.toResponse()`

**Display text logic** lives exclusively in `MomentService.toResponse()`. Day calculations use `ChronoUnit.DAYS.between(today, target)` with `LocalDate.now(ZoneId.systemDefault())` to avoid off-by-one errors.

**Database:** H2 in-memory (dev/test). Flyway migrations in two locations:
- `classpath:db/migration` – schema (runs always, including tests)
- `classpath:db/demo` – demo data (dev only; `%test.quarkus.flyway.locations` excludes it)

### Frontend (Lit Web Components + TypeScript + Vite)

Bundled via **Quinoa** – frontend build runs as part of `mvn package`, Vite dev server is auto-started during `quarkus:dev`.

Component tree:
```
app-root          – loads all moments, groups into sections, owns refresh timer (60s)
  moment-card     – displays a single moment card with edit/delete events
  moment-form-dialog – <dialog>-based modal for create (target/since) and edit
```

`api-client.ts` is a plain module (not a Lit component) that wraps all `/api/moments` fetch calls.

**Live updates:** `app-root` polls the backend every 60 seconds via `setInterval` in `connectedCallback` (cleaned up in `disconnectedCallback`).

**Routing:** None – single-page, all state in component properties.

### REST endpoint conventions

- `POST /api/moments/target-date` – `CreateTargetDateMomentRequest` (name + targetDate required)
- `POST /api/moments/since-date` – `CreateSinceDateMomentRequest` (name required; startTime defaults to `Instant.now()`)
- `PUT /api/moments/{id}` – `UpdateMomentRequest` (type-specific validation in service, not DTO)
- Validation failures return HTTP 400 via `quarkus-hibernate-validator`
- 404s thrown as `jakarta.ws.rs.NotFoundException`

### Test profile

`%test.quarkus.quinoa.enabled=false` disables the frontend build during tests. Tests use `@QuarkusTest` with RestAssured against a clean H2 schema (no demo data).

Each test class uses `@BeforeEach @Transactional void cleanDb() { Moment.deleteAll(); }` to ensure full test isolation — the shared in-memory H2 would otherwise accumulate data across tests.
