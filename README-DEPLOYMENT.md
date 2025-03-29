# BrasserieBot Deployment Guide

Deze gids bevat instructies voor het deployen van het BrasserieBot systeem naar Netlify via GitHub Actions.

## Vereisten

- GitHub account
- Netlify account
- Supabase account
- Node.js (versie 18 of hoger)

## Stap 1: GitHub Repository Configuratie

1. Clone deze repository naar je lokale machine:
   ```bash
   git clone https://github.com/jouw-username/BrasserieBot-System.git
   cd BrasserieBot-System
   ```

2. Installeer de benodigde dependencies:
   ```bash
   npm install
   ```

3. Configureer de GitHub secrets met het configuratiescript:
   ```bash
   node scripts/configure-github-secrets.js
   ```
   
   Het script zal je vragen om de volgende gegevens in te voeren:
   - GitHub gebruikersnaam
   - GitHub repository naam
   - GitHub persoonlijke toegangstoken
   - Supabase URL
   - Supabase anonieme sleutel
   - Supabase service role sleutel
   - Netlify auth token
   - Netlify site ID

## Stap 2: Supabase Configuratie

1. Ga naar het [Supabase Dashboard](https://app.supabase.io)
2. Selecteer je project
3. Ga naar 'Settings' > 'API'
4. Kopieer de URL en anonieme sleutel
5. Ga naar 'Settings' > 'Service Role'
6. Kopieer de service role sleutel

Deze gegevens heb je nodig voor het configureren van de GitHub secrets.

## Stap 3: Netlify Configuratie

1. Ga naar het [Netlify Dashboard](https://app.netlify.com)
2. Klik op 'New site from Git'
3. Selecteer GitHub als je Git provider
4. Selecteer de BrasserieBot-System repository
5. Stel de build instellingen in:
   - Build command: `npm run process-html`
   - Publish directory: `./frontend/public`
6. Klik op 'Advanced settings' en voeg de volgende environment variabelen toe:
   - `SUPABASE_DATABASE_URL`: Je Supabase project URL
   - `SUPABASE_ANON_KEY`: Je Supabase anonieme sleutel
7. Klik op 'Deploy site'
8. Ga naar 'Site settings' > 'General' > 'Site details'
9. Kopieer de site ID (je vindt dit in de API ID sectie)
10. Ga naar 'User settings' > 'Applications'
11. Genereer een nieuw personal access token

De site ID en personal access token heb je nodig voor het configureren van de GitHub secrets.

## Stap 4: GitHub Actions Workflow Activeren

De repository bevat al een GitHub Actions workflow bestand: `.github/workflows/deploy.yml`. Deze workflow wordt automatisch uitgevoerd bij elke push naar de main branch.

1. Push je wijzigingen naar de main branch:
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

2. Ga naar de 'Actions' tab in je GitHub repository om de workflow uitvoering te bekijken.

3. De workflow zal de volgende stappen uitvoeren:
   - Validatie en tests
   - Database migraties (alleen bij push naar main)
   - Frontend deployment naar Netlify (alleen bij push naar main)

## Stap 5: Verifiëren van de Deployment

1. Controleer of de deployment succesvol is voltooid in de GitHub Actions tab.
2. Bezoek je Netlify site URL om te controleren of de applicatie correct werkt.
3. De URL van je site is te vinden in het Netlify dashboard.

## Probleemoplossing

### Connectie Tester

De frontend bevat een ingebouwde connectietest component (rechtsonder in beeld) waarmee je de connectie met Supabase kunt controleren. Als er problemen zijn met de connectie, worden deze hier weergegeven.

### Lokaal Testen

Je kunt de applicatie lokaal testen voordat je deze deployt:

1. Voer het process-html script uit:
   ```bash
   npm run process-html
   ```

2. Open de frontend in een browser:
   ```bash
   open frontend/public/index.html
   ```

### Foutopsporing

Als de GitHub Actions workflow faalt, controleer dan de volgende punten:

1. Zorg ervoor dat alle GitHub secrets correct zijn geconfigureerd.
2. Controleer of de Supabase en Netlify URLs en tokens correct zijn en niet verlopen.
3. Bekijk de GitHub Actions logs voor specifieke foutmeldingen.

## Handleiding bijwerken frontend

Als je wijzigingen aan de frontend wilt aanbrengen:

1. Bewerk de bestanden in de `frontend/public` map.
2. Test je wijzigingen lokaal.
3. Commit en push je wijzigingen naar de main branch.
4. De GitHub Actions workflow zal automatisch worden uitgevoerd en je wijzigingen deployen.

## Contactgegevens

Voor vragen of problemen met de deployment, neem contact op met het BrasserieBot team.