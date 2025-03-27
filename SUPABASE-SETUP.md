# Supabase Setup voor BrasserieBot

Deze handleiding helpt je bij het configureren van Supabase als backend voor de BrasserieBot applicatie, en het verbinden ervan met de Netlify deployment. Volg deze stappen zorgvuldig om een correcte configuratie te garanderen.

## 1. Supabase Project aanmaken

1. Ga naar [Supabase](https://supabase.com/) en maak een account aan als je die nog niet hebt
2. Log in op het Supabase dashboard
3. Klik op "New Project" om een nieuw project aan te maken
4. Vul de volgende informatie in:
   - **Name**: BrasserieBot (of een naam naar keuze)
   - **Database Password**: Maak een sterk wachtwoord aan
   - **Region**: Kies een regio die dicht bij jouw klanten ligt (bijv. West-Europa)
   - **Pricing Plan**: Start met het gratis plan
5. Klik op "Create new project" en wacht tot het project is aangemaakt

## 2. Database tabellen aanmaken

Nadat je project is opgezet, moet je de benodigde database tabellen aanmaken. Gebruik de Supabase SQL editor om de volgende queries uit te voeren:

### Reserveringen tabel

```sql
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  guests INTEGER NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zorg voor Row Level Security
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Maak een policy zodat alleen ingelogde gebruikers toegang hebben
CREATE POLICY "Ingelogde gebruikers hebben volledige toegang" ON reservations
  FOR ALL USING (auth.role() = 'authenticated');
```

### Menu items tabel

```sql
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  available BOOLEAN DEFAULT TRUE,
  popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zorg voor Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Maak een policy zodat alleen ingelogde gebruikers toegang hebben
CREATE POLICY "Ingelogde gebruikers hebben volledige toegang" ON menu_items
  FOR ALL USING (auth.role() = 'authenticated');
```

### Klanten tabel

```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  visits INTEGER DEFAULT 0,
  last_visit DATE,
  preferences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zorg voor Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Maak een policy zodat alleen ingelogde gebruikers toegang hebben
CREATE POLICY "Ingelogde gebruikers hebben volledige toegang" ON customers
  FOR ALL USING (auth.role() = 'authenticated');
```

### Bestellingen tabel

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  table_number INTEGER,
  customer_name TEXT,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zorg voor Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Maak een policy zodat alleen ingelogde gebruikers toegang hebben
CREATE POLICY "Ingelogde gebruikers hebben volledige toegang" ON orders
  FOR ALL USING (auth.role() = 'authenticated');
```

## 3. Authenticatie instellen

Supabase heeft ingebouwde authenticatie die we gebruiken voor de BrasserieBot applicatie.

1. Ga naar "Authentication" in het Supabase dashboard
2. Klik op "Settings"
3. Zorg ervoor dat "Email" onder "Providers" is ingeschakeld
4. Onder "Email Templates", kun je de e-mailtemplates aanpassen naar jouw voorkeur

## 4. Testgebruiker aanmaken

We gebruiken de Supabase interface om een testgebruiker aan te maken:

1. Ga naar "Authentication" in het Supabase dashboard
2. Klik op "Users" 
3. Klik op "Add User"
4. Vul de volgende informatie in:
   - **Email**: admin@brasseriebot.com
   - **Password**: admin123 (in productie, gebruik een sterk wachtwoord!)
   - **Custom User Metadata**:
     ```json
     {
       "role": "admin",
       "restaurantName": "Demo Restaurant"
     }
     ```
5. Klik op "Save" om de gebruiker aan te maken

## 5. API Keys verzamelen

Om de Netlify-Supabase integratie te configureren, heb je twee belangrijke waarden nodig:

1. Ga naar "Project Settings" > "API" in het Supabase dashboard
2. Kopieer de volgende waarden:
   - **URL**: De "Project URL" (https://your-project-id.supabase.co)
   - **anon/public Key**: Dit is de anonieme API sleutel

## 6. Netlify configuratie

Nu je Supabase hebt geconfigureerd, moet je Netlify instellen om de Supabase sleutels te gebruiken:

1. Log in op je [Netlify dashboard](https://app.netlify.com/)
2. Ga naar je BrasserieBot site (of maak een nieuwe aan als je dat nog niet hebt gedaan)
3. Ga naar "Site settings" > "Build & deploy" > "Environment"
4. Klik op "Add environment variable" en voeg de volgende variabelen toe:
   - **SUPABASE_URL**: De URL die je in stap 5 hebt gekopieerd
   - **SUPABASE_ANON_KEY**: De anonieme API sleutel die je in stap 5 hebt gekopieerd
5. Klik op "Save" voor elke variabele
6. Ga naar de Netlify installatie sectie en zoek naar de "Supabase Integration"
7. Klik op "Enable integration" en volg de stappen om het aan je site te koppelen
8. Kies het Supabase project dat je in stap 1 hebt aangemaakt
9. Bevestig de integratie

## 7. Herdeployen van de site

Nadat je de omgevingsvariabelen hebt ingesteld en de Supabase-integratie hebt ingeschakeld, moet je de site herdeployen om de wijzigingen toe te passen:

1. Ga naar "Deploys" in je Netlify dashboard
2. Klik op "Trigger deploy" > "Deploy site"
3. Wacht tot de deployment is voltooid

## 8. Testen van de integratie

Nadat de deployment is voltooid, kun je de integratie testen:

1. Ga naar je Netlify-site (bijvoorbeeld https://brasseriebot.netlify.app)
2. Log in met de testgebruiker die je in stap 4 hebt aangemaakt:
   - **Gebruikersnaam**: admin
   - **Wachtwoord**: admin123
3. Controleer of je correct wordt ingelogd en toegang hebt tot het dashboard
4. Test de verschillende functies die gebruik maken van Supabase, zoals het toevoegen van een reservering

## Probleemoplossing

Als je problemen ondervindt met de integratie, controleer dan het volgende:

1. **Omgevingsvariabelen**: Controleer of de SUPABASE_URL en SUPABASE_ANON_KEY correct zijn ingesteld in Netlify
2. **Console**: Open de browserconsole (F12) om te zien of er foutmeldingen zijn
3. **Netlify Functions**: Controleer de functielogs in het Netlify dashboard voor eventuele fouten
4. **Supabase Logs**: Bekijk de logs in het Supabase dashboard om te zien of er authenticatie- of databaseproblemen zijn

## Volgende stappen

Na de basis setup kun je de volgende aanvullende configuraties overwegen:

1. **Custom Domains**: Configureer een aangepast domein in Netlify
2. **Realtime Updates**: Configureer Supabase Realtime voor live updates zonder pagina's te vernieuwen
3. **Storage**: Configureer Supabase Storage voor het opslaan van afbeeldingen en bestanden
4. **Security**: Verfijn de Row Level Security policies voor betere databescherming
5. **Testing**: Voeg een testomgeving toe voor het testen van nieuwe functies

---

Bij vragen of problemen met deze setup, raadpleeg de [Supabase documentatie](https://supabase.com/docs) of de [Netlify documentatie](https://docs.netlify.com/).