# Netlify Omgevingsvariabelen Instructies

Voor een correcte Supabase integratie moeten de volgende omgevingsvariabelen in Netlify worden ingesteld:

## Sleutels voor configuratie

| Variabele | Waarde |
|-----------|--------|
| `SUPABASE_DATABASE_URL` | `https://yucpwawshjmonwsgvsfq.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y3B3YXdzaGptb253c2d2c2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODM1NzQsImV4cCI6MjA1ODY1OTU3NH0.L5eKYyXAqjkze2_LhnHgEbAURMRt7r2q0ITI6hhktJ0` |

## Stapsgewijze instructies

1. Ga naar je [Netlify dashboard](https://app.netlify.com/)
2. Selecteer je BrasserieBot site
3. Klik op **Site settings**
4. Ga in het linkermenu naar **Build & deploy** > **Environment**
5. Controleer de bestaande variabelen. Als ze al bestaan, bewerk ze:
   - Klik op de variabele om te bewerken
   - Vervang de waarde door de juiste uit de bovenstaande tabel
   - Klik op "Save"
6. Als de variabelen niet bestaan, klik op **Add a variable** en voeg ze toe:
   - Voer de naam in (bijv. `SUPABASE_DATABASE_URL`)
   - Voer de waarde in (bijv. `https://yucpwawshjmonwsgvsfq.supabase.co`)
   - Klik op "Save"
7. **Belangrijk**: Nadat je de variabelen hebt bijgewerkt, klik op **Deploys** en dan op **Trigger deploy** > **Deploy site** om een nieuwe build te starten

## Verificatie

Nadat de nieuwe build is voltooid, ga naar je website en navigeer naar de `/supabase-test.html` pagina om te controleren of alles correct werkt. Alle tests zouden nu moeten slagen.

## Notities

- De `SUPABASE_ANON_KEY` is speciaal gemaakt voor gebruik in de browser en heeft Row Level Security (RLS) ingesteld, wat betekent dat gebruikers alleen toegang hebben tot hun eigen gegevens.
- Deel nooit de `SUPABASE_SERVICE_ROLE_KEY` in publieke code of client-side code. Deze sleutel heeft volledige toegang tot je database en zou alleen op de server moeten worden gebruikt.
- Als je de Netlify Supabase integratie gebruikt, worden deze variabelen mogelijk automatisch ingesteld. Controleer dit in de Netlify integratie instellingen.