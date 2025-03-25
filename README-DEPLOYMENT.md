# BrasserieBot Deployment

Dit document bevat instructies voor het deployen van de BrasserieBot applicatie naar cloud diensten.

## Overzicht

De BrasserieBot applicatie bestaat uit verschillende componenten:

1. **Frontend**: Een Next.js applicatie die wordt gehost op Netlify
2. **Backend**: Een NestJS API die wordt gehost op Render.com
3. **Database**: Een PostgreSQL database die wordt gehost op Render.com
4. **AutoDev**: Een Node.js applicatie die wordt gehost op Render.com
5. **AutoDev Dashboard**: Een Node.js applicatie die wordt gehost op Render.com

## Vereisten

Voordat je begint, zorg ervoor dat je het volgende hebt:

- [Git](https://git-scm.com/downloads) geïnstalleerd
- [Node.js](https://nodejs.org/) (v18 of hoger) geïnstalleerd
- [GitHub](https://github.com/) account
- [Netlify](https://www.netlify.com/) account
- [Render.com](https://render.com/) account
- [GitHub CLI](https://cli.github.com/) geïnstalleerd
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) geïnstalleerd (`npm install -g netlify-cli`)
- [Claude API key](https://www.anthropic.com/) voor de AI functionaliteit
- [Pinecone](https://www.pinecone.io/) account en API key voor de vector database

## Automatische Deployment

We hebben een automatiseringsscript gemaakt dat je door het deployment proces leidt:

```powershell
# Open PowerShell als administrator
cd BrasserieBot
./deploy.ps1
```

Het script zal je door de volgende stappen leiden:

1. Controleren of alle vereiste tools zijn geïnstalleerd
2. Vragen om je GitHub gebruikersnaam, Claude API key en Pinecone API key
3. De code naar GitHub repositories pushen
4. De frontend naar Netlify deployen
5. Je helpen bij het deployen van de backend en AutoDev naar Render.com
6. De applicatie testen

## Handmatige Deployment

Als je liever handmatig wilt deployen, volg dan de stappen in het `deployment-guide.md` bestand:

```powershell
# Open het deployment guide bestand
notepad deployment-guide.md
```

## Configuratiebestanden

De volgende configuratiebestanden zijn aangemaakt voor deployment:

- `frontend/netlify.toml`: Configuratie voor Netlify deployment
- `backend/render.yaml`: Blueprint configuratie voor Render.com
- `autodev/render.yaml`: Blueprint configuratie voor Render.com

## Na de Deployment

Nadat de applicatie is gedeployed, kun je het volgende doen:

1. **Database Migraties**: Voer de database migraties uit via de Render.com shell:
   ```bash
   npx prisma migrate deploy
   ```

2. **AutoDev Kennisbank**: Initialiseer de AutoDev kennisbank via de Render.com shell:
   ```bash
   npm run initialize-knowledge-base
   ```

3. **Domein Configuratie**: Configureer een aangepast domein voor je applicatie in Netlify en Render.com

## Problemen Oplossen

Als je problemen ondervindt tijdens het deployment proces, controleer dan het volgende:

1. **Netlify Logs**: Controleer de build logs in de Netlify dashboard
2. **Render.com Logs**: Controleer de logs in de Render.com dashboard
3. **Environment Variabelen**: Controleer of alle environment variabelen correct zijn ingesteld
4. **Netwerk Toegang**: Controleer of de services met elkaar kunnen communiceren

## Ondersteuning

Als je hulp nodig hebt bij het deployment proces, neem dan contact op met het BrasserieBot team.