# BrasserieBot Database Migratie Systeem

Dit systeem beheert database migraties voor de BrasserieBot applicatie. Het zorgt voor gestructureerde en volgordelijke updates van het databaseschema en data.

## Structuur

```
database/
├── migrations/              # Bevat alle migratie scripts
│   ├── 001_initial_schema.js  # Initieel schema
│   ├── 002_optimize_indexes.js # Index optimalisaties
│   ├── index.js             # Centraal migratie systeem
│   └── package.json         # Migratie dependencies
├── schema.prisma            # Prisma schema definitie
├── .env                     # Database configuratie
└── README.md                # Deze documentatie
```

## Installatie

```bash
cd database/migrations
npm install
```

## Gebruik

Om alle migraties uit te voeren:

```bash
cd database/migrations
npm run migrate
```

## Migraties Toevoegen

1. Maak een nieuw bestand aan in de migrations folder met een oplopend nummer: `00X_descriptive_name.js`
2. Implementeer de migratie functie volgens het bestaande patroon:

```javascript
// Migration: 00X_descriptive_name.js
const myMigration = async (supabase) => {
  console.log('Uitvoeren migratie 00X: Mijn migratie...');
  
  // Implementeer je migratie logica
  const { error } = await supabase.rpc('run_migration_00X', {
    sql: `
      -- SQL statements hier
    `
  });
  
  if (error) {
    console.error('Migratie 00X fout:', error);
    throw error;
  }
  
  console.log('Migratie 00X succesvol uitgevoerd');
  return true;
};

module.exports = myMigration;
```

3. Voeg de migratie toe aan de `index.js` file:

```javascript
// In index.js toevoegen:
const myMigration = require('./00X_descriptive_name');

// In de migrations array:
const migrations = [
  { name: '001_initial_schema', run: initialSchema },
  { name: '002_optimize_indexes', run: optimizeIndexes },
  { name: '00X_descriptive_name', run: myMigration },
  // ...
];
```

## Voordelen

- Automatische bijhouding van uitgevoerde migraties
- Transactionele uitvoering van migraties
- Idempotente migraties (veilig om meerdere keren uit te voeren)
- Centrale logging en foutafhandeling

## Integratie met MCP Servers

De nieuw geïmplementeerde database indexen zijn beschikbaar via de Supabase MCP server. Deze indexen verbeteren de query performance aanzienlijk, vooral voor:

- Reserveringen op restaurant en datum
- Orders op restaurant en status
- Tekstzoekfunctionaliteit voor klantnamen