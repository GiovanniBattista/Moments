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
| Persistenz  | Hibernate ORM + Panache, H2 (in-memory)     |
| Migration   | Flyway                                      |
| Frontend    | Lit 3, TypeScript, Vite                     |
| Build       | Maven 3.9, Quinoa (Frontend-Integration)    |
| Container   | Docker, docker-compose                      |

## Voraussetzungen

- Java 21+
- Maven 3.9+
- Node.js 20+ und npm (für Frontend-Build)

## Lokaler Start

```bash
# 1. Abhängigkeiten installieren (Frontend)
cd src/main/webui && npm install && cd ../../..

# 2. Dev-Modus starten (Backend + Vite Dev-Server)
./mvnw quarkus:dev
```

Quarkus läuft auf **http://localhost:8080**, Vite Dev-Server auf **http://localhost:5173**.  
Im Browser **http://localhost:8080** öffnen – Quinoa proxied den Frontend-Traffic automatisch.

## Start mit Docker

```bash
# Image bauen und Container starten
docker compose up --build

# App läuft auf
open http://localhost:8080
```

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
├── docker-compose.yml
└── README.md
```

## Tests ausführen

```bash
./mvnw test
```

Die Tests nutzen H2 in-memory ohne Demo-Daten (Profil `%test`).

## Nächste sinnvolle Features

- **Persistente Datenbank** – PostgreSQL statt H2 für Produktionsbetrieb
- **Push-Benachrichtigungen** – Erinnerung am Tag des Moments
- **Bildupload** – Direkte Datei-Upload statt URL
- **Sortierung & Filter** – Nach Status, Datum oder Name
- **Emoji-Picker** – Für Platzhalter-Icons statt Initiale
- **PWA** – Offline-Fähigkeit, Homescreen-Icon
- **Authentifizierung** – Multi-User-Support
