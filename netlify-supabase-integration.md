# Netlify Supabase Integratie Instructies

## Overzicht

De Netlify Supabase integratie maakt automatisch de verbinding tussen je Netlify site en je Supabase project. Dit is de aanbevolen methode omdat het de volgende voordelen biedt:
- Automatische omgevingsvariabelen configuratie
- Eenvoudige setup zonder handmatige stappen
- Automatische updates van sleutels bij rotatie

## Stapsgewijze Instructies

1. **Installeer de Supabase Extensie in Netlify**:
   - Ga naar je [Netlify dashboard](https://app.netlify.com/)
   - Navigeer naar je site
   - Ga naar **Integrations**
   - Zoek naar "Supabase" en klik op "Supabase Integration"
   - Klik op "Install" om de extensie te installeren

2. **Verbind je Supabase Account**:
   - Nadat de extensie is geïnstalleerd, klik op "Connect"
   - Log in bij je Supabase account als daarom wordt gevraagd
   - Selecteer het Supabase project dat je wilt verbinden (URL: `https://yucpwawshjmonwsgvsfq.supabase.co`)

3. **Configureer de Integratie**:
   - Bij het Framework selecteer je "Other"
   - Bij de Environment Variable Prefix kies je "SUPABASE" (standaard)
   - Klik op "Save" om de configuratie op te slaan

4. **Verifieer de Integratie**:
   - Netlify zal automatisch een nieuwe build starten met de nieuwe omgevingsvariabelen
   - De volgende variabelen worden automatisch ingesteld:
     - `SUPABASE_DATABASE_URL`: De URL van het Supabase project
     - `SUPABASE_SERVICE_ROLE_KEY`: De service-rol sleutel
     - `SUPABASE_ANON_KEY`: De anonieme sleutel voor browser gebruik
     - `SUPABASE_JWT_SECRET`: Het JWT-geheim voor auth

5. **Test de Integratie**:
   - Wacht tot de nieuwe build is voltooid
   - Ga naar je website en navigeer naar `/supabase-test.html`
   - Controleer of alle testen nu slagen

## Client-side Code Aanpassingen

De client-side code die we hebben geschreven verwacht de omgevingsvariabelen in de volgende indeling:

```javascript
window.ENV = {
    SUPABASE_DATABASE_URL: '{{SUPABASE_DATABASE_URL}}',
    SUPABASE_ANON_KEY: '{{SUPABASE_ANON_KEY}}'
};
```

Dit is compatibel met de Netlify Supabase integratie, omdat ons `process-html.js` script deze placeholders vervangt met de waarden uit de omgevingsvariabelen tijdens het build proces.

## Probleemoplossing

Als er nog steeds problemen zijn na het instellen van de integratie:

1. **Controleer de Build Logs**:
   - Ga naar de "Deploys" sectie in Netlify
   - Klik op de meest recente deploy
   - Bekijk de logs voor eventuele fouten

2. **Verifieer de Omgevingsvariabelen**:
   - Ga naar **Site settings** > **Build & deploy** > **Environment**
   - Controleer of de Supabase variabelen aanwezig zijn
   - De waarden zijn verborgen voor beveiliging, maar ze moeten wel aanwezig zijn

3. **Handmatige Build Trigger**:
   - Ga naar "Deploys"
   - Klik op "Trigger deploy" > "Deploy site" om een nieuwe build te forceren

4. **Supabase Tabellen Controleren**:
   - Voer het SQL script in `database/setup.sql` uit in de Supabase SQL Editor
   - Dit maakt alle benodigde tabellen, RLS-policies en indexen aan

## Belangrijk!

Zodra de Netlify Supabase integratie is ingesteld, hoef je geen handmatige omgevingsvariabelen meer in te stellen of te onderhouden. De integratie zorgt voor alles.