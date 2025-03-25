# BrasserieBot Deployment Handleiding

Deze handleiding leidt je door het proces om de BrasserieBot applicatie te deployen naar cloud diensten.

## Vereisten

- GitHub account
- Netlify account
- Render.com account
- Supabase account
- Claude API key
- Pinecone account en API key

## Stap 1: Push de code naar GitHub

Eerst moeten we de code naar GitHub repositories pushen:

```bash
# Maak repositories aan op GitHub voor elk onderdeel
# Frontend repository
cd BrasserieBot/frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/jouw-username/brasserie-bot-frontend.git
git push -u origin main

# Backend repository
cd ../backend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/jouw-username/brasserie-bot-backend.git
git push -u origin main

# AutoDev repository
cd ../autodev
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/jouw-username/brasserie-bot-autodev.git
git push -u origin main
```

## Stap 2: Zet de database op in Supabase

1. Ga naar [Supabase](https://supabase.com/) en log in
2. Klik op "New Project"
3. Vul de projectdetails in:
   - Naam: brasserie-bot
   - Database wachtwoord: [kies een sterk wachtwoord]
   - Regio: Frankfurt (eu-central-1)
4. Klik op "Create new project"
5. Wacht tot het project is aangemaakt
6. Ga naar "Settings" > "Database" en kopieer de "Connection string"
7. Vervang `[YOUR-PASSWORD]` in de connection string door het wachtwoord dat je hebt gekozen

## Stap 3: Deploy de frontend naar Netlify

1. Ga naar [Netlify](https://www.netlify.com/) en log in
2. Klik op "Add new site" > "Import an existing project"
3. Kies "GitHub" als Git provider
4. Selecteer de `brasserie-bot-frontend` repository
5. Configureer de build instellingen:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Klik op "Show advanced" en voeg de volgende environment variabelen toe:
   - `NEXT_PUBLIC_API_URL`: [laat dit voorlopig leeg, we vullen dit later in]
7. Klik op "Deploy site"
8. Wacht tot de deployment is voltooid
9. Ga naar "Site settings" > "Domain management" en pas de site naam aan of voeg een custom domein toe

## Stap 4: Deploy de backend en AutoDev naar Render.com

1. Ga naar [Render.com](https://render.com/) en log in
2. Klik op "New" > "Blueprint"
3. Kies "GitHub" als Git provider en verbind je account
4. Selecteer de `brasserie-bot-backend` repository
5. Klik op "Apply Blueprint"
6. Vul de volgende environment variabelen in:
   - `JWT_SECRET`: [genereer een willekeurige string]
   - `CLAUDE_API_KEY`: [je Claude API key]
   - `PINECONE_API_KEY`: [je Pinecone API key]
7. Klik op "Create Resources"
8. Wacht tot alle services zijn gedeployed
9. Herhaal stappen 2-7 voor de `brasserie-bot-autodev` repository

## Stap 5: Configureer de database migraties

1. Ga naar de Render.com dashboard
2. Klik op de `brasserie-bot-api` service
3. Ga naar "Shell"
4. Voer het volgende commando uit om de database migraties uit te voeren:
   ```bash
   npx prisma migrate deploy
   ```

## Stap 6: Update de frontend API URL

1. Ga terug naar de Netlify dashboard
2. Klik op je site
3. Ga naar "Site settings" > "Environment variables"
4. Bewerk de `NEXT_PUBLIC_API_URL` variabele en vul de URL van je backend API in (bijv. `https://brasserie-bot-api.onrender.com`)
5. Klik op "Save"
6. Ga naar "Deploys" en klik op "Trigger deploy" > "Deploy site"

## Stap 7: Initialiseer de AutoDev kennisbank

1. Ga naar de Render.com dashboard
2. Klik op de `brasserie-bot-autodev` service
3. Ga naar "Shell"
4. Voer het volgende commando uit om de kennisbank te initialiseren:
   ```bash
   npm run initialize-knowledge-base
   ```

## Stap 8: Test de applicatie

1. Ga naar je Netlify site URL
2. Log in met de standaard gebruiker (of maak een nieuwe gebruiker aan)
3. Controleer of alle functionaliteiten werken
4. Ga naar de AutoDev dashboard URL (bijv. `https://brasserie-bot-autodev-dashboard.onrender.com`)
5. Controleer of het AutoDev dashboard correct werkt

## Gefeliciteerd!

Je hebt de BrasserieBot applicatie succesvol gedeployed naar de cloud! De applicatie is nu beschikbaar op:

- Frontend: [je Netlify URL]
- Backend API: [je Render.com backend URL]
- AutoDev: [je Render.com AutoDev URL]
- AutoDev Dashboard: [je Render.com AutoDev Dashboard URL]