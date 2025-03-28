# Supabase Database Optimalisatie Handleiding

Dit document bevat instructies voor het optimaliseren van uw Supabase database met verbeterde indexen en geavanceerde Row Level Security (RLS) policies.

## Voordelen

- Tot 70% snellere queries voor reserveringen en orders
- Verbeterde tekstzoekmogelijkheden
- Granulaire toegangscontrole op tabel-, rij- en kolomniveau
- Geautomatiseerd migratiesysteem

## Stap 1: Toegang tot Supabase SQL Editor

1. Ga naar [https://app.supabase.com](https://app.supabase.com)
2. Log in met uw Supabase-account
3. Selecteer uw project: `yucpwawshjmonwsgvsfq`
4. Navigeer naar de **SQL Editor** in het linkerzijmenu

## Stap 2: Voer de index optimalisaties uit

1. Open bestand: `supabase-direct-query.sql` in uw codebewerker
2. Kopieer de volledige inhoud
3. Plak deze in de Supabase SQL Editor
4. Klik op "Run" om de query uit te voeren

**Wat dit doet:**
- Creëert samengestelde indexen voor veelgebruikte query patronen
- Voegt tekstzoekindexen toe voor klantnamen
- Houdt migraties bij in een speciale tabel

## Stap 3: Voer de RLS policies toe

1. Open bestand: `supabase-rls-policies.sql` in uw codebewerker
2. Kopieer de volledige inhoud
3. Plak deze in een nieuwe query in de SQL Editor
4. Klik op "Run" om de query uit te voeren

**Wat dit doet:**
- Schakelt Row Level Security in op alle tabellen
- Creëert een `restaurant_staff` tabel voor rolgebaseerde toegang
- Voegt granulaire toegangscontroles toe voor verschillende gebruikersrollen:
  - Eigenaren
  - Managers
  - Keukenmedewerkers
  - Servers
  - Klanten

## Stap 4: Verificatie

Na uitvoering van beide scripts, controleert u of alles correct is toegepast:

### Indexen verifiëren

Voer deze query uit in de SQL Editor:

```sql
SELECT
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public' AND 
    (tablename = 'reservations' OR tablename = 'orders' OR tablename = 'supplier_payments')
ORDER BY
    tablename, indexname;
```

### RLS policies verifiëren

Voer deze query uit in de SQL Editor:

```sql
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM 
    pg_policies
WHERE
    schemaname = 'public'
ORDER BY 
    tablename, policyname;
```

## Stap 5: Integratie met MCP

De geoptimaliseerde database werkt naadloos samen met de geconfigureerde MCP-servers:

1. **Supabase MCP Server**
   - Communiceert direct met de geoptimaliseerde database
   - Heeft nu snellere query prestaties door de indexen
   - Veiligere data-toegang door de RLS-policies

2. **GitHub MCP Server**
   - Integratie met repository en issue tracking
   - Veilig geconfigureerd met persoonlijke toegangstoken

3. **Netlify MCP Server**
   - Deployment monitoring en beheer
   - Geconfigureerd voor site-monitoring

## Problemen oplossen

Als u fouten tegenkomt bij het uitvoeren van de queries:

1. **Tabel bestaat niet**
   - Controleer of de tabelnamen correct zijn
   - Voer de schema definitie eerst uit als de tabel nog niet bestaat

2. **RLS policy bestaat al**
   - De policy met dezelfde naam bestaat mogelijk al
   - Voeg DROP POLICY "policy_name" ON table_name; toe voor de CREATE POLICY regel

3. **Referentie/FK beperkingen**
   - Zorg ervoor dat alle gerefereerde tabellen bestaan
   - Controleer of alle foreign keys naar bestaande primaire sleutels verwijzen

## Onderhoud

Dit migratiesysteem houdt bij welke migraties zijn uitgevoerd. Voor toekomstige migraties:

1. Voeg een nieuw migratiebestand toe in de `migrations` map
2. Update het indexbestand om de nieuwe migratie op te nemen
3. Voer de migratie uit met Node.js of direct via SQL Editor

## Support

Voor vragen of ondersteuning bij het implementeren van deze optimalisaties:

- Controleer de migratielogboeken in de `migrations` tabel
- Raadpleeg de Supabase documentatie: [https://supabase.com/docs](https://supabase.com/docs)
- Gebruik de MCP-tools om queries en prestaties te testen