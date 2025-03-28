# GitHub Secrets Configuratie Handleiding

Om de GitHub Actions workflow correct te laten functioneren, moeten de volgende secrets worden geconfigureerd in je GitHub repository.

## Benodigde Secrets

| Secret Naam | Beschrijving | Voorbeeld Waarde |
|-------------|--------------|-----------------|
| `SUPABASE_URL` | De URL van je Supabase project | `https://yucpwawshjmonwsgvsfq.supabase.co` |
| `SUPABASE_ANON_KEY` | De anonieme/public key van Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | De service role key (admin) van Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NETLIFY_AUTH_TOKEN` | De Netlify personal access token | `ZgWxK-gVgQw7Uy9Gss_ZyGXBm3-QOQxEOBHmmxaQx6A` |
| `NETLIFY_SITE_ID` | De Netlify site ID | `fb-brasserie-bot` |

## Stappen voor Configuratie

1. Ga naar je GitHub repository: `https://github.com/FoodBookingBe/BrasserieBot-System`
2. Klik op "Settings" in de navigatiebalk bovenaan
3. Scroll naar beneden en klik op "Secrets and variables" in het menu aan de linkerkant
4. Kies "Actions" in het submenu
5. Klik op de groene knop "New repository secret"
6. Voeg elk van de bovenstaande secrets toe:
   - Vul bij "Name" de exacte naam in (bijv. `SUPABASE_URL`)
   - Vul bij "Value" de juiste waarde in
   - Klik op "Add secret"
7. Herhaal stap 6 voor alle benodigde secrets

## Secrets Waarden Ophalen

### Supabase Credentials

1. Open het [Supabase Dashboard](https://app.supabase.com)
2. Selecteer je project: `BrasserieBot`
3. Ga naar "Project Settings" -> "API"
4. Hier vind je de "Project URL" (voor `SUPABASE_URL`)
5. Onder "Project API keys" vind je:
   - "anon public" key voor `SUPABASE_ANON_KEY` 
   - "service_role" key voor `SUPABASE_SERVICE_ROLE_KEY`

### Netlify Credentials

1. Open het [Netlify Dashboard](https://app.netlify.com)
2. Ga naar je accountinstellingen (klik op je avatar rechtsboven)
3. Ga naar "Applications" -> "Personal access tokens"
4. Klik op "New access token" om een nieuw token te maken (voor `NETLIFY_AUTH_TOKEN`)
5. Ga terug naar je site dashboard en klik op de site
6. In de URL zie je iets als `app.netlify.com/sites/{SITE_ID}/overview`
7. Gebruik deze site ID voor `NETLIFY_SITE_ID`

## Verificatie

Nadat je alle secrets hebt toegevoegd, kun je een kleine wijziging pushen naar de main branch om te verifiëren dat de workflow correct werkt:

1. Maak een kleine wijziging in een bestand
2. Commit en push de wijziging naar de main branch
3. Ga naar de "Actions" tab in je GitHub repository
4. Controleer of de workflow automatisch is gestart en succesvol wordt voltooid

## Probleemoplossing

Als de workflow faalt, check de volgende zaken:

- Controleer of alle secret namen exact overeenkomen met wat in de workflow file staat
- Verifieer dat de secrets geldige waarden hebben
- Bekijk de logs van de gefaalde workflow voor specifieke foutmeldingen