# BrasserieBot System

BrasserieBot is een automatiseringssysteem voor restaurants, inclusief reservatiebeheer, voorraadbeheer, en meer.

## Onderdelen

- Frontend (Netlify gehost)
- Backend API (optioneel)
- Supabase Database Integration

## Live Installatie

- Frontend: [https://foodbookingai.netlify.app/](https://foodbookingai.netlify.app/)
- Database: Supabase

## Lokale Ontwikkeling

```bash
git clone https://github.com/user/BrasserieBot-System.git
cd BrasserieBot-System
npm install
```

### Frontend Ontwikkeling

```bash
cd frontend
npm install
# Start live server
npx live-server public
```

## Deployment

Het systeem gebruikt GitHub Actions voor automatische deployment naar Netlify wanneer code naar de main branch wordt gepusht.

### GitHub Actions Workflow

De GitHub Actions workflow voert de volgende stappen uit:
1. Valideert de infrastructuur en voert testen uit
2. Past database migraties toe op Supabase
3. Verwerkt HTML placeholders voor omgevingsvariabelen
4. Deployed de frontend naar Netlify

### Vereiste Geheimen voor GitHub

De volgende geheimen moeten worden ingesteld in GitHub:

- `SUPABASE_URL`: URL van je Supabase project
- `SUPABASE_ANON_KEY`: Anonieme sleutel voor publieke toegang
- `SUPABASE_SERVICE_ROLE_KEY`: Service rol sleutel voor administratieve acties
- `NETLIFY_AUTH_TOKEN`: Authenticatie token voor Netlify API
- `NETLIFY_SITE_ID`: ID van je Netlify site

## Features

### Reservatiebeheer

Het reservatiebeheer systeem biedt:
- Real-time reserveringen via Supabase
- Fallback naar lokale opslag wanneer offline
- Filteren op datum (vandaag, morgen, deze week)
- Statistieken van reserveringen
- Formulier voor het toevoegen en bewerken van reserveringen

### Frontend Componenten

- `dashboard.html`: Hoofddashboard met reservatiebeheer
- `supabase-client.js`: Integratie met Supabase
- `supabase-reservations.js`: Supabase-specifieke reserveringsfunctionaliteit
- `reservations-section.js`: UI voor reservatiebeheer

## Screenshots

![Dashboard](screenshots/dashboard.png)
![Reserveringen](screenshots/reservations.png)

## Supabase Schema

### Tabellen

- `reservations`: Reserveringsgegevens
  - `id`: Unieke ID (primary key)
  - `name`: Naam van de klant
  - `people`: Aantal personen
  - `date`: Datum van reservering
  - `time`: Tijd van reservering
  - `phone`: Telefoonnummer
  - `email`: E-mailadres
  - `notes`: Notities
  - `status`: Status (confirmed, pending, cancelled)

## Bijdragen

Bijdragen zijn welkom! Open een issue of stuur een PR.

## Licentie

MIT