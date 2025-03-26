# Netlify Deployment Guide voor BrasserieBot-System

[![Netlify Status](https://api.netlify.com/api/v1/badges/54f0d686-505e-42c9-a1e4-bd88412d859c/deploy-status)](https://app.netlify.com/sites/foodbookingai/deploys)

Deze gids legt uit hoe je de BrasserieBot-System frontend kunt deployen naar Netlify met optimale configuratie.

## Inhoudsopgave
1. [Vereisten](#vereisten)
2. [Deployen naar Netlify](#deployen-naar-netlify)
3. [Geavanceerde Configuratie](#geavanceerde-configuratie)
4. [Lokaal Testen met Netlify CLI](#lokaal-testen-met-netlify-cli)
5. [Netlify Functions](#netlify-functions)
6. [SEO Optimalisaties](#seo-optimalisaties)
7. [Prestatie Optimalisaties](#prestatie-optimalisaties)
8. [Probleemoplossing](#probleemoplossing)

## Vereisten

- Een GitHub account verbonden met Netlify
- Repository met de BrasserieBot-System code gepusht naar GitHub
- Node.js versie 18 of hoger

## Deployen naar Netlify

### Stap 1: Verbinden met GitHub

1. Log in op [Netlify](https://app.netlify.com/)
2. Klik op "Add new site" > "Import an existing project"
3. Selecteer GitHub als je Git provider
4. Autoriseer Netlify om toegang te krijgen tot je GitHub repositories
5. Selecteer de repository met de BrasserieBot-System code

### Stap 2: Deployment Instellingen Configureren

Op het deployment configuratiescherm, vul de volgende instellingen in:

| Instelling | Waarde |
| ------- | ----- |
| **Team** | Selecteer je team (meestal je gebruikersnaam) |
| **Site name** | `foodbookingai` (of je voorkeursnaam) |
| **Branch to deploy** | `main` |
| **Base directory** | `BrasserieBot-System/frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `.next` |

### Stap 3: Geavanceerde Build Instellingen

#### Environment Variables

Voeg deze environment variables toe:

| Naam | Waarde |
| ---- | ----- |
| `NODE_VERSION` | `18` |
| `NEXT_PUBLIC_API_URL` | `https://brasserie-bot-api.onrender.com` |
| `TURBO_FORCE` | `true` |

Voeg eventueel andere environment variables toe die je applicatie nodig heeft:

- Authenticatie/API sleutels
- Service IDs
- Feature flags

#### Build Hooks (Optioneel)

Als je builds automatisch wilt triggeren wanneer je backend wordt bijgewerkt:

1. Ga naar Site settings > Build & deploy > Continuous deployment
2. Scroll naar "Build hooks" en klik op "Add build hook"
3. Geef het een naam (bijv. "Backend Update") en selecteer de branch
4. Sla de webhook URL op en configureer je backend deployment om deze te triggeren

### Stap 4: Domain Instellingen (Optioneel)

Om een custom domain te gebruiken:

1. Ga naar Site settings > Domain management
2. Klik op "Add custom domain"
3. Voer je domeinnaam in en volg de DNS configuratie stappen

## Geavanceerde Configuratie

### netlify.toml

De `netlify.toml` bevat alle belangrijke configuratie-instellingen:

- Build commando's en publicatie directory
- Environment variables
- Plugins voor prestatie optimalisatie
- Beveiligingsheaders
- Redirects voor client-side routing
- Cache instellingen

### _redirects

Het `_redirects` bestand in de public map zorgt voor:
- Forceren van HTTPS
- API proxying voor CORS problemen
- Fallback naar index.html voor client-side routing
- Beveiliging door blokkeren van toegang tot bepaalde bestanden

## Lokaal Testen met Netlify CLI

De Netlify CLI is toegevoegd aan het project. Hiermee kun je lokaal testen hoe je app op Netlify zal draaien:

```bash
# Installeer dependencies (als dat nog niet is gedaan)
npm install

# Start lokale Netlify ontwikkelserver
npm run netlify:dev

# Bouw project voor deployment
npm run netlify:build

# Deploy naar Netlify (na inloggen)
npm run netlify:deploy
```

## Netlify Functions

Er zijn Netlify Functions geconfigureerd in de `netlify/functions/` map:

- `api-health.js`: Controleert of de backend API beschikbaar is

Om je eigen Netlify Functions toe te voegen:
1. Maak een nieuw JavaScript of TypeScript bestand in de `netlify/functions/` map
2. Exporteer een `handler` functie met de Netlify Functions API
3. De functie is toegankelijk via `/.netlify/functions/je-functie-naam`

## SEO Optimalisaties

### Sitemap

De `sitemap.xml` in de public map zorgt voor betere indexering door zoekmachines. Voeg hier pagina's aan toe wanneer je nieuwe routes toevoegt aan je applicatie.

### Robots.txt

De `robots.txt` in de public map bepaalt welke delen van je site gecrawld mogen worden door zoekmachines.

## Prestatie Optimalisaties

De volgende optimalisaties zijn geconfigureerd:

- **Plugin Next.js**: Specifiek voor optimale Next.js integratie
- **Caching Plugin**: Verbetert laadtijden voor herhaalde bezoekers
- **Lighthouse Plugin**: Voert automatisch prestatie-audits uit
- **Critical CSS Inline**: Versnelt de initiële paginarendering
- **Gzip Compressie**: Minimaliseert bestandsgrootte

## Probleemoplossing

### Build Fouten

- **Probleem**: Next.js build faalt
  - **Oplossing**: Controleer of de Next.js configuratie correct is in `next.config.ts`

- **Probleem**: Module not found errors
  - **Oplossing**: Zorg dat alle dependencies in package.json staan en niet alleen lokaal geïnstalleerd zijn

### Routing Problemen

- **Probleem**: Routes werken lokaal maar tonen 404 op Netlify
  - **Oplossing**: Controleer of de redirects in `netlify.toml` en `_redirects` correct zijn geconfigureerd

### API Verbindingsproblemen

- **Probleem**: Frontend kan geen verbinding maken met backend
  - **Oplossing**: Verifieer de `NEXT_PUBLIC_API_URL` en controleer of de backend toegankelijk is

## Belangrijke Opmerkingen

- Zorg altijd dat de frontend compatibel is met de backend API versie
- Test lokaal voordat je naar Netlify deployt met `npm run build`
- Gebruik Netlify's deploy previews voor pull requests om wijzigingen te testen voordat je ze merged