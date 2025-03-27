# Netlify en Supabase Configuratie Handleiding

## Stap 1: Supabase Gegevens Verzamelen

Je hebt de volgende Supabase gegevens nodig om de koppeling te configureren:

1. **Supabase Database URL**: `https://yucpwawshjmonwsgvsfq.supabase.co`
2. **Supabase Anonymous Key**: Je anonieme API sleutel (deel deze niet in broncode)
3. **Service Role Key**: Alleen nodig voor administratieve taken (deel deze NOOIT)

## Stap 2: Netlify Omgevingsvariabelen Instellen

1. Log in op je [Netlify dashboard](https://app.netlify.com/)
2. Ga naar je BrasserieBot site
3. Ga naar **Site settings** > **Build & deploy** > **Environment**
4. Klik op **Add a variable** en voeg de volgende environment variables toe:

   | Sleutel | Waarde |
   |---------|--------|
   | `SUPABASE_DATABASE_URL` | `https://yucpwawshjmonwsgvsfq.supabase.co` |
   | `SUPABASE_ANON_KEY` | *Jouw Supabase anon key* |

5. Klik op **Save** voor elke variabele

> ⚠️ **BELANGRIJK**: Voeg NOOIT geheime sleutels toe aan de broncode of commit ze in Git. Gebruik altijd omgevingsvariabelen voor gevoelige informatie.

## Stap 3: Netlify Supabase Integratie

1. Ga naar de **Integrations** sectie in je Netlify dashboard
2. Zoek naar "Supabase" in de marketplace
3. Klik op **Enable integration**
4. Volg de stappen om je Supabase project te verbinden
5. Kies je project met URL `https://yucpwawshjmonwsgvsfq.supabase.co`

## Stap 4: Netlify Deploy Instellingen

Zorg ervoor dat je build-instellingen correct zijn:

1. Ga naar **Site settings** > **Build & deploy** > **Build settings**
2. Zorg ervoor dat de volgende instellingen overeenkomen met je netlify.toml:
   - **Base directory**: Niet ingesteld (leeg)
   - **Build command**: `node frontend/public/process-html.js`
   - **Publish directory**: `frontend/public`

## Stap 5: Testen van de Integratie

1. Deploy je site opnieuw met deze nieuwe instellingen:
   - Ga naar **Deploys** in je Netlify dashboard
   - Klik op **Trigger deploy** > **Deploy site**
   
2. Nadat de deploy is voltooid, navigeer naar `/supabase-test.html` op je site
   - Bijvoorbeeld: `https://foodbookingai.netlify.app/supabase-test.html`
   
3. Doorloop de testen om te bevestigen dat alles correct werkt

## Problemen Oplossen

Als je problemen ondervindt:

1. Controleer je Netlify deploy logs voor eventuele fouten
2. Controleer of de omgevingsvariabelen correct zijn ingesteld
3. Gebruik de Supabase testtool om specifieke verbindingsproblemen te identificeren
4. Controleer de Supabase dashboard voor tabellen en RLS-configuratie

Als je hulp nodig hebt, verwijs naar de volledige documentatie in SUPABASE-SETUP.md