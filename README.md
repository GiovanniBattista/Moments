# ✨ Moments

Eine private, mobile-first WebApp für persönliche Momente – Dinge, auf die du dich freust, oder Dinge, die du im Blick behalten willst.

## Features

- **Geplanter Moment** – Zählt die Tage bis zu einem Ereignis (Geburtstag, Konzert, Reise). Zeigt „Noch X Tage", „Heute ist es soweit!" oder „War vor X Tagen".
- **Laufender Moment** – Zählt hoch, seit ein Moment begann (Gewohnheit, Projekt, Challenge). Zeigt „Läuft seit X Tagen/Stunden".
- Übersicht gruppiert in **Bevorstehend**, **Läuft seit**, **Vergangen**
- Bild-URL, Beschreibung und Farbakzent pro Moment
- Live-Aktualisierung alle 60 Sekunden ohne Seiten-Reload
- Responsive: einspaltig auf Mobile, Grid auf Desktop
- Swagger UI unter `/swagger-ui`

## Tech Stack

| Schicht     | Technologie                                 |
|-------------|---------------------------------------------|
| Backend     | Java 21, Quarkus 3.17, RESTEasy Reactive    |
| Persistenz  | Hibernate ORM + Panache, PostgreSQL         |
| Migration   | Flyway                                      |
| Frontend    | Lit 3, TypeScript, Vite                     |
| Build       | Maven 3.9, Quinoa (Frontend-Integration)    |
| Container   | Docker, docker-compose                      |

## Voraussetzungen

- Java 21+
- Maven 3.9+
- Node.js 20+ und npm (für Frontend-Build)
- Docker (für lokale PostgreSQL-Datenbank und Tests)

## Lokaler Start

```bash
# 1. PostgreSQL-Container starten
docker compose -f docker-compose.dev.yml up -d

# 2. Frontend-Abhängigkeiten installieren (nur beim ersten Mal)
cd src/main/webui && npm install && cd ../../..

# 3. Dev-Modus starten
mvn quarkus:dev
```

Im Browser **http://localhost:8080** öffnen. Quinoa startet den Vite Dev-Server automatisch im Hintergrund.

Die Datenbank ist unter `localhost:5432` erreichbar (User: `moments`, Passwort: `moments`, DB: `momentsdb`).

## Start mit Docker (Produktion)

```bash
# 1. .env.example nach .env kopieren und Werte eintragen
cp .env.example .env

# 2. Image bauen und Container starten
docker compose up --build
```

First, create your own builder if not existing:
`docker buildx create --name multiplatform --bootstrap --use --config=multiplatform_build.toml`
If your cloud uses a different CPU architecture than your development
machine (e.g., you are on a Mac M1 and your cloud provider is amd64),
you'll want to build the image for that platform, e.g.:
`docker buildx build --platform linux/arm64 -t 10.0.1.10:5000/moments:1.0.0 --push .`

Consult Docker's [getting started](https://docs.docker.com/go/get-started-sharing/)
docs for more detail on building and pushing.


Die App verbindet sich über die Umgebungsvariablen in `.env` mit einer externen PostgreSQL-Instanz.

| Variable     | Beschreibung              | Beispiel           |
|--------------|---------------------------|--------------------|
| `DB_HOST`    | PostgreSQL-Host           | `192.168.1.100`    |
| `DB_PORT`    | PostgreSQL-Port           | `5432`             |
| `DB_NAME`    | Datenbankname             | `momentsdb`        |
| `DB_USER`    | Benutzername              | `moments`          |
| `DB_PASSWORD`| Passwort                  | `secret`           |

## API-Endpunkte

| Methode | Pfad                          | Beschreibung                      |
|---------|-------------------------------|-----------------------------------|
| GET     | `/api/moments`                | Alle Momente laden                |
| GET     | `/api/moments/{id}`           | Einzelnen Moment laden            |
| POST    | `/api/moments/target-date`    | Geplanten Moment erstellen        |
| POST    | `/api/moments/since-date`     | Laufenden Moment erstellen        |
| PUT     | `/api/moments/{id}`           | Moment bearbeiten                 |
| DELETE  | `/api/moments/{id}`           | Moment löschen                    |

Vollständige API-Dokumentation: **http://localhost:8080/swagger-ui**

### Beispiel: Geplanter Moment erstellen

```bash
curl -X POST http://localhost:8080/api/moments/target-date \
  -H "Content-Type: application/json" \
  -d '{"name":"Kreuzfahrt","targetDate":"2026-08-15","description":"Mittelmeer","color":"#6366f1"}'
```

### Beispiel: Laufender Moment erstellen

```bash
curl -X POST http://localhost:8080/api/moments/since-date \
  -H "Content-Type: application/json" \
  -d '{"name":"Neue Gewohnheit: Joggen"}'
```

## Projektstruktur

```
moments/
├── src/main/java/de/moments/
│   ├── entity/Moment.java               # JPA-Entity
│   ├── enums/{MomentType,MomentStatus}  # TARGET_DATE/SINCE_DATE, UPCOMING/TODAY/PAST/RUNNING
│   ├── dto/                             # Request- und Response-Records
│   ├── service/MomentService.java       # Geschäftslogik & displayText-Berechnung
│   └── resource/MomentResource.java     # REST-Endpunkte
├── src/main/resources/
│   ├── application.properties
│   └── db/migration/V1__create_moment_table.sql
│   └── db/demo/V2__insert_demo_data.sql  # Nur im Dev-Profil geladen
├── src/main/webui/                      # Lit/TypeScript Frontend (Quinoa)
│   ├── src/app-root.ts                  # Hauptkomponente, Gruppen-Layout
│   ├── src/moment-card.ts               # Karten-Komponente
│   ├── src/moment-form-dialog.ts        # Dialog für Erstellen/Bearbeiten
│   ├── src/api-client.ts                # Fetch-Wrapper
│   └── src/types.ts                     # TypeScript-Interfaces
├── src/test/java/de/moments/
│   └── MomentResourceTest.java          # Integrationstests (@QuarkusTest)
├── Dockerfile
├── docker-compose.yml          # Produktion (externe PostgreSQL via .env)
├── docker-compose.dev.yml      # Lokale Entwicklung (PostgreSQL-Container)
├── .env.example                # Vorlage für Produktions-Umgebungsvariablen
└── README.md
```

## Tests ausführen

```bash
./mvnw test
```

Quarkus DevServices startet automatisch einen temporären PostgreSQL-Container für die Testlaufzeit – Docker muss dafür laufen. Demo-Daten werden nicht geladen (Profil `%test`).

## Nächste sinnvolle Features

- **Push-Benachrichtigungen** – Erinnerung am Tag des Moments
- **Bildupload** – Direkte Datei-Upload statt URL
- **Sortierung & Filter** – Nach Status, Datum oder Name
- **Emoji-Picker** – Für Platzhalter-Icons statt Initiale
- **PWA** – Offline-Fähigkeit, Homescreen-Icon
- **Authentifizierung** – Multi-User-Support
